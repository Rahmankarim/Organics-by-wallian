import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

// Edge Runtime compatible JWT verification
export const verifyToken = async (token: string): Promise<JWTPayload | null> => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    // Decode payload (base64url decode)
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))

    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null
    }

    // Basic validation - ensure required fields exist
    if (!payload.userId || !payload.email || !payload.role) {
      return null
    }

    return payload as JWTPayload
  } catch (error) {
    return null
  }
}

// Extract token from request
export const getTokenFromRequest = (request: NextRequest): string | null => {
  // Check Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Check cookies
  const tokenCookie = request.cookies.get('auth-token')
  if (tokenCookie) {
    return tokenCookie.value
  }

  return null
}

// Verify request authentication
export const verifyRequestAuth = async (request: NextRequest): Promise<JWTPayload | null> => {
  const token = getTokenFromRequest(request)
  if (!token) {
    return null
  }

  return await verifyToken(token)
}

// Rate limiting utilities
const rateLimitMap = new Map<string, { count: number; lastReset: number }>()

export const rateLimit = (
  identifier: string,
  limit: number = 10,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean => {
  const now = Date.now()
  const key = identifier
  
  const current = rateLimitMap.get(key)
  
  if (!current) {
    rateLimitMap.set(key, { count: 1, lastReset: now })
    return true
  }
  
  // Reset window if expired
  if (now - current.lastReset > windowMs) {
    rateLimitMap.set(key, { count: 1, lastReset: now })
    return true
  }
  
  // Check if within limit
  if (current.count < limit) {
    current.count++
    return true
  }
  
  return false
}

// Clean up old rate limit entries
export const cleanupRateLimit = (): void => {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  
  for (const [key, value] of rateLimitMap.entries()) {
    if (now - value.lastReset > windowMs) {
      rateLimitMap.delete(key)
    }
  }
}
