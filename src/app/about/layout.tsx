import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'About',
  description:
    'Learn about PrintsLB — professional 3D printing in Lebanon with PLA, PETG, and TPU materials and nationwide delivery.',
  path: '/about',
})

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
