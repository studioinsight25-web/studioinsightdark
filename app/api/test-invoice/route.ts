// app/api/test-invoice/route.ts - Test Invoice Endpoint
import { NextRequest, NextResponse } from 'next/server'
import { generateCustomerInvoiceHTML, generateAdminInvoiceHTML, InvoiceData } from '@/lib/invoice'
import { brevoSendEmail } from '@/lib/brevo'

export async function POST(request: NextRequest) {
  try {
    // Get test email from request body or use default
    const body = await request.json().catch(() => ({}))
    const testEmail = body.email || 'info@studio-insight.nl'

    // Create test invoice data
    const testInvoiceData: InvoiceData = {
      orderId: 'test-order-' + Date.now(),
      orderNumber: 'TEST-' + Date.now(),
      orderDate: new Date().toISOString(),
      paymentDate: new Date().toISOString(),
      customer: {
        name: 'Test Klant',
        email: 'test@example.com',
        address: 'Teststraat 123',
        city: 'Amsterdam',
        postcode: '1234 AB',
        country: 'Nederland',
        company: 'Test Bedrijf BV'
      },
      items: [
        {
          name: 'Test Cursus - Marketing Masterclass',
          quantity: 1,
          price: 9900, // €99,00 in cents
          subtotal: 9900
        },
        {
          name: 'Test E-book - Business Strategie',
          quantity: 1,
          price: 4900, // €49,00 in cents
          subtotal: 4900
        }
      ],
      subtotal: 14800,
      total: 14800,
      paymentId: 'test_payment_' + Date.now()
    }

    // Generate invoice HTML
    const customerHtml = generateCustomerInvoiceHTML(testInvoiceData)
    const adminHtml = generateAdminInvoiceHTML(testInvoiceData)

    // Send test customer invoice
    const customerSubject = `[TEST] Factuur ${testInvoiceData.orderNumber} - Studio Insight`
    const customerResult = await brevoSendEmail(
      testEmail,
      customerSubject,
      customerHtml,
      'Test Gebruiker'
    )

    // Send test admin invoice
    const adminSubject = `[TEST ADMIN] Factuur ${testInvoiceData.orderNumber} - ${testInvoiceData.customer.name}`
    const adminResult = await brevoSendEmail(
      testEmail,
      adminSubject,
      adminHtml,
      'Studio Insight'
    )

    if (customerResult.sent && adminResult.sent) {
      return NextResponse.json({
        success: true,
        message: `Test facturen verstuurd naar ${testEmail}`,
        details: {
          customerInvoice: customerResult.sent ? 'Verzonden' : 'Mislukt',
          adminInvoice: adminResult.sent ? 'Verzonden' : 'Mislukt',
          invoiceNumber: testInvoiceData.orderNumber,
          customerEmail: testInvoiceData.customer.email,
          sentTo: testEmail
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Test facturen gedeeltelijk verzonden',
        details: {
          customerInvoice: customerResult,
          adminInvoice: adminResult,
          invoiceNumber: testInvoiceData.orderNumber
        }
      }, { status: 500 })
    }

  } catch (error) {
    console.error('[Test Invoice] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Fout bij verzenden test factuur'
    }, { status: 500 })
  }
}

// GET endpoint for easy testing
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email') || 'info@studio-insight.nl'

    // Create test invoice data
    const testInvoiceData: InvoiceData = {
      orderId: 'test-order-' + Date.now(),
      orderNumber: 'TEST-' + Date.now(),
      orderDate: new Date().toISOString(),
      paymentDate: new Date().toISOString(),
      customer: {
        name: 'Test Klant',
        email: 'test@example.com',
        address: 'Teststraat 123',
        city: 'Amsterdam',
        postcode: '1234 AB',
        country: 'Nederland',
        company: 'Test Bedrijf BV'
      },
      items: [
        {
          name: 'Test Cursus - Marketing Masterclass',
          quantity: 1,
          price: 9900,
          subtotal: 9900
        },
        {
          name: 'Test E-book - Business Strategie',
          quantity: 1,
          price: 4900,
          subtotal: 4900
        }
      ],
      subtotal: 14800,
      total: 14800,
      paymentId: 'test_payment_' + Date.now()
    }

    // Generate invoice HTML
    const customerHtml = generateCustomerInvoiceHTML(testInvoiceData)
    const adminHtml = generateAdminInvoiceHTML(testInvoiceData)

    // Send test customer invoice
    const customerSubject = `[TEST] Factuur ${testInvoiceData.orderNumber} - Studio Insight`
    const customerResult = await brevoSendEmail(
      email,
      customerSubject,
      customerHtml,
      'Test Gebruiker'
    )

    // Send test admin invoice
    const adminSubject = `[TEST ADMIN] Factuur ${testInvoiceData.orderNumber} - ${testInvoiceData.customer.name}`
    const adminResult = await brevoSendEmail(
      email,
      adminSubject,
      adminHtml,
      'Studio Insight'
    )

    if (customerResult.sent && adminResult.sent) {
      return NextResponse.json({
        success: true,
        message: `Test facturen verstuurd naar ${email}`,
        details: {
          customerInvoice: customerResult.sent ? 'Verzonden' : 'Mislukt',
          adminInvoice: adminResult.sent ? 'Verzonden' : 'Mislukt',
          invoiceNumber: testInvoiceData.orderNumber,
          customerEmail: testInvoiceData.customer.email,
          sentTo: email
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Test facturen gedeeltelijk verzonden',
        details: {
          customerInvoice: customerResult,
          adminInvoice: adminResult,
          invoiceNumber: testInvoiceData.orderNumber
        }
      }, { status: 500 })
    }

  } catch (error) {
    console.error('[Test Invoice] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Fout bij verzenden test factuur'
    }, { status: 500 })
  }
}

