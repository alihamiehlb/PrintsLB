/// <reference types="@cloudflare/workers-types" />

export interface CloudflareEnv {
  DB: D1Database
  IMAGES: R2Bucket
  UPLOADS: R2Bucket
  NEXTAUTH_SECRET?: string
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  TELEGRAM_BOT_TOKEN?: string
  TELEGRAM_CHAT_ID?: string
  R2_PUBLIC_URL?: string
  REDIS_REST_URL?: string
  REDIS_REST_TOKEN?: string
  UPSTASH_REDIS_REST_URL?: string
  UPSTASH_REDIS_REST_TOKEN?: string
}

export function getCloudflareEnv(): CloudflareEnv | null {
  try {
    // @ts-expect-error — injected by OpenNext on Cloudflare Workers
    const env = globalThis.__openNextCloudflareEnv as CloudflareEnv | undefined
    return env ?? null
  } catch {
    return null
  }
}

export async function uploadToR2(
  bucket: R2Bucket,
  key: string,
  data: ArrayBuffer | Uint8Array,
  contentType: string
): Promise<string> {
  await bucket.put(key, data, {
    httpMetadata: { contentType },
  })
  return key
}

export function getPublicImageUrl(key: string): string {
  const base = process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL
  if (base) {
    return `${base.replace(/\/$/, '')}/${key}`
  }
  const encoded = key.split('/').map(encodeURIComponent).join('/')
  return `/api/images/${encoded}`
}
