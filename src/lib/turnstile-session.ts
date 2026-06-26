/** Browser-session cache so users only see the captcha challenge once per tab. */

const STORAGE_KEY = 'plb_turnstile_session'
/** UX window — hide the widget for this long after a successful check. */
const SESSION_TTL_MS = 30 * 60 * 1000
/** Turnstile tokens expire server-side after ~5 min; refresh before that. */
export const TOKEN_MAX_AGE_MS = 4 * 60 * 1000

export interface TurnstileSession {
  token: string
  verifiedAt: number
}

export function getTurnstileSession(): TurnstileSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as TurnstileSession
    if (!parsed.token || !parsed.verifiedAt) return null
    if (Date.now() - parsed.verifiedAt > SESSION_TTL_MS) {
      sessionStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function setTurnstileSession(token: string): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ token, verifiedAt: Date.now() } satisfies TurnstileSession)
  )
}

export function clearTurnstileSession(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(STORAGE_KEY)
}

export function isTurnstileSessionFresh(): boolean {
  const session = getTurnstileSession()
  if (!session) return false
  return Date.now() - session.verifiedAt < TOKEN_MAX_AGE_MS
}
