import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Dashboard',
  path: '/dashboard',
  noIndex: true,
})

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
