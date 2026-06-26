import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Contact',
  description:
    'Contact PrintsLB for 3D printing quotes in Lebanon. WhatsApp, email, and support for STL uploads and custom projects.',
  path: '/contact',
})

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
