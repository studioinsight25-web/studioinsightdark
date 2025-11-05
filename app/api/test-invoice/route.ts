// app/api/test-invoice/route.ts - Test Invoice Endpoint
import { NextRequest, NextResponse } from 'next/server'
import { generateCustomerInvoiceHTML, generateAdminInvoiceHTML, InvoiceData, getLogoUrl } from '@/lib/invoice'
import { brevoSendEmail } from '@/lib/brevo'
import { DatabaseProductService } from '@/lib/products-database'

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

    // Fetch real products from database (1 course for test invoice)
    const allProducts = await DatabaseProductService.getAllProducts()
    const activeProducts = allProducts
      .filter(p => p.isActive && p.price > 0 && p.type === 'course')
      .slice(0, 1) // Take first 1 course
    
    // If no products found, use fallback test data
    let invoiceItems: Array<{ name: string; quantity: number; price: number; subtotal: number }> = []
    let totalInclVAT = 0
    
    if (activeProducts.length > 0) {
      console.log(`[Test Invoice] Using ${activeProducts.length} real products from database`)
      invoiceItems = activeProducts.map(product => {
        const price = product.price // Price is already in cents and includes VAT
        return {
          name: product.name,
          quantity: 1,
          price: price,
          subtotal: price
        }
      })
      totalInclVAT = invoiceItems.reduce((sum, item) => sum + item.subtotal, 0)
    } else {
      console.log('[Test Invoice] No active products found, using fallback test data')
      invoiceItems = [
        {
          name: 'Test Cursus - Marketing Masterclass',
          quantity: 1,
          price: 9900, // €99,00 in cents (inclusief BTW)
          subtotal: 9900
        },
        {
          name: 'Test E-book - Business Strategie',
          quantity: 1,
          price: 4900, // €49,00 in cents (inclusief BTW)
          subtotal: 4900
        }
      ]
      totalInclVAT = 14800
    }

    // Calculate BTW: prices are inclusive of VAT (21%)
    const VAT_RATE = 0.21
    const subtotalExclVAT = Math.round(totalInclVAT / (1 + VAT_RATE))
    const vatAmount = totalInclVAT - subtotalExclVAT

    // Create test invoice data with real products
    const testInvoiceData: InvoiceData = {
      orderId: 'test-order-' + Date.now(),
      orderNumber: 'TEST-' + Date.now(),
      orderDate: new Date().toISOString(),
      paymentDate: new Date().toISOString(),
      customer: {
        name: 'Test Klant',
        email: testEmail,
        address: 'Teststraat 123',
        city: 'Amsterdam',
        postcode: '1234 AB',
        country: 'Nederland',
        company: 'Test Bedrijf BV'
      },
      items: invoiceItems,
      subtotal: subtotalExclVAT, // Subtotaal exclusief BTW
      vatAmount: vatAmount, // BTW bedrag
      total: totalInclVAT, // Totaal inclusief BTW
      paymentId: 'test_payment_' + Date.now()
    }
    
    console.log(`[Test Invoice] Generated invoice with ${invoiceItems.length} items, total: €${(totalInclVAT / 100).toFixed(2)}, VAT: €${(vatAmount / 100).toFixed(2)}`)

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

    // Fetch real products from database (1 course for test invoice)
    const allProducts = await DatabaseProductService.getAllProducts()
    const activeProducts = allProducts
      .filter(p => p.isActive && p.price > 0 && p.type === 'course')
      .slice(0, 1) // Take first 1 course
    
    // If no products found, use fallback test data
    let invoiceItems: Array<{ name: string; quantity: number; price: number; subtotal: number }> = []
    let totalInclVAT = 0
    
    if (activeProducts.length > 0) {
      console.log(`[Test Invoice] Using ${activeProducts.length} real products from database`)
      invoiceItems = activeProducts.map(product => {
        const price = product.price // Price is already in cents and includes VAT
        return {
          name: product.name,
          quantity: 1,
          price: price,
          subtotal: price
        }
      })
      totalInclVAT = invoiceItems.reduce((sum, item) => sum + item.subtotal, 0)
    } else {
      console.log('[Test Invoice] No active products found, using fallback test data')
      invoiceItems = [
        {
          name: 'Test Cursus - Marketing Masterclass',
          quantity: 1,
          price: 9900, // €99,00 in cents (inclusief BTW)
          subtotal: 9900
        },
        {
          name: 'Test E-book - Business Strategie',
          quantity: 1,
          price: 4900, // €49,00 in cents (inclusief BTW)
          subtotal: 4900
        }
      ]
      totalInclVAT = 14800
    }

    // Calculate BTW: prices are inclusive of VAT (21%)
    const VAT_RATE = 0.21
    const subtotalExclVAT = Math.round(totalInclVAT / (1 + VAT_RATE))
    const vatAmount = totalInclVAT - subtotalExclVAT

    // Create test invoice data with real products
    const testInvoiceData: InvoiceData = {
      orderId: 'test-order-' + Date.now(),
      orderNumber: 'TEST-' + Date.now(),
      orderDate: new Date().toISOString(),
      paymentDate: new Date().toISOString(),
      customer: {
        name: 'Test Klant',
        email: email,
        address: 'Teststraat 123',
        city: 'Amsterdam',
        postcode: '1234 AB',
        country: 'Nederland',
        company: 'Test Bedrijf BV'
      },
      items: invoiceItems,
      subtotal: subtotalExclVAT, // Subtotaal exclusief BTW
      vatAmount: vatAmount, // BTW bedrag
      total: totalInclVAT, // Totaal inclusief BTW
      paymentId: 'test_payment_' + Date.now()
    }
    
    console.log(`[Test Invoice] Generated invoice with ${invoiceItems.length} items, total: €${(totalInclVAT / 100).toFixed(2)}, VAT: €${(vatAmount / 100).toFixed(2)}`)

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

