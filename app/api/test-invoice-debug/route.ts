// app/api/test-invoice-debug/route.ts - Debug Invoice HTML
import { NextRequest, NextResponse } from 'next/server'
import { generateCustomerInvoiceHTML, InvoiceData, getLogoUrl } from '@/lib/invoice'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email') || 'info@studio-insight.nl'

    // Create test invoice data with correct BTW calculation
    const totalInclVAT = 14800 // €148,00 in cents
    const subtotalExclVAT = Math.round(totalInclVAT / 1.21)
    const vatAmount = totalInclVAT - subtotalExclVAT

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
      items: [
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
      ],
      subtotal: subtotalExclVAT,
      vatAmount: vatAmount,
      total: totalInclVAT,
      paymentId: 'test_payment_' + Date.now()
    }

    // Get logo URL
    const logoUrl = getLogoUrl()
    
    // Generate HTML
    const customerHtml = generateCustomerInvoiceHTML(testInvoiceData, logoUrl)

    // Extract BTW section from HTML for debugging
    const btwMatch = customerHtml.match(/BTW \(21%\):.*?€ ([^<]+)/)
    const subtotalMatch = customerHtml.match(/Subtotaal \(excl\. BTW\):.*?€ ([^<]+)/)
    const totalMatch = customerHtml.match(/Totaal \(incl\. BTW\):.*?€ ([^<]+)/)

    return NextResponse.json({
      success: true,
      invoiceData: {
        subtotal: testInvoiceData.subtotal,
        vatAmount: testInvoiceData.vatAmount || 0,
        total: testInvoiceData.total,
        subtotalFormatted: (testInvoiceData.subtotal / 100).toFixed(2).replace('.', ','),
        vatFormatted: ((testInvoiceData.vatAmount || 0) / 100).toFixed(2).replace('.', ','),
        totalFormatted: (testInvoiceData.total / 100).toFixed(2).replace('.', ',')
      },
      htmlExtracted: {
        subtotalInHTML: subtotalMatch ? subtotalMatch[1] : 'NOT FOUND',
        btwInHTML: btwMatch ? btwMatch[1] : 'NOT FOUND',
        totalInHTML: totalMatch ? totalMatch[1] : 'NOT FOUND'
      },
      rawHTML: customerHtml.substring(0, 5000) // First 5000 chars for debugging
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('[Test Invoice Debug] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

