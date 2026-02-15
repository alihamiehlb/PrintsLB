import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/admin/', // Disallow admin paths from being indexed
        },
        sitemap: 'https://printslb.com/sitemap.xml',
    }
}
