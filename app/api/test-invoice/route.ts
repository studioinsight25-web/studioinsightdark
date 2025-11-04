// app/api/test-invoice/route.ts - Test Invoice Endpoint
import { NextRequest, NextResponse } from 'next/server'
import { generateCustomerInvoiceHTML, generateAdminInvoiceHTML, InvoiceData } from '@/lib/invoice'
import { brevoSendEmail } from '@/lib/brevo'

// Logo URL validation - must be HTTPS for email compatibility
function getLogoUrl(): string | null {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://studio-insight.nl'
  let logoUrl = process.env.INVOICE_LOGO_URL
  
  // If no logo URL is set, try Cloudinary default
  if (!logoUrl) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    if (cloudName) {
      logoUrl = `https://res.cloudinary.com/${cloudName}/image/upload/studio-insight/logo.png`
    }
  }
  
  // Validate HTTPS
  if (logoUrl && !logoUrl.startsWith('https://')) {
    console.warn('[Test Invoice] Logo URL must be HTTPS for email compatibility')
    return null
  }
  
  return logoUrl || null
}

async function generatePDFFromHTML(html: string): Promise<Buffer | null> {
  try {
    // Use Doppio API (lightweight, no build dependencies)
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
    
    // Alternative: HTMLtoPDF.io
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
    
    console.warn('[Test Invoice] PDF generation skipped - no API configured')
    return null
  } catch (error) {
    console.error('[Test Invoice] Error generating PDF:', error)
    return null
  }
}

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

    // Get HTTPS logo URL (required for email clients)
    const logoUrl = getLogoUrl()
    
    if (!logoUrl) {
      console.warn('[Test Invoice] No valid HTTPS logo URL found. Set INVOICE_LOGO_URL to a Cloudinary URL or other HTTPS URL.')
    }
    
    // Generate HTML with HTTPS URL only (works in all email clients)
    const customerHtml = generateCustomerInvoiceHTML(testInvoiceData, logoUrl)
    const adminHtml = generateAdminInvoiceHTML(testInvoiceData, logoUrl)

    // Generate PDF
    const pdfBuffer = await generatePDFFromHTML(customerHtml)
    const pdfAttachment = pdfBuffer ? {
      name: `Factuur_${testInvoiceData.orderNumber}.pdf`,
      content: pdfBuffer
    } : undefined

    // Send test customer invoice with PDF (no inline attachment needed - using URL/base64 in HTML)
    const customerSubject = `[TEST] Factuur ${testInvoiceData.orderNumber} - Studio Insight`
    const customerResult = await brevoSendEmail(
      testEmail,
      customerSubject,
      customerHtml,
      'Test Gebruiker',
      pdfAttachment
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

    // Get HTTPS logo URL (required for email clients)
    const logoUrl = getLogoUrl()
    
    if (!logoUrl) {
      console.warn('[Test Invoice] No valid HTTPS logo URL found. Set INVOICE_LOGO_URL to a Cloudinary URL or other HTTPS URL.')
    }
    
    // Generate HTML with HTTPS URL only (works in all email clients)
    const customerHtml = generateCustomerInvoiceHTML(testInvoiceData, logoUrl)
    const adminHtml = generateAdminInvoiceHTML(testInvoiceData, logoUrl)

    // Generate PDF
    const pdfBuffer = await generatePDFFromHTML(customerHtml)
    const pdfAttachment = pdfBuffer ? {
      name: `Factuur_${testInvoiceData.orderNumber}.pdf`,
      content: pdfBuffer
    } : undefined

    // Send test customer invoice with PDF
    const customerSubject = `[TEST] Factuur ${testInvoiceData.orderNumber} - Studio Insight`
    const customerResult = await brevoSendEmail(
      email,
      customerSubject,
      customerHtml,
      'Test Gebruiker',
      pdfAttachment
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

