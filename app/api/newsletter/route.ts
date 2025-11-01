import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'
import { brevoUpsertContact, brevoSendConfirmationEmail } from '@/lib/brevo'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email, name, consent = true } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'E-mail is verplicht' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const confirmationToken = randomBytes(32).toString('hex')

    // Ensure table exists (create if it doesn't)
    try {
      await DatabaseService.query(`
        CREATE TABLE IF NOT EXISTS "newsletterSubscriptions" (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255),
          consent BOOLEAN DEFAULT true,
          status VARCHAR(50) DEFAULT 'pending',
          "confirmationToken" VARCHAR(255) UNIQUE,
          "confirmedAt" TIMESTAMP,
          "createdAt" TIMESTAMP DEFAULT NOW(),
          "updatedAt" TIMESTAMP DEFAULT NOW()
        )
      `)
      await DatabaseService.query(`CREATE INDEX IF NOT EXISTS idx_newsletter_email ON "newsletterSubscriptions"(email)`)
      await DatabaseService.query(`CREATE INDEX IF NOT EXISTS idx_newsletter_status ON "newsletterSubscriptions"(status)`)
    } catch (tableError) {
      // Table might already exist or there's a real error - continue anyway
      console.log('Table creation check:', tableError)
    }

    // Check if subscription exists
    const existing = await DatabaseService.query(
      'SELECT id FROM "newsletterSubscriptions" WHERE email = $1',
      [normalizedEmail]
    )

    let subscription
    if (existing.length > 0) {
      // Update existing subscription
      const result = await DatabaseService.query(
        'UPDATE "newsletterSubscriptions" SET name = $1, consent = $2, status = $3, "confirmationToken" = $4, "confirmedAt" = NULL, "updatedAt" = NOW() WHERE email = $5 RETURNING *',
        [name || null, consent, 'pending', confirmationToken, normalizedEmail]
      )
      subscription = result[0]
    } else {
      // Create new subscription
      const id = `newsletter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const result = await DatabaseService.query(
        'INSERT INTO "newsletterSubscriptions" (id, email, name, consent, status, "confirmationToken", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *',
        [id, normalizedEmail, name || null, consent, 'pending', confirmationToken]
      )
      subscription = result[0]
    }

    // Send confirmation email
    // Get base URL: prefer env var, fallback to request origin, then localhost
    const getBaseUrl = () => {
      if (process.env.NEXT_PUBLIC_BASE_URL) {
        return process.env.NEXT_PUBLIC_BASE_URL
      }
      // Try to get from request origin
      try {
        const url = new URL(request.url)
        return `${url.protocol}//${url.host}`
      } catch {
        // Fallback to production URL or localhost
        return process.env.NODE_ENV === 'production' 
          ? 'https://studio-insight.nl' 
          : 'http://localhost:3000'
      }
    }
    const baseUrl = getBaseUrl()
    const confirmationUrl = `${baseUrl}/newsletter/confirm?token=${confirmationToken}`
    
    // Log for debugging
    console.log('📧 Newsletter confirmation URL:', {
      baseUrl,
      confirmationUrl: confirmationUrl.substring(0, 80) + '...',
      envVar: process.env.NEXT_PUBLIC_BASE_URL || 'not set'
    })
    
    let emailSent = false
    let emailError: any = null
    try {
      const emailResult = await brevoSendConfirmationEmail(normalizedEmail, name || '', confirmationUrl)
      emailSent = emailResult.sent === true
      
      if (!emailSent) {
        emailError = emailResult.reason || `HTTP ${emailResult.status}`
        console.error('❌ Newsletter confirmation email failed:', {
          email: normalizedEmail,
          reason: emailResult.reason,
          status: emailResult.status,
          details: emailResult.details
        })
      } else {
        console.log('✅ Newsletter confirmation email sent successfully to:', normalizedEmail)
      }
    } catch (e) {
      emailError = e instanceof Error ? e.message : String(e)
      console.error('❌ Newsletter confirmation email error:', {
        email: normalizedEmail,
        error: emailError
      })
    }

    // Sync with Brevo (pending status)
    try {
      await brevoUpsertContact(normalizedEmail, name, 'pending')
    } catch (e) {
      console.warn('Brevo sync failed (non-blocking):', e)
    }

    // Return response - ALWAYS warn if email failed but subscription was created
    const response: any = {
      ...subscription,
      message: emailSent 
        ? 'Bevestigingsmail verzonden. Check je inbox!' 
        : 'Inschrijving geregistreerd, maar bevestigingsmail kon niet worden verzonden. Controleer je spam of probeer het later opnieuw.',
      emailSent,
      ...(emailError && { emailError }) // Always include error if present
    }
    
    if (emailError && process.env.NODE_ENV === 'development') {
      response.debug = { emailError }
    }
    
    // Log warning to server logs if email failed
    if (!emailSent) {
      console.warn('⚠️ WARNING: Newsletter subscription created but email NOT sent:', {
        email: normalizedEmail,
        error: emailError,
        subscriptionId: subscription.id
      })
    }
    
    // Return 207 Multi-Status if email failed but subscription was created
    const statusCode = (emailError && !emailSent) ? 207 : 201
    
    return NextResponse.json(response, { status: statusCode })
  } catch (error) {
    console.error('❌ Error subscribing to newsletter:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Error details:', { errorMessage, errorStack })
    
    // Always return error details for debugging
    return NextResponse.json({ 
      error: 'Kon je inschrijving niet verwerken',
      details: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
    }, { status: 500 })
  }
}

export async function GET() {
  // Optional: basic count endpoint (no listing for privacy)
  try {
    const result = await DatabaseService.query(
      'SELECT COUNT(*) as count FROM "newsletterSubscriptions" WHERE status = $1',
      ['confirmed']
    )
    return NextResponse.json({ count: parseInt(result[0].count || '0', 10) })
  } catch (error) {
    return NextResponse.json({ count: 0 })
  }
}