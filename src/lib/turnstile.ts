/**
 * Cloudflare Turnstile server-side verification.
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

interface TurnstileVerifyResponse {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
}

export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY)
}

export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string | null
): Promise<{ ok: true } | { ok: false; error: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY

  if (!secret) {
    // Allow local dev without Turnstile configured
    if (process.env.NODE_ENV === 'development') {
      return { ok: true }
    }
    console.error('TURNSTILE_SECRET_KEY is not configured')
    return { ok: false, error: 'Captcha is not configured' }
  }

  if (!token) {
    return { ok: false, error: 'Captcha verification required' }
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  })
  if (remoteIp) {
    body.set('remoteip', remoteIp)
  }

  try {
    const res = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      }
    )

    if (!res.ok) {
      return { ok: false, error: 'Captcha verification failed' }
    }

    const data = (await res.json()) as TurnstileVerifyResponse
    if (!data.success) {
      return { ok: false, error: 'Captcha verification failed' }
    }

    return { ok: true }
  } catch (err) {
    console.error('Turnstile verify error:', err)
    return { ok: false, error: 'Captcha verification failed' }
  }
}
