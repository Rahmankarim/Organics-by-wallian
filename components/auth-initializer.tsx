"use client"

import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/lib/store'

export function AuthInitializer() {
  const initializeAuth = useAuthStore(state => state.initializeAuth)
  const isLoading = useAuthStore(state => state.isLoading)
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const initialized = useRef(false)

  useEffect(() => {
    // Only initialize once
    if (!initialized.current && !isLoading && !isAuthenticated) {
      initialized.current = true
      initializeAuth()
    }
  }, [initializeAuth, isLoading, isAuthenticated])

  return null
}
