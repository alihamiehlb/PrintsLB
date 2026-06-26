import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'FAQ',
  description:
    'Frequently asked questions about 3D printing, STL files, materials, pricing, and delivery in Lebanon.',
  path: '/faq',
})

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children
}
