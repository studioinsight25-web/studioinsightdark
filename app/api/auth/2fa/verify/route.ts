import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'
import { authenticator } from 'otplib'

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('studio-insight-session')
    if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const session = JSON.parse(sessionCookie.value)
    if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { token } = await request.json()
    if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

    const result = await DatabaseService.query('SELECT totp_secret FROM users WHERE id = $1', [session.userId])
    if (result.length === 0 || !result[0].totp_secret) {
      return NextResponse.json({ error: '2FA not enrolled' }, { status: 400 })
    }

    const secret = result[0].totp_secret as string
    const isValid = authenticator.check(token, secret)
    if (!isValid) return NextResponse.json({ error: 'Invalid code' }, { status: 400 })

    await DatabaseService.query(
      'UPDATE users SET two_factor_enabled = TRUE, two_factor_verified = TRUE, updated_at = NOW() WHERE id = $1',
      [session.userId]
    )

    const updated = { ...session, twoFactorRequired: true, twoFactorVerified: true }
    const cookie = `studio-insight-session=${encodeURIComponent(JSON.stringify(updated))}; Path=/; Max-Age=${24 * 60 * 60}; SameSite=Lax; ${request.nextUrl.protocol === 'https:' ? 'Secure' : ''}`

    return new NextResponse(JSON.stringify({ verified: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify 2FA' }, { status: 500 })
  }
}


