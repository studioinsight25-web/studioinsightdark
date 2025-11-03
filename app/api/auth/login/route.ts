import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email en wachtwoord zijn verplicht' },
        { status: 400 }
      )
    }

    console.log('🔍 Attempting login for:', email)

    // Get user from database
    const result = await DatabaseService.query(
      'SELECT id, email, name, password, role, two_factor_enabled, two_factor_verified, totp_secret, created_at, updated_at FROM users WHERE email = $1',
      [email]
    )

    if (result.length === 0) {
      console.log('❌ User not found:', email)
      return NextResponse.json(
        { error: 'Ongeldige inloggegevens' },
        { status: 401 }
      )
    }

    const user = result[0]
    console.log('✅ User found:', user.email, 'Role:', user.role)

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      console.log('❌ Invalid password for:', email)
      return NextResponse.json(
        { error: 'Ongeldige inloggegevens' },
        { status: 401 }
      )
    }

    console.log('✅ Login successful for:', email)

    // 2FA verplicht indien ADMIN en (enabled of secret aanwezig)
    const require2FA = (user.role === 'ADMIN') && ((user.two_factor_enabled === true) || (user.totp_secret && user.totp_secret !== null))

    // Create/update session cookie so subsequent 2FA endpoints can read role/id
    const session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      twoFactorRequired: require2FA,
      twoFactorVerified: require2FA ? false : user.two_factor_verified === true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }

    const cookie = `studio-insight-session=${encodeURIComponent(JSON.stringify(session))}; Path=/; Max-Age=${24 * 60 * 60}; SameSite=Lax; Secure`

    // Return user data (without password)
    return new NextResponse(
      JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          twoFactorEnabled: require2FA,
          twoFactorVerified: session.twoFactorVerified
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie } }
    )

  } catch (error) {
    console.error('❌ Login error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het inloggen' },
      { status: 500 }
    )
  }
}