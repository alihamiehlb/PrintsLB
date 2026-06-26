'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { AuthGuard } from '@/components/auth-guard'
import { GoogleSignInButton, AuthDivider } from '@/components/google-sign-in-button'
import { CtaButton } from '@/components/ui/cta-button'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard redirectTo="/dashboard">
      <div className="min-h-screen bg-black">
        <Header />

        <main className="pt-16 min-h-screen flex items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
                <p className="text-zinc-400">Welcome back to PrintsLB</p>
              </div>

              <GoogleSignInButton />

              <AuthDivider />

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-zinc-500"
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-zinc-500"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                </div>

                <CtaButton type="submit" variant="primary" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </CtaButton>
              </form>

              <div className="mt-6 text-center">
                <p className="text-zinc-400">
                  Don&apos;t have an account?{' '}
                  <Link href="/auth/signup" className="text-white hover:underline transition-colors">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </main>

        <Footer />
      </div>
    </AuthGuard>
  )
}
