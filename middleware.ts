import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip login page
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }

    // TEMPORARILY BYPASS AUTH FOR DEVELOPMENT/TESTING
    // Allow access to all admin routes without authentication
    return NextResponse.next()

    /* Original auth check code (commented out for now)
    // Check for session cookie or authorization header
    const sessionCookie = request.cookies.get('studio-insight-session')
    
    if (!sessionCookie) {
      // Redirect to admin login
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      const session = JSON.parse(sessionCookie.value)
      
      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      // Check if user is admin
      if (session.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      // Allow access
      return NextResponse.next()
    } catch (error) {
      // Invalid session
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    */
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}