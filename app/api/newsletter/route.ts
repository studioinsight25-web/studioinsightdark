import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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

    // Upsert subscription (DB) with pending status
    const subscription = await prisma.newsletterSubscription.upsert({
      where: { email: normalizedEmail },
      update: {
        name: name || null,
        consent,
        status: 'pending',
        confirmationToken,
        confirmedAt: null,
      },
      create: {
        email: normalizedEmail,
        name: name || null,
        consent,
        status: 'pending',
        confirmationToken,
      },
    })

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
    console.error('Error subscribing to newsletter:', error)
    return NextResponse.json({ error: 'Kon je inschrijving niet verwerken' }, { status: 500 })
  }
}

export async function GET() {
  // Optional: basic count endpoint (no listing for privacy)
  try {
    const count = await prisma.newsletterSubscription.count({
      where: { status: 'confirmed' }
    })
    return NextResponse.json({ count })
  } catch (error) {
    return NextResponse.json({ count: 0 })
  }
}


