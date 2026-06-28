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
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'PLA Printing' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'PETG Printing' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'TPU Printing' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'ABS Printing' } },
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

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What file formats do you accept for 3D printing?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We accept STL files, which is the standard format for 3D printing. You can upload your STL files directly through our website for printability review and instant pricing.',
        },
      },
      {
        '@type': 'Question',
        name: 'What 3D printing materials do you offer?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We offer PLA (eco-friendly, great for prototypes), PETG (durable and heat-resistant), TPU (flexible rubber-like material), ABS (strong and heat-resistant), and other specialty materials upon request.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does 3D printing take?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Print time varies based on size, complexity, and material. Most orders are completed within 2-5 business days. You can track your order status in real-time through our website.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you deliver across Lebanon?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, we provide nationwide delivery across all regions of Lebanon including Beirut, Mount Lebanon, Tripoli, Sidon, Tyre, Byblos, Zahle, Baalbek, and other areas. Delivery typically takes 2-5 business days.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I get a quote for my 3D print?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Simply upload your STL file through our website, select your preferred material, and you will receive an instant automatic quote based on material weight, size, and complexity.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the minimum order size?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We accept orders of all sizes, from single small prints to large production runs. Contact us for volume discounts on bulk orders.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can you print custom designs?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, we specialize in custom 3D printing for prototypes, figurines, replacement parts, artistic pieces, and any custom design you provide in STL format.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I pay for my order?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We accept secure online payments through our payment gateway. Bank transfer is also available for large orders. Contact us for alternative payment options.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you offer rush printing services?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, we offer expedited printing for urgent projects. Contact us via WhatsApp or email to discuss rush order options and pricing.',
        },
      },
      {
        '@type': 'Question',
        name: 'What if my print fails?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We review all files for printability before printing. If a print fails due to technical issues on our end, we will reprint it at no additional cost. We also provide expert guidance to optimize your files for successful printing.',
        },
      },
    ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
    </>
  )
}
