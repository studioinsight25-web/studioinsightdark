import { NextResponse } from 'next/server'
import { brevoSendConfirmationEmail } from '@/lib/brevo'

/**
 * Diagnostic endpoint to check Brevo configuration
 * Only accessible in development or with proper authentication in production
 */
export async function GET(request: Request) {
  // Security: Only allow in development or with secret query param
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  
  if (process.env.NODE_ENV === 'production' && secret !== process.env.DIAGNOSTIC_SECRET) {
    return NextResponse.json({ error: 'Not available in production without secret' }, { status: 403 })
  }

  const checks = {
    BREVO_API_KEY: !!process.env.BREVO_API_KEY,
    BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL || 'not set (will use default: no-reply@studio-insight.nl)',
    BREVO_SENDER_NAME: process.env.BREVO_SENDER_NAME || 'not set (will use default: Studio Insight)',
    BREVO_LIST_ID: process.env.BREVO_LIST_ID || 'not set (optional)',
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'not set (will use default)',
  }

  const allConfigured = checks.BREVO_API_KEY && checks.NEXT_PUBLIC_BASE_URL

  // Try to send a test email if requested
  const testEmail = searchParams.get('test')
  let testResult = null
  if (testEmail && allConfigured) {
    const testUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/newsletter/confirm?token=test`
    testResult = await brevoSendConfirmationEmail(testEmail, 'Test User', testUrl)
  }

  return NextResponse.json({
    configured: allConfigured,
    checks,
    testResult,
    message: allConfigured 
      ? '✅ Brevo is configured correctly. Check testResult if you tested an email.' 
      : '❌ Brevo configuration is incomplete. Please check your environment variables.',
    required: [
      'BREVO_API_KEY - Your Brevo API key from https://app.brevo.com/settings/keys/api',
      'NEXT_PUBLIC_BASE_URL - Your site URL (e.g., https://studio-insight.nl)',
    ],
    optional: [
      'BREVO_SENDER_EMAIL - Default: no-reply@studio-insight.nl (MUST be verified in Brevo!)',
      'BREVO_SENDER_NAME - Default: Studio Insight',
      'BREVO_LIST_ID - List ID for confirmed subscribers',
    ],
    commonIssues: [
      'Sender email not verified in Brevo dashboard → Go to https://app.brevo.com/settings/senders and verify your sender email',
      'API key has no email sending permissions → Check your Brevo API key permissions',
      'Rate limit reached → Check your Brevo account limits',
      'Invalid API key → Regenerate your API key in Brevo dashboard',
    ],
    usage: allConfigured 
      ? 'Add ?test=your@email.com to test sending an email' 
      : 'Fix configuration first'
  })
}

