'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, Home, ShieldAlert } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

function BlockedContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason') ?? 'rate'
  const initialRetry = Number(searchParams.get('retry') ?? '60')
  const [secondsLeft, setSecondsLeft] = useState(Math.max(1, initialRetry))

  const isBan = reason === 'banned'

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [secondsLeft])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const timeLabel =
    secondsLeft > 0
      ? `${minutes}:${seconds.toString().padStart(2, '0')}`
      : 'Ready'

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="pt-16 min-h-[80vh] flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg text-center"
        >
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/15 bg-white/5 shadow-[0_0_60px_rgba(255,255,255,0.08)]">
            <span className="text-3xl font-black tracking-tight">PLB</span>
          </div>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
            <ShieldAlert className="h-4 w-4" />
            PrintsLB Guard
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            {isBan ? 'Access Temporarily Blocked' : 'Slow Down a Moment'}
          </h1>

          <p className="text-zinc-400 leading-relaxed mb-8 max-w-md mx-auto">
            {isBan
              ? 'Too many requests were detected from your connection. This is a temporary security pause — not a permanent ban.'
              : 'You are sending requests a little too quickly. Please wait a moment and try again.'}
          </p>

          <div className="mb-10 inline-flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-6 py-4">
            <Clock className="h-5 w-5 text-zinc-400" />
            <div className="text-left">
              <p className="text-xs uppercase tracking-wider text-zinc-500">Try again in</p>
              <p className="text-2xl font-mono font-bold text-white tabular-nums">{timeLabel}</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => window.location.reload()}
              disabled={secondsLeft > 0}
              className="cta-primary min-h-12 min-w-40 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {secondsLeft > 0 ? 'Please wait…' : 'Try Again'}
            </button>
            <Link href="/" className="cta-secondary inline-flex min-h-12 min-w-40 items-center justify-center gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}

export default function BlockedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">
          Loading…
        </div>
      }
    >
      <BlockedContent />
    </Suspense>
  )
}
