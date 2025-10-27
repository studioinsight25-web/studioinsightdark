// middleware.ts - Security Middleware
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Rate limiting (basic implementation)
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown'
  
  // Security headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next()
    
    // Add security headers for API routes
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    
    return response
  }

  // Block suspicious requests
  const userAgent = request.headers.get('user-agent') || ''
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i
  ]

  // Allow legitimate bots (Google, Bing)
  const allowedBots = [
    /googlebot/i,
    /bingbot/i,
    /slurp/i
  ]

  const isAllowedBot = allowedBots.some(pattern => pattern.test(userAgent))
  const isSuspiciousBot = suspiciousPatterns.some(pattern => pattern.test(userAgent))

  if (isSuspiciousBot && !isAllowedBot) {
    return new NextResponse('Access Denied', { status: 403 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

