import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/profile', '/orders', '/wishlist', '/settings']

// Routes that are only for unauthenticated users
const authRoutes = ['/signin', '/register', '/login']

// Admin only routes that need special protection
const adminRoutes = ['/admin/dashboard', '/admin/products', '/admin/orders', '/admin/users']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Handle admin route protection
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    // Check if user has admin authentication in localStorage (client-side check will be done)
    // For server-side, we'll redirect to admin login if no proper headers
    const adminAuth = request.cookies.get('adminAuth')
    
    if (!adminAuth) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Allow access to admin login page
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Redirect /admin to /admin/login for consistency
  if (pathname === '/admin') {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/wishlist/:path*',
    '/settings/:path*'
  ]
}
