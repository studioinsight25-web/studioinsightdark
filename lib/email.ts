// lib/email.ts - Simple email utility using Resend
import { Resend } from 'resend'

let resendClient: Resend | null = null
const apiKey = process.env.RESEND_API_KEY

if (apiKey) {
  resendClient = new Resend(apiKey)
} else {
  console.warn('[Email] RESEND_API_KEY not configured. Emails will be logged to console.')
}

export async function sendPasswordResetEmail(params: {
  to: string
  name?: string | null
  resetLink: string
}) {
  const { to, name, resetLink } = params

  const subject = 'Wachtwoord resetten – Studio Insight'
  const preview = 'Klik op de link om je wachtwoord te resetten. Deze link is 1 uur geldig.'

  const html = `
    <div style="font-family:Inter,Segoe UI,Arial,sans-serif;line-height:1.6;padding:24px;background:#0b0b0c;color:#e6e6e6">
      <h2 style="margin:0 0 12px 0;color:#fff">Wachtwoord resetten</h2>
      <p style="margin:0 0 16px 0">${name ? `Hallo ${name},` : 'Hallo,'}</p>
      <p style="margin:0 0 16px 0">We hebben een verzoek ontvangen om je wachtwoord te resetten. Klik op de knop hieronder om een nieuw wachtwoord in te stellen. Deze link is <strong>1 uur</strong> geldig.</p>
      <p style="margin:0 0 20px 0">
        <a href="${resetLink}" style="display:inline-block;background:#a3ff12;color:#000;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px">Wachtwoord resetten</a>
      </p>
      <p style="margin:0 0 12px 0">Werkt de knop niet? Kopieer en plak deze URL in je browser:</p>
      <p style="margin:0 0 20px 0;word-break:break-all"><a href="${resetLink}" style="color:#a3ff12">${resetLink}</a></p>
      <hr style="border:none;border-top:1px solid #222;margin:20px 0" />
      <p style="margin:0 0 8px 0;color:#bbb;font-size:12px">Als jij dit niet hebt aangevraagd kun je deze e-mail negeren.</p>
      <p style="margin:0;color:#777;font-size:12px">Studio Insight • De Veken 122b, 1716 KG Opmeer</p>
    </div>
  `

  if (!resendClient) {
    console.log('[Email][DEV] Would send reset email to:', to, 'resetLink:', resetLink)
    return { success: true, dev: true }
  }

  try {
    await resendClient.emails.send({
      from: 'Studio Insight <no-reply@studio-insight.nl>',
      to,
      subject,
      html,
      headers: { 'X-Entity-Ref-ID': 'password-reset' },
    })
    return { success: true }
  } catch (error) {
    console.error('[Email] Failed to send password reset email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}


