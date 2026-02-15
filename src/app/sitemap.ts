import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://printslb.com',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1,
        },
        // Add other routes here if needed, e.g.:
        // {
        //   url: 'https://printslb.com/track',
        //   lastModified: new Date(),
        //   changeFrequency: 'weekly',
        //   priority: 0.8,
        // },
    ]
}
