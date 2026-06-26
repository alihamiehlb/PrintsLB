import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

const PRIVATE_PREFIXES = [
  '/admin/',
  '/api/',
  '/dashboard/',
  '/settings/',
  '/auth/',
]

export default function robots(): MetadataRoute.Robots {
  const disallow = PRIVATE_PREFIXES

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow,
      },
      {
        userAgent: 'GPTBot',
        allow: ['/', '/llms.txt', '/about', '/products', '/materials', '/faq', '/contact'],
        disallow,
      },
      {
        userAgent: 'ChatGPT-User',
        allow: ['/', '/llms.txt', '/about', '/products', '/materials', '/faq', '/contact'],
        disallow,
      },
      {
        userAgent: 'Google-Extended',
        allow: ['/', '/llms.txt'],
        disallow,
      },
      {
        userAgent: 'anthropic-ai',
        allow: ['/', '/llms.txt'],
        disallow,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL.replace(/^https?:\/\//, ''),
  }
}
