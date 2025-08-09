'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import Analytics to prevent SSR issues
const Analytics = dynamic(() => import('./analytics'), {
  ssr: false,
  loading: () => null,
})

export default function ClientAnalytics() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Only mount after client-side hydration
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <Analytics />
}
