import { MetadataRoute } from 'next'
import { PUBLIC_PAGES, absoluteUrl } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return PUBLIC_PAGES.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified: now,
    changeFrequency: page.path === '/' ? 'weekly' : 'monthly',
    priority: page.path === '/' ? 1 : page.path === '/upload' ? 0.9 : 0.7,
  }))
}
