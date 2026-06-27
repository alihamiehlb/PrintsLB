import { MetadataRoute } from 'next'
import { PUBLIC_PAGES, SITE_URL } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL.replace(/\/$/, '')

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...PUBLIC_PAGES.map((page) => ({
      url: `${baseUrl}${page.path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: page.path === '/' ? 1 : 0.8,
    })),
  ]
}
