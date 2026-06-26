import type { Metadata } from 'next'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/site'

interface PageMetaInput {
  title: string
  description?: string
  path: string
  noIndex?: boolean
}

export function pageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
  noIndex = false,
}: PageMetaInput): Metadata {
  const canonical = absoluteUrl(path)
  const fullTitle = path === '/' ? `${SITE_NAME} | 3D Printing Lebanon` : `${title} | ${SITE_NAME}`

  return {
    title: fullTitle,
    description,
    alternates: { canonical },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: 'en_LB',
      type: 'website',
      images: [{ url: absoluteUrl('/logo.png'), width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [absoluteUrl('/logo.png')],
    },
    other: {
      'geo.region': 'LB',
      'geo.placename': 'Lebanon',
      'geo.position': '33.8339;35.5442',
      ICBM: '33.8339, 35.5442',
    },
  }
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...pageMetadata({ title: SITE_NAME, path: '/' }),
  keywords: [
    '3D printing Lebanon',
    '3D printing Beirut',
    'STL printing Lebanon',
    'rapid prototyping Lebanon',
    'custom 3D prints',
    'PLA printing',
    'PETG printing',
    'PrintsLB',
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'technology',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}
