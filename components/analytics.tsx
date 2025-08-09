'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

// Google Analytics tracking ID
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

// Track page views without using useSearchParams
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Simple analytics component that doesn't use useSearchParams
function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (GA_TRACKING_ID && typeof window !== 'undefined') {
      // Use window.location.search instead of useSearchParams
      const search = window.location.search
      const url = `${pathname}${search}`
      trackPageView(url)
    }
  }, [pathname])

  return null
}

// Analytics provider component
export default function Analytics() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't render anything on the server or if no GA ID
  if (!isClient || !GA_TRACKING_ID) {
    return null
  }

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname + window.location.search,
            });
          `,
        }}
      />
      <AnalyticsTracker />
    </>
  )
}
