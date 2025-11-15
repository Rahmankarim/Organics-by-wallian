'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { TokenStorage } from '@/lib/cookies'

export default function AuthDebugger() {
  const [mounted, setMounted] = useState(false)
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    
    const interval = setInterval(() => {
      const currentToken = TokenStorage.get()
      setToken(currentToken)
      console.log('=== AUTH DEBUG ===')
      console.log('Store User:', user)
      console.log('Store IsAuthenticated:', isAuthenticated)
      console.log('Store IsLoading:', isLoading)
      console.log('Token exists:', !!currentToken)
      console.log('Token value:', currentToken ? currentToken.substring(0, 20) + '...' : 'null')
      if (typeof window !== 'undefined') {
        console.log('LocalStorage auth-token:', localStorage.getItem('auth-token'))
      }
      console.log('==================')
    }, 5000) // Log every 5 seconds

    return () => clearInterval(interval)
  }, [user, isAuthenticated, isLoading])

  if (process.env.NODE_ENV !== 'development' || !mounted) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded text-xs max-w-xs z-50">
      <div><strong>Auth Debug</strong></div>
      <div>User: {user ? user.email : 'null'}</div>
      <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
      <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
      <div>Token: {token ? 'Exists' : 'None'}</div>
    </div>
  )
}