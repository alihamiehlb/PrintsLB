#!/usr/bin/env node
/**
 * Provision Cloudflare Turnstile + WAF hardening for PrintsLB.
 *
 * Usage:
 *   CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=fc8761363df4a7a310cc35ed41d1c809 node scripts/setup-cloudflare-security.mjs
 *
 * Optional:
 *   ZONE_NAME=printslb.com   (defaults to printslb.com, falls back to first zone in account)
 */

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? 'fc8761363df4a7a310cc35ed41d1c809'
const ZONE_NAME = process.env.ZONE_NAME ?? 'printslb.com'
const TOKEN = process.env.CLOUDFLARE_API_TOKEN

if (!TOKEN) {
  console.error('Missing CLOUDFLARE_API_TOKEN')
  process.exit(1)
}

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
}

async function api(path, options = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers ?? {}) },
  })
  const data = await res.json()
  if (!data.success) {
    const msg = data.errors?.map((e) => `[${e.code}] ${e.message}`).join('; ') ?? res.statusText
    throw new Error(msg)
  }
  return data.result
}

async function createTurnstileWidget() {
  console.log('\n=== Turnstile ===')
  const result = await api(`/accounts/${ACCOUNT_ID}/challenges/widgets`, {
    method: 'POST',
    body: JSON.stringify({
      name: 'PrintsLB',
      domains: [
        'printslb.com',
        'www.printslb.com',
        'printslb.alihamiehlb.workers.dev',
        'localhost',
        '127.0.0.1',
      ],
      mode: 'managed',
    }),
  })

  console.log('Site key (NEXT_PUBLIC_TURNSTILE_SITE_KEY):', result.sitekey)
  console.log('Secret key (TURNSTILE_SECRET_KEY):', result.secret)
  console.log('\nAdd to GitHub Secrets + run:')
  console.log(`  gh secret set NEXT_PUBLIC_TURNSTILE_SITE_KEY --body "${result.sitekey}"`)
  console.log(`  gh secret set TURNSTILE_SECRET_KEY --body "${result.secret}"`)
  console.log(`  echo "${result.secret}" | npx wrangler secret put TURNSTILE_SECRET_KEY`)
  return result
}

async function findZone() {
  const zones = await api(`/zones?account.id=${ACCOUNT_ID}&per_page=50`)
  return zones.find((z) => z.name === ZONE_NAME) ?? zones[0] ?? null
}

async function enableBotFightMode(zoneId) {
  console.log('\n=== Bot Fight Mode ===')
  await api(`/zones/${zoneId}/bot_management`, {
    method: 'PUT',
    body: JSON.stringify({
      fight_mode: true,
      ai_bots_protection: 'block',
    }),
  })
  console.log('Enabled Bot Fight Mode + blocked AI bots')
}

async function setSecurityLevel(zoneId) {
  console.log('\n=== Security Level ===')
  await api(`/zones/${zoneId}/settings/security_level`, {
    method: 'PATCH',
    body: JSON.stringify({ value: 'medium' }),
  })
  console.log('Security level set to medium')
}

async function createRateLimitRules(zoneId) {
  console.log('\n=== WAF Rate Limiting Rules ===')

  const rules = [
    {
      description: 'PrintsLB: throttle auth/admin API',
      expression: '(http.request.uri.path contains "/api/auth" or http.request.uri.path contains "/api/admin")',
      action: 'block',
      ratelimit: {
        characteristics: ['ip.src'],
        period: 60,
        requests_per_period: 10,
        mitigation_timeout: 600,
      },
    },
    {
      description: 'PrintsLB: throttle general API',
      expression: 'http.request.uri.path contains "/api/"',
      action: 'managed_challenge',
      ratelimit: {
        characteristics: ['ip.src'],
        period: 60,
        requests_per_period: 60,
        mitigation_timeout: 300,
      },
    },
    {
      description: 'PrintsLB: throttle all traffic',
      expression: 'true',
      action: 'managed_challenge',
      ratelimit: {
        characteristics: ['ip.src'],
        period: 60,
        requests_per_period: 200,
        mitigation_timeout: 120,
      },
    },
  ]

  try {
    const entrypoint = await api(`/zones/${zoneId}/rulesets/phases/http_ratelimit/entrypoint`)
    const existing = entrypoint?.rules ?? []

    await api(`/zones/${zoneId}/rulesets/${entrypoint.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        rules: [...existing, ...rules],
      }),
    })
    console.log(`Added ${rules.length} rate-limit rules to zone`)
  } catch (err) {
    console.warn('Could not create rate-limit rules via API:', err.message)
    console.warn('Create them manually in Cloudflare → Security → WAF → Rate limiting rules')
  }
}

async function main() {
  console.log('PrintsLB Cloudflare security setup')
  console.log('Account:', ACCOUNT_ID)

  await createTurnstileWidget()

  const zone = await findZone()
  if (!zone) {
    console.warn(`\nNo zone found for "${ZONE_NAME}". WAF rules skipped.`)
    console.warn('After moving printslb.com to this account, re-run this script.')
    return
  }

  console.log(`\nUsing zone: ${zone.name} (${zone.id})`)

  if (zone.name !== ZONE_NAME) {
    console.warn(`Warning: "${ZONE_NAME}" not found — using "${zone.name}" instead.`)
    console.warn('Re-run after printslb.com is in this account for production WAF.')
  }

  await enableBotFightMode(zone.id)
  await setSecurityLevel(zone.id)

  if (zone.name === ZONE_NAME) {
    await createRateLimitRules(zone.id)
  } else {
    console.log('\nSkipping rate-limit rules until printslb.com zone is active on this account.')
  }

  console.log('\nDone.')
}

main().catch((err) => {
  console.error('\nFailed:', err.message)
  process.exit(1)
})
