'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { AlertTriangle, Home, RefreshCw, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const ErrorScene = dynamic(() => import('@/components/three/error-scene'), {
  ssr: false,
  loading: () => <div className="h-32 w-32 rounded-full bg-zinc-800 animate-pulse" />,
})

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  showHome?: boolean
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We hit an unexpected error. Please try again.',
  onRetry,
  showHome = true,
  className,
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex min-h-[70vh] flex-col items-center justify-center bg-black px-6 py-16 text-center',
        className
      )}
    >
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-300">
        <ShieldAlert className="h-4 w-4" />
        PrintsLB Guard
      </div>

      <div className="relative mb-8 h-44 w-44">
        <ErrorScene />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-red-400/30 bg-red-500/10 shadow-[0_0_40px_rgba(248,113,113,0.18)]">
            <AlertTriangle className="h-10 w-10 text-red-300" />
          </div>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-white mb-3">{title}</h2>
      <p className="text-zinc-400 max-w-md mb-8 leading-7">{message}</p>

      <div className="flex flex-wrap gap-4 justify-center">
        {onRetry && (
          <button
            onClick={onRetry}
            className="cta-primary inline-flex min-h-12 min-w-40 items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        )}
        {showHome && (
          <Link href="/" className="cta-secondary inline-flex min-h-12 min-w-40 items-center justify-center gap-2">
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        )}
      </div>
    </motion.div>
  )
}
