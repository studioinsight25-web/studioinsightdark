// app/api/invoice/send/route.ts - Send invoice for existing order
import { NextRequest, NextResponse } from 'next/server'
import { getInvoiceData, sendInvoiceEmails, getLogoUrl } from '@/lib/invoice'
import { brevoSendEmail } from '@/lib/brevo'
import { DatabaseService } from '@/lib/database-direct'

async function generatePDFFromHTML(html: string): Promise<Buffer | null> {
  try {
    const doppioApiKey = process.env.DOPPIO_API_KEY
    if (doppioApiKey) {
      const response = await fetch('https://api.doppio.sh/v1/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${doppioApiKey}`
        },
        body: JSON.stringify({
          html: html,
          format: 'A4',
          printBackground: true,
          margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' }
        })
      })
      
      if (response.ok) {
        const pdfBuffer = await response.arrayBuffer()
        return Buffer.from(pdfBuffer)
      }
    }
    
    const htmlpdfApiKey = process.env.HTMLPDF_API_KEY
    if (htmlpdfApiKey) {
      const response = await fetch('https://htmlpdf.io/api/v1/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': htmlpdfApiKey
        },
        body: JSON.stringify({
          html: html,
          format: 'A4',
          margin: '20mm'
        })
      })
      
      if (response.ok) {
        const pdfBuffer = await response.arrayBuffer()
        return Buffer.from(pdfBuffer)
      }
    }
    
    return null
  } catch (error) {
    console.error('[Invoice Send] Error generating PDF:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const orderNumber = body.orderNumber || body.order_number
    const testEmail = body.email || body.testEmail

    if (!orderNumber) {
      return NextResponse.json(
        { error: 'Order number is required' },
        { status: 400 }
      )
    }

    console.log(`[Invoice Send] Looking for order with number: ${orderNumber}`)

    // Find order by order_number first, then try by ID if not found
    let orderResult
    try {
      // First try by order_number
      orderResult = await DatabaseService.query(
        `SELECT id, user_id, order_number, status, total_amount, payment_id, created_at, updated_at, paid_at 
         FROM orders WHERE order_number = $1`,
        [orderNumber]
      )
      
      // If not found, try by ID (partial match or full UUID)
      if (orderResult.length === 0) {
        console.log(`[Invoice Send] Order not found by order_number, trying by ID...`)
        try {
          orderResult = await DatabaseService.query(
            `SELECT id, user_id, order_number, status, total_amount, payment_id, created_at, updated_at, paid_at 
             FROM orders WHERE id::text LIKE $1 OR id::text = $2`,
            [`%${orderNumber}%`, orderNumber]
          )
        } catch (idError) {
          console.log(`[Invoice Send] Error querying by ID:`, idError)
        }
      }
    } catch (error) {
      console.error('[Invoice Send] Error querying order:', error)
      return NextResponse.json(
        { error: 'Error finding order' },
        { status: 500 }
      )
    }

    if (orderResult.length === 0) {
      console.error(`[Invoice Send] Order not found: ${orderNumber}`)
      return NextResponse.json(
        { error: `Order not found: ${orderNumber}. Try using full order number (e.g., ORD-1234567890-ABC123) or order ID.` },
        { status: 404 }
      )
    }

    const order = orderResult[0]
    console.log(`[Invoice Send] Found order: ${order.id}, status: ${order.status}`)

    // Get invoice data using existing function
    const invoiceData = await getInvoiceData(order.id)
    
    if (!invoiceData) {
      return NextResponse.json(
        { error: 'Could not generate invoice data' },
        { status: 500 }
      )
    }

    console.log(`[Invoice Send] Generated invoice data for order ${orderNumber}`)

    // If test email is provided, send test email instead of normal invoice
    if (testEmail) {
      const { generateCustomerInvoiceHTML } = await import('@/lib/invoice')
      const logoUrl = getLogoUrl()
      const customerHtml = generateCustomerInvoiceHTML(invoiceData, logoUrl)

      // Generate PDF
      const pdfBuffer = await generatePDFFromHTML(customerHtml)
      const pdfAttachment = pdfBuffer ? {
        name: `Factuur_${invoiceData.orderNumber}.pdf`,
        content: pdfBuffer
      } : undefined

      // Send test email
      const customerSubject = `[TEST] Factuur ${invoiceData.orderNumber} - Studio Insight`
      const customerResult = await brevoSendEmail(
        testEmail,
        customerSubject,
        customerHtml,
        invoiceData.customer.name,
        pdfAttachment
      )

      if (customerResult.sent) {
        return NextResponse.json({
          success: true,
          message: `Test factuur verstuurd naar ${testEmail}`,
          details: {
            orderNumber: invoiceData.orderNumber,
            orderId: order.id,
            customerEmail: invoiceData.customer.email,
            sentTo: testEmail,
            pdfAttached: !!pdfAttachment
          }
        })
      } else {
        return NextResponse.json({
          success: false,
          error: 'Failed to send test email',
          details: customerResult
        }, { status: 500 })
      }
    } else {
      // Send normal invoice emails (to customer and admin)
      const result = await sendInvoiceEmails(order.id)
      
      if (result.customerSent) {
        return NextResponse.json({
          success: true,
          message: `Factuur verstuurd voor order ${orderNumber}`,
          details: {
            orderNumber: invoiceData.orderNumber,
            orderId: order.id,
            customerEmail: invoiceData.customer.email,
            customerSent: result.customerSent,
            adminSent: result.adminSent,
            customerCopySent: result.customerCopySent
          }
        })
      } else {
        return NextResponse.json({
          success: false,
          error: 'Failed to send invoice emails',
          details: result
        }, { status: 500 })
      }
    }

  } catch (error) {
    console.error('[Invoice Send] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Fout bij verzenden factuur'
    }, { status: 500 })
  }
}

