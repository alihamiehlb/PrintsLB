import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { checkRateLimit, getClientIp, type RateLimitRule } from '@/lib/rate-limit'

/**
 * Edge middleware: rate limiting, automatic IP banning and security headers.
 *
 * This complements (does NOT replace) the Cloudflare WAF, which is the primary
 * DDoS / volumetric protection layer at the edge. See DEPLOYMENT.md.
 */

// Stricter budgets for sensitive endpoints, looser for general browsing.
// NOTE: limits are per-isolate (see rate-limit.ts) and act as a second line of
// defense behind the Cloudflare WAF, so they're deliberately generous to avoid
// false positives during normal browsing (NextAuth polls /api/auth/session on
// every page + window focus).
const LOGIN_RULE: RateLimitRule = { limit: 20, windowMs: 60_000, banThreshold: 12, banMs: 10 * 60_000 }
const API_RULE: RateLimitRule = { limit: 200, windowMs: 60_000, banThreshold: 25, banMs: 5 * 60_000 }
const PAGE_RULE: RateLimitRule = { limit: 400, windowMs: 60_000, banThreshold: 25, banMs: 5 * 60_000 }

// Only genuine credential-submission endpoints get the strict budget. NextAuth
// housekeeping (session/csrf/providers/_log/error) is polled frequently and must
// NOT be treated as a login attempt, or normal users get banned instantly.
function isLoginSubmission(pathname: string): boolean {
  return (
    pathname.startsWith('/api/auth/callback/credentials') ||
    pathname.startsWith('/api/auth/register') ||
    pathname.startsWith('/api/auth/signup')
  )
}

function ruleFor(pathname: string): { rule: RateLimitRule; bucket: string } {
  if (isLoginSubmission(pathname)) {
    return { rule: LOGIN_RULE, bucket: 'login' }
  }
  if (pathname.startsWith('/api')) {
    return { rule: API_RULE, bucket: 'api' }
  }
  return { rule: PAGE_RULE, bucket: 'page' }
}

// Content-Security-Policy. Allows: self, Google OAuth/Analytics, R2/CDN images,
// inline styles (required by Tailwind/Next), and blob/data for media + canvas.
// Tightened for better XSS protection
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://accounts.google.com https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https: http:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://accounts.google.com https://challenges.cloudflare.com",
  "frame-src https://accounts.google.com https://challenges.cloudflare.com",
  "worker-src 'self' blob:",
  'upgrade-insecure-requests',
].join('; ')

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('X-DNS-Prefetch-Control', 'off')
  res.headers.set('Content-Security-Policy', CSP)
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  res.headers.set('Cross-Origin-Resource-Policy', 'same-origin')
  res.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  )
  res.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )
  // Additional security headers
  res.headers.set('X-XSS-Protection', '1; mode=block')
  res.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')
  return res
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Never rate-limit the branded block page itself.
  if (pathname === '/blocked') {
    return applySecurityHeaders(NextResponse.next())
  }

  const ip = getClientIp(req.headers)
  const { rule, bucket } = ruleFor(pathname)

  const result = checkRateLimit(ip, rule, bucket)

  if (!result.allowed) {
    const accept = req.headers.get('accept') ?? ''
    const wantsHtml = accept.includes('text/html') && !pathname.startsWith('/api')

    if (wantsHtml) {
      const url = req.nextUrl.clone()
      url.pathname = '/blocked'
      url.searchParams.set('reason', result.banned ? 'banned' : 'rate')
      url.searchParams.set('retry', String(result.retryAfter))
      const res = NextResponse.redirect(url, { status: result.banned ? 403 : 429 })
      res.headers.set('Retry-After', String(result.retryAfter))
      return applySecurityHeaders(res)
    }

    const res = NextResponse.json(
      {
        error: result.banned ? 'Access temporarily blocked' : 'Too many requests',
        retryAfter: result.retryAfter,
      },
      { status: result.banned ? 403 : 429 }
    )
    res.headers.set('Retry-After', String(result.retryAfter))
    res.headers.set('X-RateLimit-Limit', String(result.limit))
    res.headers.set('X-RateLimit-Remaining', '0')
    return applySecurityHeaders(res)
  }

  const res = NextResponse.next()
  res.headers.set('X-RateLimit-Limit', String(result.limit))
  res.headers.set('X-RateLimit-Remaining', String(result.remaining))
  return applySecurityHeaders(res)
}

export const config = {
  // Run on everything except static assets and the optimizer.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|llms.txt|robots.txt|sitemap.xml|hero-video.mp4|hero-poster.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|txt)$).*)',
  ],
}
