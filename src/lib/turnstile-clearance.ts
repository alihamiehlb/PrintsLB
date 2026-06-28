import type { NextRequest } from 'next/server'

export const TURNSTILE_CLEARANCE_COOKIE = 'plb_turnstile_clearance'
export const TURNSTILE_CLEARANCE_TTL_MS = 30 * 60 * 1000

function getSigningSecret(): string | null {
  return process.env.NEXTAUTH_SECRET || process.env.TURNSTILE_SECRET_KEY || null
}

function base64Url(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function sign(payload: string): Promise<string | null> {
  const secret = getSigningSecret()
  if (!secret) return null

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload)
  )
  return base64Url(new Uint8Array(signature))
}

export async function createTurnstileClearance(): Promise<string | null> {
  const verifiedAt = Date.now().toString()
  const signature = await sign(verifiedAt)
  return signature ? `${verifiedAt}.${signature}` : null
}

export async function isTurnstileClearanceValid(
  value: string | null | undefined
): Promise<boolean> {
  if (!value) return false

  const [verifiedAt, signature] = value.split('.')
  if (!verifiedAt || !signature) return false

  const timestamp = Number(verifiedAt)
  if (!Number.isFinite(timestamp)) return false
  if (Date.now() - timestamp > TURNSTILE_CLEARANCE_TTL_MS) return false

  const expected = await sign(verifiedAt)
  return Boolean(expected && expected === signature)
}

export async function hasTurnstileClearance(
  request: NextRequest | { headers?: Record<string, string | undefined> }
): Promise<boolean> {
  if ('cookies' in request) {
    return isTurnstileClearanceValid(
      request.cookies.get(TURNSTILE_CLEARANCE_COOKIE)?.value
    )
  }

  const headers = request.headers as Record<string, string | undefined> | undefined
  const cookieHeader = headers
    ? (headers.cookie || headers.Cookie || headers.COOKIE)
    : undefined

  const cookie = cookieHeader
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${TURNSTILE_CLEARANCE_COOKIE}=`))
    ?.split('=')
    .slice(1)
    .join('=')

  return isTurnstileClearanceValid(cookie)
}
