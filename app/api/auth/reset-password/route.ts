// API endpoint to reset password using token
import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token en nieuw wachtwoord zijn verplicht' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Wachtwoord moet minimaal 8 tekens lang zijn' },
        { status: 400 }
      )
    }

    // Find token
    const tokenResult = await DatabaseService.query(
      `SELECT prt.id, prt.user_id, prt.expires_at, prt.used
       FROM password_reset_tokens prt
       WHERE prt.token = $1`,
      [token]
    )

    if (tokenResult.length === 0) {
      return NextResponse.json(
        { error: 'Ongeldige reset link' },
        { status: 400 }
      )
    }

    const tokenData = tokenResult[0]

    // Check if token is already used
    if (tokenData.used) {
      return NextResponse.json(
        { error: 'Deze reset link is al gebruikt' },
        { status: 400 }
      )
    }

    // Check if token is expired
    const expiresAt = new Date(tokenData.expires_at)
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Deze reset link is verlopen. Vraag een nieuwe aan.' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update user password
    await DatabaseService.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, tokenData.user_id]
    )

    // Mark token as used
    await DatabaseService.query(
      'UPDATE password_reset_tokens SET used = TRUE, updated_at = NOW() WHERE id = $1',
      [tokenData.id]
    )

    console.log(`[Reset Password] Password reset successful for user: ${tokenData.user_id}`)

    return NextResponse.json({
      success: true,
      message: 'Wachtwoord is succesvol gewijzigd. Je kunt nu inloggen met je nieuwe wachtwoord.'
    })

  } catch (error) {
    console.error('[Reset Password] Error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het wijzigen van het wachtwoord' },
      { status: 500 }
    )
  }
}

