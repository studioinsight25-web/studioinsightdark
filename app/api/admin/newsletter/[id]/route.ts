import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'
import { brevoUpsertContact } from '@/lib/brevo'

// Update newsletter subscriber
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { email, name, status } = await request.json()

    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (email !== undefined) {
      updates.push(`email = $${paramCount++}`)
      values.push(email.trim().toLowerCase())
    }

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`)
      values.push(name || null)
    }

    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`)
      values.push(status)

      // Update confirmedAt if status changed to confirmed
      if (status === 'confirmed') {
        updates.push(`"confirmedAt" = NOW()`)
      } else if (status === 'pending') {
        updates.push(`"confirmedAt" = NULL`)
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    updates.push(`"updatedAt" = NOW()`)
    values.push(id)

    const query = `UPDATE "newsletterSubscriptions" SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`
    
    const result = await DatabaseService.query(query, values)

    if (result.length === 0) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    const subscription = result[0]

    // Sync with Brevo if status changed
    if (status !== undefined) {
      try {
        await brevoUpsertContact(subscription.email, subscription.name, status)
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
    })
  } catch (error) {
    console.error('Error updating newsletter subscriber:', error)
    return NextResponse.json(
      { error: 'Failed to update newsletter subscriber' },
      { status: 500 }
    )
  }
}

// Delete newsletter subscriber
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await DatabaseService.query(
      'DELETE FROM "newsletterSubscriptions" WHERE id = $1 RETURNING id',
      [id]
    )

    if (result.length === 0) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting newsletter subscriber:', error)
    return NextResponse.json(
      { error: 'Failed to delete newsletter subscriber' },
      { status: 500 }
    )
  }
}

