// app/api/debug-session/route.ts - Debug session endpoint
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session-server'
import { UserService } from '@/lib/user-database'

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie')
    const session = getSessionFromRequest(request)
    
    let userFromId = null
    let userFromEmail = null
    
    if (session?.userId) {
      try {
        userFromId = await UserService.getUserById(session.userId)
      } catch (e) {
        console.error('Error fetching user by ID:', e)
      }
    }
    
    if (session?.email) {
      try {
        userFromEmail = await UserService.getUserByEmail(session.email)
      } catch (e) {
        console.error('Error fetching user by email:', e)
      }
    }
    
    return NextResponse.json({
      debug: {
        hasCookieHeader: !!cookieHeader,
        cookieHeaderPreview: cookieHeader ? cookieHeader.substring(0, 200) : null,
        session: session ? {
          userId: session.userId,
          email: session.email,
          role: session.role,
          expiresAt: session.expiresAt
        } : null,
        userFromId: userFromId ? {
          id: userFromId.id,
          email: userFromId.email
        } : null,
        userFromEmail: userFromEmail ? {
          id: userFromEmail.id,
          email: userFromEmail.email
        } : null
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

