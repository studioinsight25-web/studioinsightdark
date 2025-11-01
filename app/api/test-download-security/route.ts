// app/api/test-download-security/route.ts - Test endpoint to verify download security
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session-server'
import { DigitalProductDatabaseService } from '@/lib/digital-products-database'
import { OrderService } from '@/lib/orders'

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request)
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'productId parameter required' },
        { status: 400 }
      )
    }

    // Test 1: Check if user has purchased the product
    const hasPurchased = await DigitalProductDatabaseService.hasUserPurchasedProduct(
      session.userId,
      productId
    )

    // Test 2: Get user's orders to verify
    const orders = await OrderService.getUserOrders(session.userId)
    const paidOrders = orders.filter(order => {
      const status = typeof order.status === 'string' ? order.status.toLowerCase() : order.status
      return status === 'paid'
    })

    // Test 3: Check if product is in paid orders
    const productInOrders = paidOrders.some(order => 
      order.items.some(item => item.id === productId)
    )

    // Test 4: Get digital products for this product
    const digitalProducts = await DigitalProductDatabaseService.getDigitalProductsByProductId(productId)

    // Test 5: For each digital product, check if user can download
    const downloadAccess = await Promise.all(
      digitalProducts.map(async (dp) => ({
        digitalProductId: dp.id,
        canDownload: await DigitalProductDatabaseService.canUserDownload(session.userId, dp.id)
      }))
    )

    return NextResponse.json({
      userId: session.userId,
      productId,
      tests: {
        hasPurchasedProduct: hasPurchased,
        productInPaidOrders: productInOrders,
        totalPaidOrders: paidOrders.length,
        digitalProductsCount: digitalProducts.length,
        downloadAccess
      },
      orders: paidOrders.map(order => ({
        id: order.id,
        status: order.status,
        items: order.items.map(item => ({
          id: item.id,
          name: item.name
        }))
      })),
      digitalProducts: digitalProducts.map(dp => ({
        id: dp.id,
        productId: dp.productId,
        fileName: dp.fileName
      }))
    })
  } catch (error) {
    console.error('Test download security error:', error)
    return NextResponse.json(
      { 
        error: 'Test failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

