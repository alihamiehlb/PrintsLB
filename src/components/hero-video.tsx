'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

const HeroScene = dynamic(
  () => import('@/components/three/hero-scene').then((m) => m.HeroScene),
  { ssr: false }
)

interface HeroVideoProps {
  /** Place your video at public/hero-video.mp4 (or .webm) */
  videoSrc?: string
  posterSrc?: string
  children?: ReactNode
}

export function HeroVideo({
  videoSrc = '/hero-video.mp4',
  posterSrc = '/hero-poster.svg',
  children,
}: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [videoError, setVideoError] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (!reducedMotion && videoRef.current && !videoError) {
      videoRef.current.play().catch(() => setVideoError(true))
    }
  }, [reducedMotion, videoError])

  return (
    <section className="relative flex h-[100svh] min-h-[680px] max-h-[980px] w-full overflow-hidden">
      {/* Video background */}
      {!reducedMotion && !videoError ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={posterSrc}
          onError={() => setVideoError(true)}
        >
          <source src={videoSrc} type="video/mp4" />
          <source src={videoSrc.replace('.mp4', '.webm')} type="video/webm" />
        </video>
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${posterSrc})` }}
        />
      )}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black z-[2]" />
      <HeroScene />

      {/* Content */}
      <div className="relative z-10 flex min-h-full w-full flex-col items-center justify-center px-6 pb-20 pt-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-4xl"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-zinc-400 sm:text-sm"
          >
            Lebanon&apos;s Premier 3D Printing
          </motion.p>

          <h1 className="mb-6 text-5xl font-bold leading-[0.95] text-white sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="text-gradient-bw">PrintsLB</span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mx-auto mb-8 max-w-2xl text-base leading-7 text-zinc-300 md:mb-10 md:text-xl"
          >
            Upload your STL files. Receive premium 3D prints powered by Creality technology.
            Professional quality, delivered across Lebanon.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mx-auto flex w-full max-w-md flex-col gap-4 sm:max-w-none sm:flex-row sm:justify-center"
            id="hero-cta"
          >
            {children}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="h-10 w-6 rounded-full border-2 border-white/30 p-1">
            <div className="h-2 w-full rounded-full bg-white/60" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
