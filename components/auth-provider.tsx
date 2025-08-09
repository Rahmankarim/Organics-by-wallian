'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { TokenStorage } from '@/lib/cookies'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout, login, setLoading, isLoading } = useAuthStore()
  const [hasInitialized, setHasInitialized] = useState(false)

  useEffect(() => {
    const initializeAuth = async () => {
      // Prevent multiple initializations
      if (hasInitialized) return
      setHasInitialized(true)
      
      setLoading(true)
      
      try {
        // Check if we have a token
        const token = TokenStorage.get()
        
        if (token && !isAuthenticated) {
          // Verify token with backend and get user data
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            // Re-login the user with existing token
            login(data.user, token)
            console.log('Authentication restored for:', data.user.email)
          } else {
            // Token is invalid, clear it
            TokenStorage.clear()
            logout()
            console.log('Invalid token, cleared authentication')
          }
        } else if (!token) {
          // No token found, ensure user is logged out
          logout()
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Clear invalid token
        TokenStorage.clear()
        logout()
      } finally {
        setLoading(false)
      }
    }

    // Only run on client side and when not already initialized
    if (typeof window !== 'undefined' && !hasInitialized) {
      initializeAuth()
    }
  }, [hasInitialized, isAuthenticated, login, logout, setLoading])

  // Show loading spinner while initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4EBD0]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#355E3B] mx-auto mb-4"></div>
          <p className="text-[#355E3B] font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
