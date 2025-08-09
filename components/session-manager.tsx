'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { toast } from 'sonner'

const SESSION_WARNING_TIME = 5 * 60 * 1000 // 5 minutes before expiry
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes total

export default function SessionManager() {
  const { user, isAuthenticated, logout } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || !user) return

    let warningTimer: NodeJS.Timeout
    let logoutTimer: NodeJS.Timeout

    const resetTimers = () => {
      clearTimeout(warningTimer)
      clearTimeout(logoutTimer)

      // Warning timer (25 minutes)
      warningTimer = setTimeout(() => {
        toast.warning('Session Expiring', {
          description: 'Your session will expire in 5 minutes. Click to extend.',
          action: {
            label: 'Extend Session',
            onClick: () => {
              // Reset timers when user clicks to extend
              resetTimers()
              toast.success('Session Extended', {
                description: 'Your session has been extended for another 30 minutes.'
              })
            }
          },
          duration: 300000 // Show for 5 minutes
        })
      }, SESSION_TIMEOUT - SESSION_WARNING_TIME)

      // Auto logout timer (30 minutes)
      logoutTimer = setTimeout(() => {
        logout()
        toast.error('Session Expired', {
          description: 'You have been logged out due to inactivity.'
        })
      }, SESSION_TIMEOUT)
    }

    const handleUserActivity = () => {
      resetTimers()
    }

    // Activity events to track
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true)
    })

    // Initialize timers
    resetTimers()

    // Cleanup
    return () => {
      clearTimeout(warningTimer)
      clearTimeout(logoutTimer)
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true)
      })
    }
  }, [isAuthenticated, user, logout])

  return null // This component doesn't render anything
}
