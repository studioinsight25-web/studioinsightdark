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
    const confirmationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/newsletter/confirm?token=${confirmationToken}`
    
    try {
      await brevoSendConfirmationEmail(normalizedEmail, name || '', confirmationUrl)
    } catch (e) {
      console.warn('Confirmation email failed:', e)
    }

    // Sync with Brevo (pending status)
    try {
      await brevoUpsertContact(normalizedEmail, name, 'pending')
    } catch (e) {
      console.warn('Brevo sync failed (non-blocking):', e)
    }

    return NextResponse.json({ 
      ...subscription, 
      message: 'Bevestigingsmail verzonden. Check je inbox!' 
    }, { status: 201 })
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