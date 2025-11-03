import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'
import { authenticator } from 'otplib'

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('studio-insight-session')
    if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const session = JSON.parse(sessionCookie.value)
    if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    let { token } = await request.json()
    if (typeof token === 'string') {
      token = token.replace(/\s+/g, '')
    }
    if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

    const result = await DatabaseService.query('SELECT totp_secret FROM users WHERE id = $1', [session.userId])
    if (result.length === 0 || !result[0].totp_secret) {
      return NextResponse.json({ error: '2FA not enrolled' }, { status: 400 })
    }

    const secret = result[0].totp_secret as string
    // Allow clock drift (±2 timesteps ≈ ±60s) to reduce false negatives
    authenticator.options = { step: 30, window: [2, 2] }
    const isValid = authenticator.verify({ token, secret })
    if (!isValid) return NextResponse.json({ error: 'Invalid code' }, { status: 400 })

    await DatabaseService.query(
      'UPDATE users SET two_factor_enabled = TRUE, two_factor_verified = TRUE, updated_at = NOW() WHERE id = $1',
      [session.userId]
    )

    const updated = { ...session, twoFactorRequired: true, twoFactorVerified: true }
    const cookie = `studio-insight-session=${encodeURIComponent(JSON.stringify(updated))}; Path=/; Max-Age=${24 * 60 * 60}; SameSite=Lax; Secure`

    return new NextResponse(JSON.stringify({ verified: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie }
    })
  } catch (error) {
    console.error('[2FA Verify] Error:', error)
    return NextResponse.json({ error: 'Failed to verify 2FA', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}

// Friendly response for accidental GET visits (instead of 405 page)
export async function GET() {
  return NextResponse.json({
    message: 'Use POST with JSON { token: "123456" } to verify 2FA. Open de 2FA-verify pagina niet rechtstreeks; gebruik de knop Verifiëren in de app.'
  })
}


