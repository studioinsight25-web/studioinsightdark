import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'
import { brevoUpsertContact, brevoSendWelcomeEmail } from '@/lib/brevo'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Ontbrekende bevestigingstoken' }, { status: 400 })
    }

    // Find subscription by token
    const result = await DatabaseService.query(
      'SELECT * FROM "newsletterSubscriptions" WHERE "confirmationToken" = $1 AND status = $2',
      [token, 'pending']
    )

    if (result.length === 0) {
      return NextResponse.json({ error: 'Ongeldige of verlopen token' }, { status: 404 })
    }

    const subscription = result[0]

    // Confirm subscription
    await DatabaseService.query(
      'UPDATE "newsletterSubscriptions" SET status = $1, "confirmedAt" = NOW(), "updatedAt" = NOW() WHERE id = $2',
      ['confirmed', subscription.id]
    )

    // Sync with Brevo (confirmed status)
    try {
      await brevoUpsertContact(subscription.email, subscription.name || undefined, 'confirmed')
    } catch (e) {
      console.warn('Brevo sync failed (non-blocking):', e)
    }

    // Send welcome email (non-blocking)
    try {
      await brevoSendWelcomeEmail(subscription.email, subscription.name || undefined)
    } catch (e) {
      console.warn('Welcome email failed (non-blocking):', e)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Inschrijving bevestigd! Welkom bij Studio Insight.' 
    })
  } catch (error) {
    console.error('Error confirming newsletter subscription:', error)
    return NextResponse.json({ error: 'Kon inschrijving niet bevestigen' }, { status: 500 })
  }
}