import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

// Password utilities
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12)
  return bcrypt.hash(password, salt)
}

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

// JWT utilities
export const generateToken = (payload: JWTPayload, expiresIn?: string): string => {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: expiresIn || JWT_EXPIRES_IN,
    algorithm: 'HS256'
  })
}

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

// Generate secure random tokens
export const generateSecureToken = (): string => {
  return crypto.randomBytes(32).toString('hex')
}

// Extract user from request
export const getUserFromRequest = async (request: NextRequest): Promise<any | null> => {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('auth-token')?.value

    if (!token) return null

    const payload = verifyToken(token)
    if (!payload) return null

    await dbConnect()
    const user = await User.findById(payload.userId).select('-password')
    return user
  } catch (error) {
    return null
  }
}

// Authentication middleware
export const requireAuth = async (request: NextRequest): Promise<NextResponse | null> => {
  const user = await getUserFromRequest(request)
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  // Add user to request context
  ;(request as any).user = user
  return null
}

// Role-based authorization middleware
export const requireRole = (roles: string[]) => {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const authError = await requireAuth(request)
    if (authError) return authError

    const user = (request as any).user
    
    if (!roles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return null
  }
}

// Check if user is admin
export const isAdmin = (user: any): boolean => {
  return user && (user.role === 'admin' || user.role === 'super_admin')
}

// Rate limiting utilities
const rateLimitMap = new Map()

export const rateLimit = (limit: number, windowMs: number) => {
  return (request: NextRequest): NextResponse | null => {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    const windowStart = now - windowMs

    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, [])
    }

    const requests = rateLimitMap.get(ip)
    const validRequests = requests.filter((timestamp: number) => timestamp > windowStart)

    if (validRequests.length >= limit) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    validRequests.push(now)
    rateLimitMap.set(ip, validRequests)
    return null
  }
}

// Input validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): boolean => {
  const minLength = password.length >= 8
  const hasLower = /(?=.*[a-z])/.test(password)
  const hasUpper = /(?=.*[A-Z])/.test(password)
  const hasNumber = /(?=.*\d)/.test(password)
  const hasSpecial = /(?=.*[@$!%*?&])/.test(password)
  
  return minLength && hasLower && hasUpper && hasNumber && hasSpecial
}

// Sanitize input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}

// Generate order number
export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD-${timestamp}-${random}`
}

// Generate SKU
export const generateSKU = (productName: string, variantName?: string): string => {
  const base = productName
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 6)
    .toUpperCase()
  
  const variant = variantName 
    ? variantName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase()
    : ''
  
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  
  return `${base}${variant}${random}`
}
