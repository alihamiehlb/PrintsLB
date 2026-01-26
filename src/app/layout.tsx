import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: 'PrintsLB - Professional 3D Printing Service',
  description: 'Upload your STL files and get instant pricing for high-quality 3D prints in Lebanon.',
  keywords: ['3D printing', 'STL files', '3D models', 'rapid prototyping', 'custom printing', 'Lebanon'],
  authors: [{ name: 'PrintsLB' }],
  creator: 'PrintsLB',
  publisher: 'PrintsLB',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'PrintsLB - Professional 3D Printing Services',
    description: 'High-quality 3D printing services by Ali Hamieh. Fast turnaround, competitive pricing, and expert craftsmanship.',
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
    title: 'PrintsLB - Professional 3D Printing Services',
    description: 'High-quality 3D printing services by Ali Hamieh. Fast turnaround, competitive pricing, and expert craftsmanship.',
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
      <body className={`${inter.variable} font-sans antialiased bg-gray-900 text-white`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
