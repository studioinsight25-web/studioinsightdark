import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { brevoUpsertContact, brevoSendWelcomeEmail } from '@/lib/brevo'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Ontbrekende bevestigingstoken' }, { status: 400 })
    }

    // Find subscription by token
    const subscription = await prisma.newsletterSubscription.findFirst({
      where: {
        confirmationToken: token,
        status: 'pending'
      }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Ongeldige of verlopen token' }, { status: 404 })
    }

    // Confirm subscription
    await prisma.newsletterSubscription.update({
      where: { id: subscription.id },
      data: {
        status: 'confirmed',
        confirmedAt: new Date(),
      }
    })

    // Sync with Brevo (confirmed status)
    try {
      await brevoUpsertContact(subscription.email, subscription.name, 'confirmed')
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
