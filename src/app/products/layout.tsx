import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Products',
  description: 'Browse 3D printed products and collections from PrintsLB in Lebanon.',
  path: '/products',
})

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children
}
