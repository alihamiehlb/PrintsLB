'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

interface HeroVideoProps {
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
  const [videoReady, setVideoReady] = useState(false)
  const [videoError, setVideoError] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || reducedMotion || videoError) return

    const play = () => {
      video.play().catch(() => setVideoError(true))
    }

    if (video.readyState >= 2) {
      play()
    } else {
      video.addEventListener('loadeddata', play, { once: true })
    }

    return () => video.removeEventListener('loadeddata', play)
  }, [reducedMotion, videoError])

  const showVideo = !reducedMotion && !videoError

  return (
    <section className="relative flex min-h-[100dvh] w-full items-stretch overflow-hidden">
      {/* Poster — hidden once video is playing (avoids duplicate text under the title) */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-700 ${
          showVideo && videoReady ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        style={{ backgroundImage: `url(${posterSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        aria-hidden
      />

      {showVideo && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover object-center"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={posterSrc}
          onCanPlay={() => setVideoReady(true)}
          onPlaying={() => setVideoReady(true)}
          onError={() => setVideoError(true)}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* Readability overlay — static, no animation */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/45 to-black/90" />

      <div className="relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-center px-4 pb-16 pt-24 text-center sm:px-6 sm:pb-20 sm:pt-28">
        <div className="w-full max-w-4xl">
          <p className="mb-3 text-[0.65rem] font-medium uppercase tracking-[0.28em] text-zinc-400 sm:mb-4 sm:text-xs sm:tracking-[0.3em]">
            Lebanon&apos;s Premier 3D Printing
          </p>

          <h1 className="mb-4 text-4xl font-bold leading-[0.95] text-white sm:mb-6 sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
            <span className="text-gradient-bw">PrintsLB</span>
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-sm leading-relaxed text-zinc-300 sm:max-w-2xl sm:text-base md:mb-10 md:text-lg lg:text-xl">
            Upload your STL files. Receive premium 3D prints powered by Creality technology.
            Professional quality, delivered across Lebanon.
          </p>

          <div className="mx-auto flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
