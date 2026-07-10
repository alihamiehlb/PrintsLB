import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { WhatsAppFloat } from '@/components/whatsapp-float'
import { GoogleAnalytics } from '@/components/google-analytics'
import { StructuredData } from '@/components/structured-data'
import { rootMetadata } from '@/lib/metadata'
import { SITE_URL } from '@/lib/site'
import { Suspense } from 'react'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  ...rootMetadata,
  alternates: {
    canonical: SITE_URL,
    types: {
      'text/plain': [{ url: '/llms.txt', title: 'LLMs.txt' }],
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-LB" className="overflow-y-scroll">
      <head>
        <link rel="author" type="text/plain" href="/llms.txt" title="LLMs.txt" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-black text-white`}>
        <StructuredData />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <Suspense fallback={null}>
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
          </Suspense>
        )}
        <Providers>
          {children}
          <WhatsAppFloat />
        </Providers>
      </body>
    </html>
  )
}
