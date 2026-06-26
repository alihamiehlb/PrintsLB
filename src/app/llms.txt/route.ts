import { BUSINESS, PUBLIC_PAGES, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL, absoluteUrl } from '@/lib/site'

export const dynamic = 'force-static'

function buildLlmsTxt(): string {
  const pageLines = PUBLIC_PAGES.map(
    (p) => `- [${p.title}](${absoluteUrl(p.path)}): ${p.description}`
  ).join('\n')

  return `# ${SITE_NAME}

> ${SITE_TAGLINE}. ${SITE_DESCRIPTION}

## About

${SITE_NAME} is a professional 3D printing service based in Lebanon. Customers upload STL files, select materials (PLA, PETG, TPU), and receive prints with order tracking and nationwide delivery.

## Services

- STL file upload and printability review
- Material selection: PLA, PETG, TPU
- Order tracking and status updates
- Delivery across Lebanon

## Key pages

${pageLines}

## Contact

- Email: ${BUSINESS.email}
- Phone / WhatsApp: ${BUSINESS.phoneDisplay}
- Location: ${BUSINESS.country} (${BUSINESS.region})
- Hours: ${BUSINESS.hours}

## Policies

- [Privacy Policy](${absoluteUrl('/privacy')})
- [Terms of Service](${absoluteUrl('/terms')})

## Technical

- [Sitemap](${absoluteUrl('/sitemap.xml')})
- [Robots](${absoluteUrl('/robots.txt')})
- Canonical site: ${SITE_URL}
`
}

export async function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
