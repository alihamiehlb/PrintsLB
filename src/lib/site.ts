/** Central site constants for SEO, llms.txt, structured data, and sitemap. */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://printslb.com'

export const SITE_NAME = 'PrintsLB'
export const SITE_TAGLINE = "Lebanon's Premier 3D Printing Service"
export const SITE_DESCRIPTION =
  'Professional 3D printing in Lebanon. We provide high-quality STL printing services in Beirut, Mount Lebanon, and nationwide. Upload your 3D models, choose from PLA, PETG, TPU, ABS materials, get instant quotes, track orders, and receive fast delivery across Lebanon.'

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
  { path: '/', title: 'Home', description: 'Professional 3D printing in Lebanon. Upload STL files and order high-quality 3D prints with nationwide delivery across Beirut, Mount Lebanon, and all regions.' },
  { path: '/upload', title: 'Upload STL', description: 'Upload your 3D model for professional 3D printing in Lebanon. Get instant quotes and fast delivery.' },
  { path: '/products', title: 'Products', description: 'Browse 3D printed products and collections available in Lebanon.' },
  { path: '/materials', title: 'Materials', description: 'PLA, PETG, TPU, ABS and other 3D printing materials available in Lebanon.' },
  { path: '/track', title: 'Track Order', description: 'Track your 3D print order status in real-time across Lebanon.' },
  { path: '/about', title: 'About', description: 'About PrintsLB - Lebanon\'s leading 3D printing service serving Beirut, Mount Lebanon, and nationwide.' },
  { path: '/contact', title: 'Contact', description: 'Contact PrintsLB for 3D printing quotes and support in Lebanon.' },
  { path: '/faq', title: 'FAQ', description: 'Frequently asked questions about 3D printing services in Lebanon.' },
  { path: '/privacy', title: 'Privacy Policy', description: 'PrintsLB privacy policy.' },
  { path: '/terms', title: 'Terms of Service', description: 'PrintsLB terms of service.' },
] as const

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
