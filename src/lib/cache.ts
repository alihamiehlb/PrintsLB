type RedisCommand = (string | number)[]

interface RedisRestResponse<T = unknown> {
  result?: T
  error?: string
}

// Read lazily per request: on Cloudflare Workers `process.env` is populated
// from the request's Cloudflare context, not at module-initialization time.
function getRedisCreds(): { url?: string; token?: string } {
  return {
    url: process.env.REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
  }
}

export function isCacheConfigured(): boolean {
  const { url, token } = getRedisCreds()
  return Boolean(url && token)
}

async function redisCommand<T>(command: RedisCommand): Promise<T | null> {
  const { url: redisUrl, token: redisToken } = getRedisCreds()
  if (!redisUrl || !redisToken) return null

  try {
    const response = await fetch(redisUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${redisToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
      cache: 'no-store',
    })

    if (!response.ok) return null

    const data = (await response.json()) as RedisRestResponse<T>
    if (data.error) {
      console.error('Redis cache error:', data.error)
      return null
    }
    return data.result ?? null
  } catch (error) {
    console.error('Redis cache request failed:', error)
    return null
  }
}

export async function getCachedJson<T>(key: string): Promise<T | null> {
  const value = await redisCommand<string>(['GET', key])
  if (!value) return null

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export async function setCachedJson<T>(
  key: string,
  value: T,
  ttlSeconds = 60
): Promise<void> {
  await redisCommand(['SET', key, JSON.stringify(value), 'EX', ttlSeconds])
}
