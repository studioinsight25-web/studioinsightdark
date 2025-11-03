import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('studio-insight-session')
    if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const session = JSON.parse(sessionCookie.value)
    if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await DatabaseService.query(
      'UPDATE users SET totp_secret = NULL, two_factor_enabled = FALSE, two_factor_verified = FALSE, updated_at = NOW() WHERE id = $1',
      [session.userId]
    )

    const updated = { ...session, twoFactorRequired: false, twoFactorVerified: false }
    const cookie = `studio-insight-session=${encodeURIComponent(JSON.stringify(updated))}; Path=/; Max-Age=${24 * 60 * 60}; SameSite=Lax; ${request.nextUrl.protocol === 'https:' ? 'Secure' : ''}`

    return new NextResponse(JSON.stringify({ disabled: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 500 })
  }
}


