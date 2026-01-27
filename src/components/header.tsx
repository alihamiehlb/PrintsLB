'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, ShoppingCart, User, ArrowLeft, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedNavLink, PulsingButton } from '@/components/animations'
import { useRouter, usePathname } from 'next/navigation'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Upload STL', href: '/upload' },
    { name: 'Collection', href: '/products' },
    { name: 'Track Order', href: '/track' },
  ]

  const isHome = pathname === '/'

  return (
    <header className="fixed top-0 w-full bg-gray-900/95 backdrop-blur-sm border-b border-blue-500/20 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {!isHome && (
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-all group"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </button>
            )}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PLB</span>
              </div>
              <span className="text-white font-bold text-xl hidden sm:inline">PrintsLB</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <AnimatedNavLink className={`text-sm ${pathname === item.href ? 'text-blue-400 font-semibold' : 'text-gray-300 hover:text-white'} transition-colors duration-200`}>
                  {item.name}
                </AnimatedNavLink>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {session?.user?.role === 'ADMIN' && (
              <Link href="/admin">
                <PulsingButton className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full flex items-center transition-all">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                  ADMIN PANEL
                </PulsingButton>
              </Link>
            )}
            {session ? (
              <div className="flex items-center space-x-4">
                <Link href="/settings" className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-all">
                  <User className="w-5 h-5" />
                </Link>
                <PulsingButton
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg text-sm font-semibold"
                >
                  Sign Out
                </PulsingButton>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/signin"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <PulsingButton
                  href="/auth/signup"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg"
                >
                  Sign Up
                </PulsingButton>
              </div>
            )}
          </div>

          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-3 py-2 text-gray-300 hover:text-white transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                <div className="pt-4 border-t border-gray-700">
                  {session ? (
                    <>
                      {session.user?.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          className="block px-3 py-2 text-blue-400 font-bold hover:text-blue-300 transition-colors duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <ShieldCheck className="w-4 h-4 inline mr-2" />
                          Admin Panel
                        </Link>
                      )}
                      <Link
                        href="/settings"
                        className="block px-3 py-2 text-gray-300 hover:text-white transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          signOut()
                          setIsMenuOpen(false)
                        }}
                        className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white transition-colors duration-200"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/signin"
                        className="block px-3 py-2 text-gray-300 hover:text-white transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/auth/signup"
                        className="block px-3 py-2 text-gray-300 hover:text-white transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
