import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

// Prisma is configured Rust-free (engineType = "client"), so the client always
// needs a driver adapter. On Cloudflare Workers we bind it to the D1 database
// from the request's Cloudflare context; the binding is stable per isolate so a
// lazily-created singleton is safe and avoids re-instantiating on every call.
let client: PrismaClient | undefined

function resolveD1(): D1Database | undefined {
  // 1) OpenNext Cloudflare context (production + wrangler dev)
  try {
    // Lazy require so this module stays importable during `next build`.
    const { getCloudflareContext } = require('@opennextjs/cloudflare') as {
      getCloudflareContext: () => { env: Record<string, unknown> }
    }
    const env = getCloudflareContext()?.env as { DB?: D1Database } | undefined
    if (env?.DB) return env.DB
  } catch {
    /* not running inside a Cloudflare context */
  }

  // 2) Fallback for any globally-injected env
  try {
    const globalEnv = (globalThis as unknown as {
      __openNextCloudflareEnv?: { DB?: D1Database }
    }).__openNextCloudflareEnv
    if (globalEnv?.DB) return globalEnv.DB
  } catch {
    /* ignore */
  }

  return undefined
}

export function getPrisma(d1?: D1Database): PrismaClient {
  const db = d1 ?? resolveD1()
  if (!db) {
    throw new Error(
      'No D1 database binding available. Prisma (Rust-free) requires the Cloudflare D1 adapter.'
    )
  }
  if (!client) {
    client = new PrismaClient({ adapter: new PrismaD1(db) })
  }
  return client
}

/**
 * Lazy proxy so existing `import { prisma }` call sites keep working without
 * constructing a client at module load (which would break `next build`, where
 * no Cloudflare context exists yet). The real client is created on first use.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const instance = getPrisma()
    const value = (instance as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(instance) : value
  },
})
