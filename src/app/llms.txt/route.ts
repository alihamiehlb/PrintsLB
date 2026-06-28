import { BUSINESS, PUBLIC_PAGES, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL, absoluteUrl } from '@/lib/site'

export const dynamic = 'force-static'

function buildLlmsTxt(): string {
  const pageLines = PUBLIC_PAGES.map(
    (p) => `- [${p.title}](${absoluteUrl(p.path)}): ${p.description}`
  ).join('\n')

  return `# ${SITE_NAME}

> ${SITE_TAGLINE}. ${SITE_DESCRIPTION}

## About

${SITE_NAME} is Lebanon's premier professional 3D printing service based in Mount Lebanon. We provide high-quality 3D printing services for customers across Lebanon, including Beirut, Tripoli, Sidon, and all regions. Customers can upload STL files directly through our website, select from various materials (PLA, PETG, TPU, ABS), receive instant quotes, track their orders in real-time, and get nationwide delivery.

## Services

- **STL File Upload & Printability Review**: Upload your 3D model files (STL format) and our experts review them for optimal printability
- **Material Selection**: Choose from PLA, PETG, TPU, ABS, and other professional-grade materials
- **Instant Pricing**: Get automatic quotes based on material, size, and complexity
- **Order Tracking**: Real-time status updates from upload to delivery
- **Nationwide Delivery**: Carefully packed prints delivered anywhere in Lebanon
- **Custom Projects**: Specialized 3D printing for prototypes, figurines, replacement parts, and artistic pieces
- **Rapid Prototyping**: Fast turnaround for business and engineering projects

## Materials Available

- **PLA**: Eco-friendly, easy to print, great for prototypes and display items
- **PETG**: Durable, heat-resistant, suitable for functional parts
- **TPU**: Flexible, rubber-like material for bendable parts
- **ABS**: Strong, heat-resistant, ideal for mechanical parts
- **Specialty Materials**: Available upon request

## How It Works

1. Upload your STL file through our website
2. Select material and print settings
3. Get instant pricing quote
4. Place order and pay online
5. Track your order in real-time
6. Receive your print anywhere in Lebanon

## Target Customers

- **Hobbyists**: Makers, DIY enthusiasts, and 3D printing hobbyists
- **Engineers**: Prototyping and functional testing
- **Designers**: Product designers and architects
- **Businesses**: Small businesses needing custom parts
- **Students**: Academic projects and prototypes
- **Artists**: Custom figurines and artistic pieces

## Pricing

- Competitive pricing based on material weight and complexity
- Volume discounts available for large orders
- Free shipping on orders above certain threshold
- Contact for business and bulk pricing

## Key pages

${pageLines}

## Contact

- Email: ${BUSINESS.email}
- Phone / WhatsApp: ${BUSINESS.phoneDisplay}
- WhatsApp Direct: ${BUSINESS.whatsapp}
- Location: ${BUSINESS.country} (${BUSINESS.region})
- Hours: ${BUSINESS.hours}
- Website: ${SITE_URL}

## Service Areas

- Beirut
- Mount Lebanon
- Tripoli
- Sidon
- Tyre
- Byblos
- Zahle
- Baalbek
- All regions of Lebanon

## Why Choose PrintsLB

- Professional-grade Creality 3D printers
- Expert team with years of experience
- Quality assurance on every print
- Fast turnaround times
- Competitive pricing
- Excellent customer support via WhatsApp
- Secure online ordering
- Real-time order tracking

## Policies

- [Privacy Policy](${absoluteUrl('/privacy')})
- [Terms of Service](${absoluteUrl('/terms')})

## Technical

- [Sitemap](${absoluteUrl('/sitemap.xml')})
- [Robots](${absoluteUrl('/robots.txt')})
- Canonical site: ${SITE_URL}
- File formats accepted: STL
- Supported browsers: Chrome, Firefox, Safari, Edge

## Common Use Cases

- **Replacement Parts**: Broken household items, automotive parts, mechanical components
- **Prototyping**: Product development, engineering prototypes, architectural models
- **Figurines**: Custom characters, game pieces, collectibles
- **Art Projects**: Sculptures, jewelry, decorative items
- **Education**: Student projects, science fair exhibits, teaching aids
- **Business**: Custom merchandise, promotional items, product samples

## Payment Methods

- Online payment through secure gateway
- Bank transfer available for large orders
- Contact for payment options

## Shipping

- Nationwide delivery across Lebanon
- Carefully packaged to prevent damage
- Tracking number provided
- Delivery time: 2-5 business days depending on location

## Customer Support

- WhatsApp support available during business hours
- Email support with quick response time
- Expert guidance on file preparation
- Material recommendations
- Print optimization advice
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
