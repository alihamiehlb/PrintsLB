import { BUSINESS, PUBLIC_PAGES, SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/site'

export function StructuredData() {
  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#business`,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    image: absoluteUrl('/logo.png'),
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    priceRange: BUSINESS.priceRange,
    address: {
      '@type': 'PostalAddress',
      addressCountry: BUSINESS.countryCode,
      addressRegion: BUSINESS.region,
      addressLocality: BUSINESS.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: BUSINESS.latitude,
      longitude: BUSINESS.longitude,
    },
    areaServed: {
      '@type': 'Country',
      name: BUSINESS.country,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '21:00',
      },
    ],
    sameAs: [BUSINESS.whatsapp],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: '3D Printing Services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'STL 3D Printing' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Rapid Prototyping' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Custom 3D Models' } },
      ],
    },
  }

  const webSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: 'en-LB',
    publisher: { '@id': `${SITE_URL}/#business` },
  }

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${SITE_NAME} pages`,
    itemListElement: PUBLIC_PAGES.map((page, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: page.title,
      url: absoluteUrl(page.path),
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSite) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
    </>
  )
}
