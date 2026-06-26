/** Central site constants for SEO, llms.txt, structured data, and sitemap. */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://printslb.com'

export const SITE_NAME = 'PrintsLB'
export const SITE_TAGLINE = "Lebanon's Premier 3D Printing Service"
export const SITE_DESCRIPTION =
  'Professional 3D printing in Lebanon. Upload STL files, choose materials (PLA, PETG, TPU), track orders, and get nationwide delivery.'

export const BUSINESS = {
  legalName: 'PrintsLB',
  email: 'ali.hamieh.lb@gmail.com',
  phone: '+96176696385',
  phoneDisplay: '+961 76 696 385',
  whatsapp: 'https://wa.me/96176696385',
  country: 'Lebanon',
  countryCode: 'LB',
  region: 'Mount Lebanon',
  latitude: 33.8339,
  longitude: 35.5442,
  hours: 'Mo-Sa 09:00-21:00',
  priceRange: '$$',
} as const

/** Public marketing pages included in sitemap and llms.txt */
export const PUBLIC_PAGES = [
  { path: '/', title: 'Home', description: 'Upload STL files and order professional 3D prints in Lebanon.' },
  { path: '/upload', title: 'Upload STL', description: 'Upload your 3D model and place a print order.' },
  { path: '/products', title: 'Products', description: 'Browse 3D printed products and collections.' },
  { path: '/materials', title: 'Materials', description: 'PLA, PETG, TPU and other print materials.' },
  { path: '/track', title: 'Track Order', description: 'Track your 3D print order status.' },
  { path: '/about', title: 'About', description: 'About PrintsLB — Lebanon 3D printing service.' },
  { path: '/contact', title: 'Contact', description: 'Contact PrintsLB for quotes and support.' },
  { path: '/faq', title: 'FAQ', description: 'Frequently asked questions about 3D printing.' },
  { path: '/privacy', title: 'Privacy Policy', description: 'PrintsLB privacy policy.' },
  { path: '/terms', title: 'Terms of Service', description: 'PrintsLB terms of service.' },
] as const

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