// GET endpoint for easy testing
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderNumber = searchParams.get('orderNumber') || searchParams.get('order_number')
    const email = searchParams.get('email') || searchParams.get('testEmail')

    if (!orderNumber) {
      return NextResponse.json(
        { error: 'Order number is required (use ?orderNumber=... or ?order_number=...)' },
        { status: 400 }
      )
    }

    console.log(`[Invoice Send] GET: Looking for order ${orderNumber}, test email: ${email || 'none'}`)

    // Find order by order_number first, then try by ID if not found
    let orderResult
    try {
      // First try by order_number
      orderResult = await DatabaseService.query(
        `SELECT id, user_id, order_number, status, total_amount, payment_id, created_at, updated_at, paid_at 
         FROM orders WHERE order_number = $1`,
        [orderNumber]
      )
      
      // If not found, try by ID (partial match or full UUID)
      if (orderResult.length === 0) {
        console.log(`[Invoice Send] Order not found by order_number, trying by ID...`)
        try {
          orderResult = await DatabaseService.query(
            `SELECT id, user_id, order_number, status, total_amount, payment_id, created_at, updated_at, paid_at 
             FROM orders WHERE id::text LIKE $1 OR id::text = $2`,
            [`%${orderNumber}%`, orderNumber]
          )
        } catch (idError) {
          console.log(`[Invoice Send] Error querying by ID:`, idError)
        }
      }
    } catch (error) {
      console.error('[Invoice Send] Error querying order:', error)
      return NextResponse.json(
        { error: 'Error finding order' },
        { status: 500 }
      )
    }

    if (orderResult.length === 0) {
      return NextResponse.json(
        { error: `Order not found: ${orderNumber}. Try using full order number (e.g., ORD-1234567890-ABC123) or order ID.` },
        { status: 404 }
      )
    }

    const order = orderResult[0]

    // Get invoice data
    const invoiceData = await getInvoiceData(order.id)
    
    if (!invoiceData) {
      return NextResponse.json(
        { error: 'Could not generate invoice data' },
        { status: 500 }
      )
    }

    // If test email provided, send test email
    if (email) {
      const { generateCustomerInvoiceHTML } = await import('@/lib/invoice')
      const logoUrl = getLogoUrl()
      const customerHtml = generateCustomerInvoiceHTML(invoiceData, logoUrl)

      const pdfBuffer = await generatePDFFromHTML(customerHtml)
      const pdfAttachment = pdfBuffer ? {
        name: `Factuur_${invoiceData.orderNumber}.pdf`,
        content: pdfBuffer
      } : undefined

      const customerSubject = `[TEST] Factuur ${invoiceData.orderNumber} - Studio Insight`
      const customerResult = await brevoSendEmail(
        email,
        customerSubject,
        customerHtml,
        invoiceData.customer.name,
        pdfAttachment
      )

      if (customerResult.sent) {
        return NextResponse.json({
          success: true,
          message: `Test factuur verstuurd naar ${email}`,
          details: {
            orderNumber: invoiceData.orderNumber,
            orderId: order.id,
            customerEmail: invoiceData.customer.email,
            sentTo: email,
            pdfAttached: !!pdfAttachment
          }
        })
      } else {
        return NextResponse.json({
          success: false,
          error: 'Failed to send test email',
          details: customerResult
        }, { status: 500 })
      }
    } else {
      // Return invoice data without sending
      return NextResponse.json({
        success: true,
        message: `Invoice data found for order ${orderNumber}`,
        invoiceData: {
          orderNumber: invoiceData.orderNumber,
          orderId: order.id,
          customerEmail: invoiceData.customer.email,
          customerName: invoiceData.customer.name,
          items: invoiceData.items.length,
          subtotal: invoiceData.subtotal,
          vatAmount: invoiceData.vatAmount,
          total: invoiceData.total
        },
        note: 'Add ?email=... to send test email'
      })
    }

  } catch (error) {
    console.error('[Invoice Send] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

