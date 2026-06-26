import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { GoogleAnalytics } from "@/components/google-analytics";
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Prints LB | 3D Printing Services in Lebanon",
  description: "Professional 3D printing services in Lebanon. Fast delivery and high-quality prints.",
  keywords: ['3D printing', 'STL files', '3D models', 'rapid prototyping', 'custom printing', 'Lebanon'],
  authors: [{ name: 'PrintsLB' }],
  creator: 'PrintsLB',
  publisher: 'PrintsLB',
  metadataBase: new URL('https://printslb.com'),
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: "Prints LB | 3D Printing Services in Lebanon",
    description: "Professional 3D printing services in Lebanon. Fast delivery and high-quality prints.",
    url: '/',
    siteName: 'PrintsLB',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'PrintsLB - 3D Printing Services',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Prints LB | 3D Printing Services in Lebanon",
    description: "Professional 3D printing services in Lebanon. Fast delivery and high-quality prints.",
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-black text-white`}>
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
  );
}
