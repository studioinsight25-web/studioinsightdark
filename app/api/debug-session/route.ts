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
    let directQueryResult = null
    let allUsers = null
    
    // Try to get all users for debugging
    try {
      const { DatabaseService } = await import('@/lib/database-direct')
      allUsers = await DatabaseService.query('SELECT id, email, name, role FROM users LIMIT 10')
    } catch (e) {
      console.error('Error fetching all users:', e)
    }
    
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
    
    // Try direct database query
    if (session?.email || session?.userId) {
      try {
        const { DatabaseService } = await import('@/lib/database-direct')
        if (session.email) {
          const result = await DatabaseService.query(
            'SELECT id, email, name, role FROM users WHERE LOWER(email) = LOWER($1)',
            [session.email]
          )
          directQueryResult = result.length > 0 ? result[0] : null
        }
      } catch (e) {
        console.error('Error with direct query:', e)
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
          email: userFromId.email,
          name: userFromId.name,
          role: userFromId.role
        } : null,
        userFromEmail: userFromEmail ? {
          id: userFromEmail.id,
          email: userFromEmail.email,
          name: userFromEmail.name,
          role: userFromEmail.role
        } : null,
        directQueryResult: directQueryResult,
        allUsersInDatabase: allUsers || []
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

