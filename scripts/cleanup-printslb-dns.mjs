#!/usr/bin/env node
/**
 * Clean printslb.com DNS for Worker custom-domain attachment.
 * Requires CLOUDFLARE_API_TOKEN with Zone.DNS Read + Edit on printslb.com.
 *
 * Usage:
 *   CLOUDFLARE_API_TOKEN=... npm run cf:dns-cleanup
 */

const TOKEN = process.env.CLOUDFLARE_API_TOKEN
const ZONE_NAME = 'printslb.com'

if (!TOKEN) {
  console.error('Set CLOUDFLARE_API_TOKEN (needs Zone → DNS → Edit).')
  process.exit(1)
}

async function api(path, options = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })
  const data = await res.json()
  if (!data.success) {
    const msg = data.errors?.map((e) => `[${e.code}] ${e.message}`).join('; ') ?? res.statusText
    throw new Error(msg)
  }
  return data.result
}

function shouldDelete(record) {
  const name = record.name
  const type = record.type
  const content = record.content ?? ''

  // Keep Google Search Console verification
  if (type === 'TXT' && content.includes('google-site-verification')) {
    return false
  }

  // Remove old Vercel verification
  if (type === 'TXT' && (name.startsWith('_vercel') || content.includes('vc-domain-verify'))) {
    return true
  }

  // Remove duplicate apex / www records — Worker custom domain will recreate
  if (type === 'A' && (name === ZONE_NAME || name === `www.${ZONE_NAME}`)) {
    return true
  }
  if (type === 'AAAA' && (name === ZONE_NAME || name === `www.${ZONE_NAME}`)) {
    return true
  }
  if (type === 'CNAME' && name === `www.${ZONE_NAME}`) {
    return true
  }

  return false
}

async function main() {
  console.log('PrintsLB DNS cleanup for', ZONE_NAME)

  const zones = await api(`/zones?name=${ZONE_NAME}`)
  const active = zones.filter((z) => z.status === 'active')
  if (active.length === 0) {
    throw new Error(`No active zone found for ${ZONE_NAME}`)
  }
  if (active.length > 1) {
    console.warn(`Warning: ${active.length} active zones named ${ZONE_NAME} — using newest.`)
  }

  const zone = active.sort((a, b) => new Date(b.created_on) - new Date(a.created_on))[0]
  console.log(`Zone: ${zone.id} (${zone.status})`)

  const records = await api(`/zones/${zone.id}/dns_records?per_page=100`)
  console.log(`Found ${records.length} record(s)\n`)

  let deleted = 0
  let kept = 0

  for (const record of records) {
    if (shouldDelete(record)) {
      console.log(`DELETE  ${record.type} ${record.name} → ${record.content}`)
      await api(`/zones/${zone.id}/dns_records/${record.id}`, { method: 'DELETE' })
      deleted++
    } else {
      console.log(`KEEP    ${record.type} ${record.name} → ${record.content}`)
      kept++
    }
  }

  console.log(`\nDone. Deleted ${deleted}, kept ${kept}.`)
  console.log('\nNext: uncomment routes in wrangler.jsonc and run npm run deploy')
}

main().catch((err) => {
  console.error('\nFailed:', err.message)
  if (String(err.message).includes('Authentication')) {
    console.error(
      '\nYour API token needs: Zone → DNS → Read + Edit for printslb.com.\n' +
        'Create at: https://dash.cloudflare.com/profile/api-tokens'
    )
  }
  process.exit(1)
})
