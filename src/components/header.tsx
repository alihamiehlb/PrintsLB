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
  const [clickCount, setClickCount] = useState(0)
  const [isZeroG, setIsZeroG] = useState(false)
  const [gameActive, setGameActive] = useState(false)
  const [score, setScore] = useState(0)
  const [logoPos, setLogoPos] = useState({ x: 0, y: 0 })

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Upload STL', href: '/upload' },
    { name: 'Materials', href: '/materials' },
    { name: 'Collection', href: '/products' },
    { name: 'Track Order', href: '/track' },
  ]

  const isHome = pathname === '/'

  const getRandomPos = () => {
    // Keep within safe viewport bounds
    const margin = 100
    return {
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth - margin * 2 : 500) + margin,
      y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight - margin * 2 : 500) + margin
    }
  }

  const handleLogoClick = (e: React.MouseEvent) => {
    if (gameActive) return
    const newCount = clickCount + 1
    setClickCount(newCount)

    if (newCount === 5) {
      setGameActive(true)
      setScore(0)
      setLogoPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
      setClickCount(0)
    }

    // Reset counter if too slow
    setTimeout(() => setClickCount(0), 2000)
  }

  const handleCatch = () => {
    setScore(s => s + 1)
    setLogoPos(getRandomPos())
    // Add a quick feedback effect
    setIsZeroG(true)
    setTimeout(() => setIsZeroG(false), 300)
  }

  return (
    <header className={`fixed top-0 w-full bg-gray-900/95 backdrop-blur-sm border-b border-blue-500/20 z-50 transition-all duration-1000 ${isZeroG ? 'py-8 shadow-[0_0_50px_rgba(59,130,246,0.5)]' : ''}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center h-16 transition-transform duration-1000 ${isZeroG ? 'scale-110' : ''}`}>
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
            <div className="flex items-center space-x-2 cursor-pointer group" onClick={handleLogoClick}>
              <motion.div
                animate={(isZeroG || gameActive) ? {
                  rotateY: [0, 360, 720],
                  y: [0, -5, 0],
                  scale: [1, 1.1, 1]
                } : {}}
                transition={{ duration: 3, repeat: (isZeroG || gameActive) ? Infinity : 0 }}
                className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center relative overflow-hidden"
              >
                <span className="text-white font-bold text-sm relative z-10">PLB</span>
              </motion.div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-xl hidden sm:inline">PrintsLB</span>
                <AnimatePresence>
                  {gameActive && (
                    <motion.span
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[10px] font-bold text-green-400 tracking-tighter uppercase leading-none"
                    >
                      Game Mode: {score} Caught!
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {gameActive && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    left: logoPos.x,
                    top: logoPos.y
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="fixed z-[100] cursor-crosshair"
                  onClick={handleCatch}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.8)] border-2 border-white/20"
                  >
                    <span className="text-white font-black text-2xl">PLB</span>
                  </motion.div>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setGameActive(false)}
                  className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[101] bg-white text-gray-900 px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-gray-100 transition-all border-4 border-blue-500"
                >
                  EXIT GAME
                </motion.button>
              </AnimatePresence>
            )}
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
