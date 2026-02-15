'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export function GoogleAnalytics({ gaId }: { gaId: string }) {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (!gaId) return

        const url = pathname + searchParams.toString()

        window.gtag('config', gaId, {
            page_path: url,
        })
    }, [pathname, searchParams, gaId])

    return (
        <>
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
                id="gtag-init"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });
          `,
                }}
            />
        </>
    )
}

declare global {
    interface Window {
        gtag: (
            command: 'config' | 'event' | 'js' | 'set',
            targetId: string,
            config?: Record<string, any>
        ) => void
        dataLayer: any[]
    }
}
