// API endpoint to request password reset
import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'
import { brevoSendEmail } from '@/lib/brevo'
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

    // Send email via Brevo
    const userName: string = user.name || user.email.split('@')[0]
    const subject = 'Reset je wachtwoord – Studio Insight'
    const htmlContent = `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 660px; margin: 0 auto; background: #0b0f17; color: #e6e9ef; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #10b981, #22d3ee); padding: 28px 32px;">
          <h1 style="margin: 0; font-size: 22px; line-height: 1.3;">Wachtwoord resetten</h1>
          <p style="margin: 8px 0 0; opacity: 0.9;">Hi ${userName}, we hebben een verzoek ontvangen om je wachtwoord te resetten.</p>
        </div>

        <div style="padding: 28px 32px;">
          <p style="margin: 0 0 16px;">Klik op de knop hieronder om je wachtwoord te wijzigen. Deze link is 60 minuten geldig.</p>
          <div style="margin: 20px 0; text-align: center;">
            <a href="${resetLink}" style="background:#10b981; color:#0b0f17; text-decoration:none; padding:12px 22px; border-radius:10px; display:inline-block; font-weight:600;">Reset wachtwoord</a>
          </div>
          <p style="margin: 16px 0 0; font-size: 12px; opacity: .75;">Heb jij dit niet aangevraagd? Negeer deze e‑mail – je wachtwoord blijft ongewijzigd.</p>
        </div>

        <div style="padding: 18px 32px; border-top: 1px solid #1b2333; font-size: 12px; opacity: .75;">
          Studio Insight • ${new Date().getFullYear()}
        </div>
      </div>
    `

    const emailResult = await brevoSendEmail(user.email, subject, htmlContent, userName)

    if (!emailResult.sent) {
      // Niet falen voor de gebruiker om enumeratie te voorkomen; wel loggen voor diagnose
      console.error('[Forgot Password] Failed to send Brevo email', emailResult)
    } else {
      console.log('[Forgot Password] Reset email sent via Brevo', { messageId: emailResult.messageId })
    }

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

