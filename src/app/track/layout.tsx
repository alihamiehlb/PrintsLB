import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Track Order',
  description: 'Track your 3D print order status with PrintsLB Lebanon.',
  path: '/track',
})

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return children
}
