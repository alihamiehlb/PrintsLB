import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Materials',
  description:
    '3D printing materials in Lebanon: PLA, PETG, TPU and more. Compare options for your STL print at PrintsLB.',
  path: '/materials',
})

export default function MaterialsLayout({ children }: { children: React.ReactNode }) {
  return children
}
