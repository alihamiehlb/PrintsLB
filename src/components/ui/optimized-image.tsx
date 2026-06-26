'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface OptimizedImageProps {
  src: string
  webpSrc?: string | null
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
}

export function OptimizedImage({
  src,
  webpSrc,
  alt,
  width,
  height,
  fill,
  className,
  priority,
  sizes = '(max-width: 768px) 100vw, 33vw',
}: OptimizedImageProps) {
  const [loading, setLoading] = useState(true)
  // When the Next optimizer can't handle a host, fall back to a native <img>
  // so the picture still renders instead of showing "unavailable".
  const [useNative, setUseNative] = useState(false)
  const [hardError, setHardError] = useState(false)

  const imageSrc = webpSrc || src

  if (hardError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-zinc-900 text-zinc-600 text-sm',
          fill && 'w-full h-full',
          className
        )}
      >
        Image unavailable
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', fill && 'w-full h-full', className)}>
      {loading && (
        <Skeleton className={cn('absolute inset-0 z-10', fill ? 'w-full h-full' : '')} />
      )}

      {useNative ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={cn(
            'transition-opacity duration-300',
            fill ? 'absolute inset-0 h-full w-full object-cover' : 'object-cover',
            loading ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={() => setLoading(false)}
          onError={() => {
            setHardError(true)
            setLoading(false)
          }}
        />
      ) : (
        <Image
          src={imageSrc}
          alt={alt}
          width={fill ? undefined : width ?? 400}
          height={fill ? undefined : height ?? 400}
          fill={fill}
          sizes={sizes}
          priority={priority}
          className={cn(
            'object-cover transition-opacity duration-300',
            loading ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={() => setLoading(false)}
          onError={() => {
            // Optimizer failed for this host — retry with a native <img>.
            setUseNative(true)
          }}
        />
      )}
    </div>
  )
}
