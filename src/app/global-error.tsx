'use client'

import { ErrorState } from '@/components/ui/error-state'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <ErrorState
          title="Application Error"
          message="A critical error occurred. Please refresh the page."
          onRetry={reset}
        />
      </body>
    </html>
  )
}
