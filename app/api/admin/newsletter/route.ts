import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'
import { brevoUpsertContact } from '@/lib/brevo'
import { randomBytes } from 'crypto'

// Get all newsletter subscribers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'all', 'pending', 'confirmed'

    let query = 'SELECT * FROM "newsletterSubscriptions"'
    const params: any[] = []

    if (status && status !== 'all') {
      query += ' WHERE status = $1'
      params.push(status)
    }

    query += ' ORDER BY "createdAt" DESC'

    const subscriptions = await DatabaseService.query(query, params)

    return NextResponse.json(subscriptions.map((sub: any) => ({
      id: sub.id,
      email: sub.email,
      name: sub.name,
      consent: sub.consent,
      status: sub.status,
      confirmedAt: sub.confirmedAt,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt
    })))
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch newsletter subscribers' },
      { status: 500 }
    )
  }
}

// Create a new newsletter subscriber (admin)
export async function POST(request: NextRequest) {
  try {
    const { email, name, status = 'confirmed', skipConfirmation = true } = await request.json()

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
        'UPDATE "newsletterSubscriptions" SET name = $1, status = $2, "confirmedAt" = $3, "updatedAt" = NOW() WHERE email = $4 RETURNING *',
        [
          name || null,
          status,
          skipConfirmation && status === 'confirmed' ? new Date().toISOString() : null,
          normalizedEmail
        ]
      )
      subscription = result[0]
    } else {
      // Create new subscription
      const id = `newsletter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const result = await DatabaseService.query(
        'INSERT INTO "newsletterSubscriptions" (id, email, name, consent, status, "confirmationToken", "confirmedAt", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *',
        [
          id,
          normalizedEmail,
          name || null,
          true,
          status,
          confirmationToken,
          skipConfirmation && status === 'confirmed' ? new Date().toISOString() : null
        ]
      )
      subscription = result[0]
    }

    // Sync with Brevo (if confirmed)
    if (status === 'confirmed') {
      try {
        await brevoUpsertContact(normalizedEmail, name, 'confirmed')
      } catch (e) {
        console.warn('Brevo sync failed (non-blocking):', e)
      }
    }

    return NextResponse.json({
      id: subscription.id,
      email: subscription.email,
      name: subscription.name,
      consent: subscription.consent,
      status: subscription.status,
      confirmedAt: subscription.confirmedAt,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating newsletter subscriber:', error)
    return NextResponse.json(
      { error: 'Failed to create newsletter subscriber' },
      { status: 500 }
    )
  }
}

