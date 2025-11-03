import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'
import { authenticator } from 'otplib'
import QRCode from 'qrcode'

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('studio-insight-session')
    if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const session = JSON.parse(sessionCookie.value)
    if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const secret = authenticator.generateSecret()
    const label = `StudioInsight:${session.email}`
    const issuer = 'StudioInsight'
    const otpauth = authenticator.keyuri(session.email, issuer, secret)
    const qr = await QRCode.toDataURL(otpauth)

    await DatabaseService.query(
      'UPDATE users SET totp_secret = $1, two_factor_enabled = FALSE, two_factor_verified = FALSE, updated_at = NOW() WHERE id = $2',
      [secret, session.userId]
    )

    // Mark session that 2FA required from now on
    const updated = { ...session, twoFactorRequired: true, twoFactorVerified: false }
    const cookie = `studio-insight-session=${encodeURIComponent(JSON.stringify(updated))}; Path=/; Max-Age=${24 * 60 * 60}; SameSite=Lax; Secure`

    return new NextResponse(JSON.stringify({ otpauth, qr }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie }
    })
  } catch (error) {
    console.error('[2FA Enroll] Error:', error)
    return NextResponse.json({ error: 'Failed to enroll 2FA', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}


