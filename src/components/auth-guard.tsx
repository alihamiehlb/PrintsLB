'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export function AuthGuard({ children, requireAuth = false, redirectTo = '/' }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    // If authentication is required and user is not logged in
    if (requireAuth && !session) {
      router.push('/auth/signin')
      return
    }

    // If user is logged in and trying to access auth pages, redirect to dashboard
    if (session && (redirectTo === '/auth/signin' || redirectTo === '/auth/signup')) {
      router.push('/dashboard')
      return
    }
  }, [session, status, router, requireAuth, redirectTo])

  // If loading, show nothing or a loading spinner
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  // If authentication is required and user is not logged in, show nothing
  if (requireAuth && !session) {
    return null
  }

  // If user is logged in and trying to access auth pages, show nothing
  if (session && (redirectTo === '/auth/signin' || redirectTo === '/auth/signup')) {
    return null
  }

  return <>{children}</>
}

// HOC for protecting pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: { requireAuth?: boolean; redirectTo?: string } = {}
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthGuard requireAuth={options.requireAuth} redirectTo={options.redirectTo}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}
