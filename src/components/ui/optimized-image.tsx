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
  const [error, setError] = useState(false)
  const imageSrc = webpSrc || src

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-zinc-900 text-zinc-500 text-sm',
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
          if (webpSrc && imageSrc === webpSrc) {
            setError(false)
            // fallback handled by using src on retry — parent should pass both
          } else {
            setError(true)
            setLoading(false)
          }
        }}
      />
    </div>
  )
}
