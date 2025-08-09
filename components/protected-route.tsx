'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { TokenStorage } from '@/lib/cookies'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'customer' | 'admin' | 'super_admin'
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  requiredRole = 'customer',
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore()
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      // If middleware let us through to this point, we should have a valid token
      // Check if we have a token but auth store isn't initialized
      if (!isAuthenticated && TokenStorage.exists()) {
        // Force auth check to sync with middleware validation
        await checkAuth()
      }
      setIsInitializing(false)
    }

    initializeAuth()
  }, [isAuthenticated, checkAuth])

  useEffect(() => {
    // Only redirect after initialization is complete and auth store is ready
    if (!isLoading && !isInitializing) {
      if (!isAuthenticated) {
        // No valid authentication found
        const currentPath = window.location.pathname
        const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`
        router.push(loginUrl)
        return
      }

      // Check role requirements
      if (requiredRole && user) {
        const roleHierarchy = {
          'customer': 1,
          'admin': 2,
          'super_admin': 3
        }

        const userRoleLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0
        const requiredRoleLevel = roleHierarchy[requiredRole]

        if (userRoleLevel < requiredRoleLevel) {
          router.push('/')
          return
        }
      }
    }
  }, [isAuthenticated, user, isLoading, isInitializing, router, requiredRole, redirectTo])

  // Show loading while checking authentication
  if (isLoading || isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4EBD0]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#355E3B] mx-auto mb-4"></div>
          <p className="text-[#355E3B] font-medium">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null
  }

  // Check role requirements
  if (requiredRole && user) {
    const roleHierarchy = {
      'customer': 1,
      'admin': 2,
      'super_admin': 3
    }

    const userRoleLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0
    const requiredRoleLevel = roleHierarchy[requiredRole]

    if (userRoleLevel < requiredRoleLevel) {
      return null
    }
  }

  return <>{children}</>
}
