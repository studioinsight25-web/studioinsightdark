// API endpoint to request password reset
import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'E-mailadres is verplicht' },
        { status: 400 }
      )
    }

    console.log(`[Forgot Password] Password reset requested for: ${email}`)

    // Check if user exists
    const userResult = await DatabaseService.query(
      'SELECT id, email, name FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    )

    // Always return success (security best practice - don't reveal if email exists)
    // But only send email if user actually exists
    if (userResult.length === 0) {
      console.log(`[Forgot Password] User not found (but returning success for security): ${email}`)
      return NextResponse.json({
        success: true,
        message: 'Als dit e-mailadres bestaat, ontvang je een wachtwoord reset link.'
      })
    }

    const user = userResult[0]

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Delete any existing unused tokens for this user
    await DatabaseService.query(
      'DELETE FROM password_reset_tokens WHERE user_id = $1 AND used = FALSE',
      [user.id]
    )

    // Insert new reset token
    await DatabaseService.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [user.id, resetToken, expiresAt]
    )

    console.log(`[Forgot Password] Reset token created for user: ${user.email}`)

    // Generate reset link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://studioinsightdark.vercel.app'
    const resetLink = `${baseUrl}/wachtwoord-resetten?token=${resetToken}`

    // TODO: Send email with reset link
    // For now, log it (in production, use email service like SendGrid, Resend, etc.)
    console.log(`[Forgot Password] Reset link for ${user.email}: ${resetLink}`)
    
    // In development/production, send actual email:
    // await sendPasswordResetEmail(user.email, user.name, resetLink)

    return NextResponse.json({
      success: true,
      message: 'Als dit e-mailadres bestaat, ontvang je een wachtwoord reset link.'
    })

  } catch (error) {
    console.error('[Forgot Password] Error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden. Probeer het later opnieuw.' },
      { status: 500 }
    )
  }
}

