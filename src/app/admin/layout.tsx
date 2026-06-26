import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Admin',
  path: '/admin',
  noIndex: true,
})

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
