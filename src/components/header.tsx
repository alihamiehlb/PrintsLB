'use client'

import { useState, useEffect } from 'react'
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
  const [highScore, setHighScore] = useState(0)
  const [globalTop, setGlobalTop] = useState({ score: 0, playerName: 'Anonymous' })
  const [logoPos, setLogoPos] = useState({ x: 0, y: 0 })

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Upload STL', href: '/upload' },
    { name: 'Materials', href: '/materials' },
    { name: 'Collection', href: '/products' },
    { name: 'Track Order', href: '/track' },
  ]

  const isHome = pathname === '/'

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('logo_game_high_score')
    if (saved) setHighScore(parseInt(saved))

    fetchGlobalTop()
  }, [])

  const fetchGlobalTop = async () => {
    try {
      const res = await fetch('/api/game/high-score')
      const data = await res.json() as { score?: number; playerName?: string }
      if (data.score !== undefined) {
        setGlobalTop({ score: data.score, playerName: data.playerName ?? 'Anonymous' })
      }
    } catch (e) {
      console.error('Failed to fetch global top score')
    }
  }

  const getRandomPos = () => {
    if (typeof window === 'undefined') return { x: 0, y: 0 }

    // Mobile-friendly bounds
    const isMobile = window.innerWidth < 768
    const margin = isMobile ? 60 : 120

    return {
      x: Math.random() * (window.innerWidth - margin * 2) + margin,
      y: Math.random() * (window.innerHeight - margin * 2) + margin
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
      fetchGlobalTop() // Refresh on start
    }

    // Reset counter if too slow
    setTimeout(() => setClickCount(0), 2000)
  }

  const handleCatch = async (e: React.MouseEvent | React.TouchEvent) => {
    const newScore = score + 1
    setScore(newScore)

    if (newScore > highScore) {
      setHighScore(newScore)
      localStorage.setItem('logo_game_high_score', newScore.toString())
    }

    if (newScore > globalTop.score) {
      setGlobalTop({ score: newScore, playerName: session?.user?.name || 'You!' })
      // Sync to DB
      try {
        await fetch('/api/game/high-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ score: newScore })
        })
      } catch (e) {
        console.error('Failed to sync global score')
      }
    }

    setLogoPos(getRandomPos())
    // Add a quick feedback effect
    setIsZeroG(true)
    setTimeout(() => setIsZeroG(false), 300)
  }

  return (
    <header className={`fixed top-0 w-full bg-black/90 backdrop-blur-md border-b border-zinc-800 z-50 transition-all duration-1000 ${isZeroG ? 'py-8 shadow-[0_0_50px_rgba(255,255,255,0.15)]' : ''}`}>
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
                className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center relative overflow-hidden"
              >
                <span className="font-bold text-sm relative z-10">PLB</span>
              </motion.div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-xl hidden sm:inline">PrintsLB</span>
                <AnimatePresence>
                  {gameActive && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex flex-col"
                    >
                      <span className="text-[10px] font-bold text-emerald-400 tracking-tighter uppercase leading-none">
                        Score: {score} | Top: {highScore}
                      </span>
                      <span className="text-[8px] font-bold text-zinc-400 tracking-tighter uppercase leading-none mt-0.5">
                        Record: {globalTop.playerName} ({globalTop.score})
                      </span>
                    </motion.div>
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
                  className="fixed z-[100] cursor-crosshair -translate-x-1/2 -translate-y-1/2"
                  onMouseDown={handleCatch}
                  onTouchStart={handleCatch}
                >
                  <motion.div
                    animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                    transition={{
                      rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
                      scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                    }}
                    className="w-12 h-12 md:w-16 md:h-16 bg-white text-black rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.3)] border-2 border-zinc-700"
                  >
                    <span className="font-black text-xl md:text-2xl">PLB</span>
                  </motion.div>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setGameActive(false)}
                  className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[101] bg-white text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-zinc-100 transition-all border-2 border-zinc-300 active:scale-95"
                >
                  EXIT GAME
                </motion.button>
              </AnimatePresence>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <AnimatedNavLink className={`text-sm ${pathname === item.href ? 'text-white font-semibold' : 'text-zinc-400 hover:text-white'} transition-colors duration-200`}>
                  {item.name}
                </AnimatedNavLink>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {session?.user?.role === 'ADMIN' && (
              <Link href="/admin">
                <PulsingButton className="px-4 py-1.5 bg-white/10 border border-zinc-600 hover:bg-white/15 text-white text-xs font-bold rounded-full flex items-center transition-all">
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
                  className="px-4 py-2 bg-white text-black rounded-lg text-sm font-semibold"
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
                  className="px-4 py-2 bg-white text-black rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] transition-shadow"
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
                          className="block px-3 py-2 text-white font-bold hover:text-zinc-300 transition-colors duration-200"
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
