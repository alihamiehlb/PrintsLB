'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const SuccessScene = dynamic(() => import('@/components/three/success-scene'), {
  ssr: false,
  loading: () => <div className="h-32 w-32 rounded-full bg-zinc-800 animate-pulse" />,
})

interface SuccessStateProps {
  title?: string
  message?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  className?: string
}

export function SuccessState({
  title = 'Success!',
  message = 'Your action completed successfully.',
  actionLabel,
  actionHref,
  onAction,
  className,
}: SuccessStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={cn(
        'flex flex-col items-center justify-center text-center px-6 py-16',
        className
      )}
    >
      <div className="relative mb-8 h-40 w-40">
        <SuccessScene />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <CheckCircle2 className="h-12 w-12 text-emerald-400" />
        </motion.div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-zinc-400 max-w-md mb-8">{message}</p>

      {(actionLabel && actionHref) && (
        <Link href={actionHref} className="cta-primary">
          {actionLabel}
        </Link>
      )}
      {(actionLabel && onAction) && (
        <button onClick={onAction} className="cta-primary">
          {actionLabel}
        </button>
      )}
    </motion.div>
  )
}
