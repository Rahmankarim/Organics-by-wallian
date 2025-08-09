import { TokenStorage } from './cookies'

// Utility functions for authenticated API requests
export const AuthUtils = {
  // Get authorization headers for API requests
  getAuthHeaders: (): Record<string, string> => {
    const token = TokenStorage.get()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return headers
  },

  // Make an authenticated fetch request
  authenticatedFetch: async (url: string, options: RequestInit = {}) => {
    const authHeaders = AuthUtils.getAuthHeaders()
    const headers = {
      ...authHeaders,
      ...options.headers
    } as Record<string, string>

    return fetch(url, {
      ...options,
      headers
    })
  },

  // Check if user is currently authenticated
  isAuthenticated: () => {
    return TokenStorage.exists()
  },

  // Redirect to login if not authenticated
  requireAuth: (redirectPath?: string) => {
    if (!AuthUtils.isAuthenticated()) {
      const loginUrl = redirectPath 
        ? `/login?redirect=${encodeURIComponent(redirectPath)}`
        : '/login'
      
      if (typeof window !== 'undefined') {
        window.location.href = loginUrl
      }
      return false
    }
    return true
  }
}

// Hook-like function for getting auth state (for components)
export const useAuthToken = () => {
  return {
    token: TokenStorage.get(),
    isAuthenticated: TokenStorage.exists(),
    headers: AuthUtils.getAuthHeaders()
  }
}
