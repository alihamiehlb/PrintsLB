'use client'

import Script from 'next/script'
import { useCallback, useEffect, useId, useRef, useState } from 'react'

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

export function TurnstileWidget({
  onVerify,
  onExpire,
  onError,
  className,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [scriptReady, setScriptReady] = useState(false)
  const reactId = useId()

  const handleVerify = useCallback(
    (token: string) => onVerify(token),
    [onVerify]
  )

  useEffect(() => {
    if (!scriptReady || !SITE_KEY || !containerRef.current || !window.turnstile) {
      return
    }

    if (widgetIdRef.current) {
      window.turnstile.remove(widgetIdRef.current)
      widgetIdRef.current = null
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: SITE_KEY,
      callback: handleVerify,
      'expired-callback': () => onExpire?.(),
      'error-callback': () => onError?.(),
      theme: 'dark',
      size: 'normal',
    })

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [scriptReady, handleVerify, onExpire, onError])

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
    <>
      <Script
        id={`turnstile-script-${reactId}`}
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div
        ref={containerRef}
        className={className ?? 'flex justify-center min-h-[65px]'}
        aria-label="Security verification"
      />
    </>
  )
}