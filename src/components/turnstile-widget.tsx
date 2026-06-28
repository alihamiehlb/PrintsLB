'use client'

import Script from 'next/script'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { CheckCircle2, Loader2, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  clearTurnstileSession,
  getTurnstileSession,
  isTurnstileSessionFresh,
  setTurnstileSession,
} from '@/lib/turnstile-session'

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback?: (token: string) => void
          'expired-callback'?: () => void
          'error-callback'?: () => void
          theme?: 'light' | 'dark' | 'auto'
          size?: 'normal' | 'compact'
        }
      ) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
    }
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void
  onExpire?: () => void
  onError?: () => void
  className?: string
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
export const TURNSTILE_ENABLED = Boolean(SITE_KEY)

type WidgetPhase = 'loading' | 'challenge' | 'verified' | 'error'

export function TurnstileWidget({
  onVerify,
  onExpire,
  onError,
  className,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [scriptReady, setScriptReady] = useState(false)
  const [phase, setPhase] = useState<WidgetPhase>('loading')
  const [sessionReuse, setSessionReuse] = useState(false)
  const reactId = useId()

  const callbacksRef = useRef({ onVerify, onExpire, onError })
  useEffect(() => {
    callbacksRef.current = { onVerify, onExpire, onError }
  }, [onVerify, onExpire, onError])

  const handleVerify = useCallback(
    async (token: string) => {
      try {
        setTurnstileSession(token)
        setPhase('verified')
        callbacksRef.current.onVerify(token)
      } catch {
        clearTurnstileSession()
        setPhase('error')
        callbacksRef.current.onError?.()
      }
    },
    []
  )

  // Reuse verification once per browser tab session.
  useEffect(() => {
    const cached = getTurnstileSession()
    if (cached && isTurnstileSessionFresh()) {
      setSessionReuse(true)
      setPhase('verified')
      callbacksRef.current.onVerify(cached.token)
    }
  }, [])

  useEffect(() => {
    if (!scriptReady || !SITE_KEY || !containerRef.current || !window.turnstile) {
      return
    }

    if (phase === 'verified') {
      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
      return
    }

    if (phase === 'error') {
      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
      return
    }

    if (widgetIdRef.current) {
      return
    }

    // Fresh session: show challenge. Reused session: refresh token silently in background.
    if (!sessionReuse) {
      setPhase('loading')
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: SITE_KEY,
      callback: handleVerify,
      'expired-callback': () => {
        clearTurnstileSession()
        setSessionReuse(false)
        setPhase('challenge')
        callbacksRef.current.onExpire?.()
      },
      'error-callback': () => {
        clearTurnstileSession()
        setSessionReuse(false)
        setPhase('error')
        callbacksRef.current.onError?.()
      },
      theme: 'dark',
      size: 'normal',
    })

    setPhase(sessionReuse ? 'verified' : 'challenge')

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [scriptReady, handleVerify, phase, sessionReuse])

  if (!SITE_KEY) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <p className="text-xs text-zinc-500">
          Turnstile disabled (set NEXT_PUBLIC_TURNSTILE_SITE_KEY)
        </p>
      )
    }
    return null
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Script
        id={`turnstile-script-${reactId}`}
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onError={() => {
          setPhase('error')
          callbacksRef.current.onError?.()
        }}
      />

      {phase === 'loading' && (
        <div
          className="flex items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-4 min-h-[65px]"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          <div className="text-left">
            <p className="text-sm font-medium text-zinc-200">Loading security check…</p>
            <p className="text-xs text-zinc-500">Please wait for the captcha to appear</p>
          </div>
        </div>
      )}

      {phase === 'verified' && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Security check complete for this session</span>
        </div>
      )}

      {phase === 'error' && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <Shield className="h-4 w-4 shrink-0" />
          <span>Security check failed — refresh the page to retry</span>
        </div>
      )}

      <div
        ref={containerRef}
        className={cn(
          'flex justify-center min-h-[65px] transition-opacity duration-300',
          (phase === 'loading' || phase === 'verified') &&
            'sr-only absolute opacity-0 pointer-events-none h-0 min-h-0 overflow-hidden'
        )}
        aria-label="Security verification"
        aria-hidden={phase === 'loading' || phase === 'verified'}
      />
    </div>
  )
}
