'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/ui/error-state'
import { Header } from '@/components/header'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <ErrorState
        title="Page Error"
        message={error.message || 'Something unexpected happened.'}
        onRetry={reset}
      />
    </div>
  )
}
