'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Box, Loader2 } from 'lucide-react'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-zinc-800/80',
        className
      )}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
      <Skeleton className="aspect-square w-full" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  )
}

export function LoadingScreen({
  label = 'Preparing PrintsLB',
  message = 'Loading your 3D printing workspace...',
}: {
  label?: string
  message?: string
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-black px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative w-full max-w-sm rounded-[2rem] border border-white/10 bg-zinc-950/80 p-8 shadow-[0_0_80px_rgba(255,255,255,0.08)]"
      >
        <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_55%)]" />
        <div className="relative">
          <motion.div
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/15 bg-white text-black"
            animate={{ rotate: [0, 0, -4, 4, 0], y: [0, -6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Box className="h-10 w-10" />
          </motion.div>

          <div className="mb-5 flex items-center justify-center gap-2">
            <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-bold tracking-[0.28em] text-zinc-300">
              PLB
            </span>
            <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
          </div>

          <h2 className="text-2xl font-bold text-white">{label}</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">{message}</p>

          <div className="mt-8 space-y-3">
            <Skeleton className="mx-auto h-2 w-48 rounded-full" />
            <Skeleton className="mx-auto h-2 w-32 rounded-full" />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-black pt-24 px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <LoadingScreen />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  )
}
