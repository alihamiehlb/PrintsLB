'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface CtaButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit'
}

export function CtaButton({
  children,
  href,
  onClick,
  variant = 'primary',
  className,
  disabled,
  type = 'button',
}: CtaButtonProps) {
  const base = cn(
    'relative inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 font-semibold transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
    variant === 'primary' && 'cta-primary',
    variant === 'secondary' && 'cta-secondary',
    variant === 'ghost' && 'text-white border border-zinc-700 hover:border-white hover:bg-white/5',
    disabled && 'opacity-50 pointer-events-none',
    className
  )

  const motionProps = {
    whileHover: disabled ? {} : { scale: 1.03, y: -2 },
    whileTap: disabled ? {} : { scale: 0.97 },
    transition: { type: 'spring' as const, stiffness: 400, damping: 17 },
  }

  if (href) {
    return (
      <motion.div {...motionProps} className="inline-block">
        <Link href={href} className={base}>
          <span className="relative z-10 inline-flex items-center justify-center gap-2">{children}</span>
          {variant === 'primary' && <span className="cta-glow" aria-hidden />}
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={base}
      {...motionProps}
    >
      <span className="relative z-10 inline-flex items-center justify-center gap-2">{children}</span>
      {variant === 'primary' && <span className="cta-glow" aria-hidden />}
    </motion.button>
  )
}
