// API endpoint to verify reset token is valid
import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token is verplicht' },
        { status: 400 }
      )
    }

    // Find token and check if it's valid
    const tokenResult = await DatabaseService.query(
      `SELECT prt.id, prt.user_id, prt.expires_at, prt.used, u.email
       FROM password_reset_tokens prt
       JOIN users u ON prt.user_id = u.id
       WHERE prt.token = $1`,
      [token]
    )

    if (tokenResult.length === 0) {
      return NextResponse.json(
        { error: 'Ongeldige of verlopen reset link' },
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
        { error: 'Deze reset link is verlopen' },
        { status: 400 }
      )
    }

    // Token is valid
    return NextResponse.json({
      valid: true,
      email: tokenData.email // Return email for UI display
    })

  } catch (error) {
    console.error('[Verify Reset Token] Error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het verifiëren van de reset link' },
      { status: 500 }
    )
  }
}

