// 🎨 Enhanced Animation Components for PrintsLB
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// Floating Particles Background
export const FloatingParticles = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number }>>([])

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1
      }))
      setParticles(newParticles)
    }

    generateParticles()
    const interval = setInterval(generateParticles, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute bg-blue-500/20 rounded-full blur-sm"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, 100, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

// Gradient Background Animation
export const GradientBackground = () => {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-cyan-900/20 animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/10 via-pink-900/10 to-blue-900/10 animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute inset-0 bg-gradient-to-bl from-green-900/10 via-teal-900/10 to-cyan-900/10 animate-pulse" style={{ animationDelay: '4s' }} />
    </div>
  )
}

// Animated Navigation Items
export const AnimatedNavLink = ({ children, href, className = "" }: { children: React.ReactNode; href?: string; className?: string }) => {
  const content = (
    <motion.div
      className={`relative ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg blur-md opacity-0 hover:opacity-100 transition-opacity duration-300"
      />
      {children}
    </motion.div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}

// Pulsing Button
export const PulsingButton = ({ children, onClick, href, className = "" }: { children: React.ReactNode; onClick?: () => void; href?: string; className?: string }) => {
  const handleClick = () => {
    if (href) {
      window.location.href = href
    } else if (onClick) {
      onClick()
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      className={`relative overflow-hidden ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 hover:opacity-20 transition-opacity duration-300"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}

// Glowing Card
export const GlowingCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    className={`relative ${className}`}
    whileHover={{
      boxShadow: "0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(6, 182, 212, 0.3)"
    }}
    animate={{
      boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)"
    }}
    transition={{
      repeat: Infinity,
      duration: 2
    }}
  >
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"
    />
    {children}
  </motion.div>
)

// Typing Animation
export const TypingAnimation = ({ text, className = "" }: { text: string; className?: string }) => {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text])

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="inline-block w-0.5 h-5 bg-blue-400 ml-1"
      />
    </span>
  )
}

// Floating Action Button
export const FloatingActionButton = ({ icon: Icon, onClick, label }: { icon: React.ElementType; onClick: () => void; label: string }) => {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center group"
      whileHover={{ scale: 1.1, rotate: 15 }}
      whileTap={{ scale: 0.9 }}
      animate={{
        y: [0, -10, 0]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Icon className="w-6 h-6 text-white" />
      <span className="absolute right-full mr-3 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        {label}
      </span>
    </motion.button>
  )
}

// Shimmer Effect
export const Shimmer = ({ className = "" }: { className?: string }) => (
  <div className={`relative overflow-hidden ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
  </div>
)

// Pulse Ring Effect
export const PulseRing = ({ className = "" }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping" />
    <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping" style={{ animationDelay: '0.5s' }} />
    <div className="relative rounded-full border-2 border-blue-400" />
  </div>
)

// Morphing Shape
export const MorphingShape = ({ className = "" }: { className?: string }) => {
  return (
    <motion.div
      className={`w-20 h-20 ${className}`}
      animate={{
        borderRadius: ["20%", "50%", "20%", "0%", "20%"],
        rotate: [0, 90, 180, 270, 360],
        scale: [1, 1.2, 1, 1.2, 1]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  )
}

// Wave Animation
export const WaveAnimation = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <svg
        className="absolute bottom-0 w-full h-20"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,56 C150,100 350,0 600,56 C850,100 1050,0 1200,56 L1200,120 L0,120 Z"
          fill="url(#gradient)"
          animate={{
            d: [
              "M0,56 C150,100 350,0 600,56 C850,100 1050,0 1200,56 L1200,120 L0,120 Z",
              "M0,56 C200,100 400,20 600,56 C800,100 1000,20 1200,56 L1200,120 L0,120 Z",
              "M0,56 C150,100 350,0 600,56 C850,100 1050,0 1200,56 L1200,120 L0,120 Z"
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
            <stop offset="100%" stopColor="rgba(6, 182, 212, 0.3)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
