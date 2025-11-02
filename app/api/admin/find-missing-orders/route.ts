// app/api/admin/find-missing-orders/route.ts - Check if a specific Mollie payment exists in database
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session-server'
import { DatabaseService } from '@/lib/database-direct'
import { createMollieClient } from '@mollie/api-client'

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request)
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if admin
    const userResult = await DatabaseService.query(
      'SELECT role FROM users WHERE id = $1',
      [session.userId]
    )

    if (userResult.length === 0 || userResult[0].role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')
    
    if (!paymentId) {
      return NextResponse.json({
        success: false,
        message: 'Please provide a paymentId parameter to check a specific payment',
        example: '/api/admin/find-missing-orders?paymentId=tr_xxxxx',
        instruction: 'To recreate a missing order, use: POST /api/admin/fix-missing-order with email and paymentId'
      })
    }

    // Get specific payment from Mollie
    const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY! })
    
    let payment
    try {
      payment = await mollieClient.payments.get(paymentId)
    } catch (error) {
      console.error('[Find Missing Orders] Error fetching Mollie payment:', error)
      return NextResponse.json(
        { 
          error: 'Failed to fetch Mollie payment',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

    // Check if payment exists in database
    const dbOrder = await DatabaseService.query(
      `SELECT id, user_id, payment_id, status, total_amount, created_at 
       FROM orders 
       WHERE payment_id = $1`,
      [paymentId]
    )

    const existsInDatabase = dbOrder.length > 0

    // Extract metadata if available
    let paymentMetadata: any = null
    let userId: string | null = null
    let productIds: string[] = []
    
    if (payment.metadata) {
      paymentMetadata = payment.metadata
      userId = paymentMetadata.userId || null
      productIds = paymentMetadata.products || []
    }

    // If payment is missing, try to find user info
    let userInfo = null
    if (!existsInDatabase && userId) {
      const userResult = await DatabaseService.query(
        'SELECT id, email, name FROM users WHERE id = $1',
        [userId]
      )
      if (userResult.length > 0) {
        userInfo = {
          id: userResult[0].id,
          email: userResult[0].email,
          name: userResult[0].name
        }
      }
    }

    return NextResponse.json({
      success: true,
      paymentId: paymentId,
      paymentStatus: payment.status,
      existsInDatabase: existsInDatabase,
      isPaid: payment.status === 'paid',
      orderInDatabase: existsInDatabase ? {
        id: dbOrder[0].id,
        userId: dbOrder[0].user_id,
        status: dbOrder[0].status,
        totalAmount: parseFloat(dbOrder[0].total_amount || '0')
      } : null,
      paymentDetails: {
        amount: payment.amount,
        description: payment.description,
        createdAt: payment.createdAt,
        metadata: paymentMetadata
      },
      metadata: {
        userId: userId,
        productIds: productIds,
        userInfo: userInfo
      },
      message: existsInDatabase 
        ? `Payment ${paymentId} exists in database` 
        : payment.status === 'paid'
        ? `⚠️ Payment ${paymentId} is PAID but missing from database. Use POST /api/admin/fix-missing-order to recreate.`
        : `Payment ${paymentId} status: ${payment.status} (not paid yet)`
    })

  } catch (error) {
    console.error('[Find Missing Orders] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
