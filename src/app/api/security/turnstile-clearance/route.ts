import { NextRequest, NextResponse } from 'next/server'
import { parseJsonBody } from '@/lib/json'
import { getClientIp } from '@/lib/rate-limit'
import { verifyTurnstileToken, isTurnstileConfigured } from '@/lib/turnstile'
import {
  createTurnstileClearance,
  TURNSTILE_CLEARANCE_COOKIE,
  TURNSTILE_CLEARANCE_TTL_MS,
} from '@/lib/turnstile-clearance'

export async function POST(request: NextRequest) {
  const { token } = await parseJsonBody<{ token?: string }>(request)

  if (isTurnstileConfigured()) {
    const captcha = await verifyTurnstileToken(token, getClientIp(request.headers))
    if (!captcha.ok) {
      return NextResponse.json({ error: captcha.error }, { status: 400 })
    }
  }

  const clearance = await createTurnstileClearance()
  if (!clearance) {
    return NextResponse.json(
      { error: 'Security check is not configured' },
      { status: 500 }
    )
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(TURNSTILE_CLEARANCE_COOKIE, clearance, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(TURNSTILE_CLEARANCE_TTL_MS / 1000),
  })

  return response
}
