import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Upload STL',
  description:
    'Upload your STL file and order a professional 3D print in Lebanon. Choose materials and track your order online.',
  path: '/upload',
})

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return children
}
