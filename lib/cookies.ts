// Cookie utility functions for secure token management

export const CookieManager = {
  // Set a secure HttpOnly-style cookie (client-side limitations apply)
  setAuthToken: (token: string, maxAge: number = 7 * 24 * 60 * 60) => {
    if (typeof window !== 'undefined') {
      const expires = new Date(Date.now() + maxAge * 1000).toUTCString()
      document.cookie = `auth-token=${token}; path=/; expires=${expires}; secure; samesite=lax`
    }
  },

  // Get auth token from cookies
  getAuthToken: (): string | null => {
    if (typeof window === 'undefined') return null
    
    const cookies = document.cookie.split(';')
    const authCookie = cookies.find(cookie => 
      cookie.trim().startsWith('auth-token=')
    )
    
    return authCookie ? authCookie.split('=')[1] : null
  },

  // Clear auth token cookie
  clearAuthToken: () => {
    if (typeof window !== 'undefined') {
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    }
  },

  // Check if auth token exists in either localStorage or cookies
  hasValidToken: (): boolean => {
    if (typeof window === 'undefined') return false
    
    const localToken = localStorage.getItem('auth-token')
    const cookieToken = CookieManager.getAuthToken()
    
    return !!(localToken || cookieToken)
  },

  // Get token from localStorage first, fallback to cookies
  getBestToken: (): string | null => {
    if (typeof window === 'undefined') return null
    
    return localStorage.getItem('auth-token') || CookieManager.getAuthToken()
  }
}

// Secure token storage that uses both localStorage and cookies
export const TokenStorage = {
  set: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token)
      CookieManager.setAuthToken(token)
    }
  },

  get: (): string | null => {
    return CookieManager.getBestToken()
  },

  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token')
      CookieManager.clearAuthToken()
    }
  },

  exists: (): boolean => {
    return CookieManager.hasValidToken()
  }
}
