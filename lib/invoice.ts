// lib/invoice.ts - Invoice Generation and Email System
import { brevoSendEmail } from './brevo'
import { DatabaseService } from './database-direct'
import { UserService } from './user-database'

// Fetch logo and convert to base64 for inline embedding
async function getLogoAsBase64(logoUrl?: string): Promise<string | null> {
  if (!logoUrl) return null
  
  try {
    // If logo URL is a data URL, return as is
    if (logoUrl.startsWith('data:')) {
      return logoUrl
    }
    
    // Fetch logo from URL
    const response = await fetch(logoUrl)
    if (!response.ok) {
      console.warn(`[Invoice] Could not fetch logo from ${logoUrl}: ${response.statusText}`)
      return null
    }
    
    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const contentType = response.headers.get('content-type') || 'image/png'
    
    return `data:${contentType};base64,${base64}`
  } catch (error) {
    console.error('[Invoice] Error fetching logo:', error)
    return null
  }
}

// Generate PDF from HTML using Puppeteer (optional - only if installed)
async function generatePDFFromHTML(html: string): Promise<Buffer | null> {
  try {
    // Try to import puppeteer - if not available, return null gracefully
    let puppeteer
    try {
      puppeteer = await import('puppeteer')
    } catch (importError) {
      console.warn('[Invoice] Puppeteer not available - PDF generation skipped. Install with: npm install puppeteer')
      return null
    }
    
    const browser = await puppeteer.default.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    })
    
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    })
    
    await browser.close()
    return Buffer.from(pdf)
  } catch (error) {
    console.error('[Invoice] Error generating PDF:', error)
    // If Puppeteer fails, return null (email will still be sent without PDF)
    return null
  }
}

export interface InvoiceData {
  orderId: string
  orderNumber: string
  orderDate: string
  paymentDate: string
  customer: {
    name: string
    email: string
    address?: string
    city?: string
    postcode?: string
    country?: string
    company?: string
  }
  items: Array<{
    name: string
    quantity: number
    price: number
    subtotal: number
  }>
  subtotal: number
  total: number
  paymentId?: string
}

// Get company details from environment variables
function getCompanyDetails() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://studio-insight.nl'
  return {
    name: process.env.INVOICE_COMPANY_NAME || 'Studio Insight',
    address: process.env.INVOICE_COMPANY_ADDRESS || 'De Veken 122b',
    city: process.env.INVOICE_COMPANY_CITY || 'Opmeer',
    postcode: process.env.INVOICE_COMPANY_POSTCODE || '1716 KG',
    country: process.env.INVOICE_COMPANY_COUNTRY || 'Nederland',
    vatNumber: process.env.INVOICE_COMPANY_VAT || '',
    email: process.env.INVOICE_COMPANY_EMAIL || process.env.BREVO_SENDER_EMAIL || 'info@studio-insight.nl',
    phone: process.env.INVOICE_COMPANY_PHONE || '',
    website: baseUrl,
    logoUrl: process.env.INVOICE_LOGO_URL || `${baseUrl}/logo.png` // Logo URL - upload logo to public folder or use hosted URL
  }
}

// Format price in euros (cents to euros)
function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',')
}

// Format date in Dutch format
function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Generate invoice HTML for customer
export function generateCustomerInvoiceHTML(data: InvoiceData, logoBase64?: string | null): string {
  const company = getCompanyDetails()
  const subtotalFormatted = formatPrice(data.subtotal)
  const totalFormatted = formatPrice(data.total)
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Factuur ${data.orderNumber}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
      <div style="background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
        <!-- Header with Logo and Company Info -->
        <div style="background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%); color: white; padding: 40px 30px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
            <div style="flex: 1;">
              ${logoBase64 ? `<img src="${logoBase64}" alt="${company.name}" style="max-width: 200px; height: auto; margin-bottom: 15px; background: white; padding: 10px; border-radius: 8px; display: block;">` : ''}
              <h1 style="margin: 0 0 10px 0; font-size: 32px; font-weight: 700;">Factuur</h1>
              <p style="margin: 0; opacity: 0.95; font-size: 16px;">Factuurnummer: ${data.orderNumber}</p>
            </div>
          </div>
          <div style="background: rgba(255,255,255,0.15); padding: 20px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0 0 8px 0; font-weight: 600; font-size: 18px;">${company.name}</p>
            ${company.address ? `<p style="margin: 0 0 5px 0; opacity: 0.95;">${company.address}</p>` : ''}
            ${company.postcode && company.city ? `<p style="margin: 0 0 5px 0; opacity: 0.95;">${company.postcode} ${company.city}</p>` : ''}
            ${company.country ? `<p style="margin: 0 0 5px 0; opacity: 0.95;">${company.country}</p>` : ''}
            ${company.email ? `<p style="margin: 0 0 5px 0; opacity: 0.95;">E-mail: ${company.email}</p>` : ''}
            ${company.phone ? `<p style="margin: 0; opacity: 0.95;">Telefoon: ${company.phone}</p>` : ''}
          </div>
        </div>
      
      <div style="padding: 40px 30px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
            <h3 style="margin-top: 0; margin-bottom: 15px; color: #111827; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Factuurgegevens</h3>
            <p style="margin: 8px 0; color: #374151;"><strong>Factuurnummer:</strong><br>${data.orderNumber}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Orderdatum:</strong><br>${formatDate(data.orderDate)}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Betaaldatum:</strong><br>${formatDate(data.paymentDate)}</p>
            ${data.paymentId ? `<p style="margin: 8px 0; color: #374151;"><strong>Transactie ID:</strong><br>${data.paymentId}</p>` : ''}
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #6366f1;">
            <h3 style="margin-top: 0; margin-bottom: 15px; color: #111827; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Factuur naar</h3>
            <p style="margin: 8px 0; color: #374151; font-weight: 600;">${data.customer.name}</p>
            ${data.customer.company ? `<p style="margin: 8px 0; color: #374151;">${data.customer.company}</p>` : ''}
            ${data.customer.address ? `<p style="margin: 8px 0; color: #374151;">${data.customer.address}</p>` : ''}
            ${data.customer.postcode && data.customer.city ? `<p style="margin: 8px 0; color: #374151;">${data.customer.postcode} ${data.customer.city}</p>` : ''}
            ${data.customer.country ? `<p style="margin: 8px 0; color: #374151;">${data.customer.country}</p>` : ''}
            <p style="margin: 8px 0; color: #374151;">${data.customer.email}</p>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%); color: white;">
              <th style="padding: 18px; text-align: left; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Product</th>
              <th style="padding: 18px; text-align: center; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Aantal</th>
              <th style="padding: 18px; text-align: right; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Prijs</th>
              <th style="padding: 18px; text-align: right; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Subtotaal</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map((item, index) => `
              <tr style="${index % 2 === 0 ? 'background: #ffffff;' : 'background: #f9fafb;'}">
                <td style="padding: 18px; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 500;">${item.name}</td>
                <td style="padding: 18px; text-align: center; border-bottom: 1px solid #e5e7eb; color: #374151;">${item.quantity}</td>
                <td style="padding: 18px; text-align: right; border-bottom: 1px solid #e5e7eb; color: #374151;">€ ${formatPrice(item.price)}</td>
                <td style="padding: 18px; text-align: right; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 600;">€ ${formatPrice(item.subtotal)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background: #f9fafb;">
              <td colspan="3" style="padding: 20px; text-align: right; font-weight: 600; font-size: 16px; color: #111827; border-top: 2px solid #e5e7eb;">Totaal:</td>
              <td style="padding: 20px; text-align: right; font-weight: 700; font-size: 20px; border-top: 2px solid #e5e7eb; color: #0ea5e9;">€ ${totalFormatted}</td>
            </tr>
          </tfoot>
        </table>
        
        <div style="background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%); padding: 25px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin-bottom: 30px;">
          <p style="margin: 0 0 8px; color: #1e40af; font-weight: 600; font-size: 16px;">✓ Betaling ontvangen</p>
          <p style="margin: 0; color: #1e40af; font-size: 14px;">Bedankt voor je aankoop! Je hebt toegang tot de gekochte producten in je dashboard.</p>
        </div>
      </div>
      
      <div style="background: #1f2937; color: #9ca3af; padding: 25px; text-align: center; font-size: 12px;">
        <p style="margin: 0 0 10px; color: #ffffff; font-weight: 600; font-size: 14px;">${company.name}</p>
        ${company.address ? `<p style="margin: 0 0 5px;">${company.address}</p>` : ''}
        ${company.postcode && company.city ? `<p style="margin: 0 0 5px;">${company.postcode} ${company.city}</p>` : ''}
        ${company.vatNumber ? `<p style="margin: 0 0 5px;">BTW: ${company.vatNumber}</p>` : ''}
        ${company.email ? `<p style="margin: 0 0 5px;"><a href="mailto:${company.email}" style="color: #0ea5e9; text-decoration: none;">${company.email}</a></p>` : ''}
        ${company.website ? `<p style="margin: 0;"><a href="${company.website}" style="color: #0ea5e9; text-decoration: none;">${company.website}</a></p>` : ''}
      </div>
      </div>
    </body>
    </html>
  `
}

// Generate invoice HTML for administration/internal use
export function generateAdminInvoiceHTML(data: InvoiceData, logoBase64?: string | null): string {
  const company = getCompanyDetails()
  const subtotalFormatted = formatPrice(data.subtotal)
  const totalFormatted = formatPrice(data.total)
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Factuur ${data.orderNumber} - Administratie</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
      <div style="background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
        <!-- Header with Logo and Company Info -->
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 40px 30px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
            <div style="flex: 1;">
              ${logoBase64 ? `<img src="${logoBase64}" alt="${company.name}" style="max-width: 200px; height: auto; margin-bottom: 15px; background: white; padding: 10px; border-radius: 8px; display: block;">` : ''}
              <h1 style="margin: 0 0 10px 0; font-size: 32px; font-weight: 700;">ADMINISTRATIE FACTUUR</h1>
              <p style="margin: 0; opacity: 0.95; font-size: 16px;">Factuurnummer: ${data.orderNumber}</p>
            </div>
          </div>
          <div style="background: rgba(255,255,255,0.15); padding: 20px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0 0 8px 0; font-weight: 600; font-size: 18px;">${company.name}</p>
            ${company.address ? `<p style="margin: 0 0 5px 0; opacity: 0.95;">${company.address}</p>` : ''}
            ${company.postcode && company.city ? `<p style="margin: 0 0 5px 0; opacity: 0.95;">${company.postcode} ${company.city}</p>` : ''}
            ${company.country ? `<p style="margin: 0 0 5px 0; opacity: 0.95;">${company.country}</p>` : ''}
            ${company.email ? `<p style="margin: 0 0 5px 0; opacity: 0.95;">E-mail: ${company.email}</p>` : ''}
            ${company.phone ? `<p style="margin: 0; opacity: 0.95;">Telefoon: ${company.phone}</p>` : ''}
          </div>
        </div>
      
      <div style="padding: 40px 30px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0; margin-bottom: 15px; color: #111827; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Klantgegevens</h3>
            <p style="margin: 8px 0; color: #374151; font-weight: 600;">${data.customer.name}</p>
            ${data.customer.company ? `<p style="margin: 8px 0; color: #374151;">${data.customer.company}</p>` : ''}
            <p style="margin: 8px 0; color: #374151;">${data.customer.email}</p>
            ${data.customer.address ? `<p style="margin: 8px 0; color: #374151;">${data.customer.address}</p>` : ''}
            ${data.customer.postcode && data.customer.city ? `<p style="margin: 8px 0; color: #374151;">${data.customer.postcode} ${data.customer.city}</p>` : ''}
            ${data.customer.country ? `<p style="margin: 8px 0; color: #374151;">${data.customer.country}</p>` : ''}
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0; margin-bottom: 15px; color: #111827; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Ordergegevens</h3>
            <p style="margin: 8px 0; color: #374151;"><strong>Order ID:</strong><br><span style="font-family: monospace; font-size: 12px;">${data.orderId}</span></p>
            <p style="margin: 8px 0; color: #374151;"><strong>Factuurnummer:</strong><br>${data.orderNumber}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Orderdatum:</strong><br>${formatDate(data.orderDate)}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Betaaldatum:</strong><br>${formatDate(data.paymentDate)}</p>
            ${data.paymentId ? `<p style="margin: 8px 0; color: #374151;"><strong>Payment ID:</strong><br><span style="font-family: monospace; font-size: 12px;">${data.paymentId}</span></p>` : ''}
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white;">
              <th style="padding: 18px; text-align: left; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Product</th>
              <th style="padding: 18px; text-align: center; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Aantal</th>
              <th style="padding: 18px; text-align: right; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Prijs</th>
              <th style="padding: 18px; text-align: right; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Subtotaal</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map((item, index) => `
              <tr style="${index % 2 === 0 ? 'background: #ffffff;' : 'background: #f9fafb;'}">
                <td style="padding: 18px; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 500;">${item.name}</td>
                <td style="padding: 18px; text-align: center; border-bottom: 1px solid #e5e7eb; color: #374151;">${item.quantity}</td>
                <td style="padding: 18px; text-align: right; border-bottom: 1px solid #e5e7eb; color: #374151;">€ ${formatPrice(item.price)}</td>
                <td style="padding: 18px; text-align: right; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 600;">€ ${formatPrice(item.subtotal)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background: #f9fafb;">
              <td colspan="3" style="padding: 20px; text-align: right; font-weight: 600; font-size: 16px; color: #111827; border-top: 2px solid #e5e7eb;">Totaal:</td>
              <td style="padding: 20px; text-align: right; font-weight: 700; font-size: 20px; border-top: 2px solid #e5e7eb; color: #dc2626;">€ ${totalFormatted}</td>
            </tr>
          </tfoot>
        </table>
        
        <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); padding: 25px; border-radius: 8px; border-left: 4px solid #dc2626; margin-bottom: 30px;">
          <p style="margin: 0; color: #991b1b; font-weight: 600; font-size: 14px;">INTERNE FACTUUR - Automatisch gegenereerd voor administratieve doeleinden</p>
        </div>
      </div>
      
      <div style="background: #1f2937; color: #9ca3af; padding: 25px; text-align: center; font-size: 12px;">
        <p style="margin: 0 0 10px; color: #ffffff; font-weight: 600; font-size: 14px;">${company.name}</p>
        ${company.address ? `<p style="margin: 0 0 5px;">${company.address}</p>` : ''}
        ${company.postcode && company.city ? `<p style="margin: 0 0 5px;">${company.postcode} ${company.city}</p>` : ''}
        ${company.vatNumber ? `<p style="margin: 0 0 5px;">BTW: ${company.vatNumber}</p>` : ''}
        ${company.email ? `<p style="margin: 0 0 5px;"><a href="mailto:${company.email}" style="color: #0ea5e9; text-decoration: none;">${company.email}</a></p>` : ''}
        ${company.website ? `<p style="margin: 0;"><a href="${company.website}" style="color: #0ea5e9; text-decoration: none;">${company.website}</a></p>` : ''}
      </div>
      </div>
    </body>
    </html>
  `
}

// Fetch order data with product names for invoice
export async function getInvoiceData(orderId: string): Promise<InvoiceData | null> {
  try {
    // Get order with order_number
    let orderResult
    try {
      orderResult = await DatabaseService.query(
        `SELECT id, user_id, order_number, status, total_amount, payment_id, created_at, updated_at, paid_at 
         FROM orders WHERE id = $1::uuid`,
        [orderId]
      )
    } catch {
      orderResult = await DatabaseService.query(
        `SELECT id, user_id, order_number, status, total_amount, payment_id, created_at, updated_at, paid_at 
         FROM orders WHERE id::text = $1`,
        [orderId]
      )
    }

    if (orderResult.length === 0) {
      console.error(`[Invoice] Order not found: ${orderId}`)
      return null
    }

    const order = orderResult[0]
    
    // Get order items with product names
    let itemsResult
    try {
      itemsResult = await DatabaseService.query(
        `SELECT id, order_id, product_id, product_name, quantity, price 
         FROM order_items WHERE order_id = $1::uuid`,
        [orderId]
      )
    } catch {
      itemsResult = await DatabaseService.query(
        `SELECT id, order_id, product_id, product_name, quantity, price 
         FROM order_items WHERE order_id::text = $1`,
        [orderId]
      )
    }

    // Get user data
    const user = await UserService.getUserById(order.user_id)
    if (!user) {
      console.error(`[Invoice] User not found: ${order.user_id}`)
      return null
    }

    type InvoiceItem = { name: string; quantity: number; price: number; subtotal: number }
    
    const items: InvoiceItem[] = itemsResult.map((item: any) => ({
      name: item.product_name || 'Onbekend product',
      quantity: parseInt(item.quantity || '1', 10),
      price: parseFloat(item.price || '0'),
      subtotal: parseFloat(item.price || '0') * parseInt(item.quantity || '1', 10)
    }))

    const subtotal = items.reduce((sum: number, item: InvoiceItem) => sum + item.subtotal, 0)
    const total = parseFloat(order.total_amount || '0')

    return {
      orderId: order.id,
      orderNumber: order.order_number || `ORD-${order.id.substring(0, 8).toUpperCase()}`,
      orderDate: order.created_at || new Date().toISOString(),
      paymentDate: order.paid_at || order.updated_at || new Date().toISOString(),
      customer: {
        name: user.name || 'Klant',
        email: user.email,
        address: user.address || undefined,
        city: user.city || undefined,
        postcode: user.postcode || undefined,
        country: user.country || undefined,
        company: user.company_name || undefined
      },
      items,
      subtotal,
      total,
      paymentId: order.payment_id || undefined
    }
  } catch (error) {
    console.error('[Invoice] Error fetching invoice data:', error)
    return null
  }
}

// Send invoice emails to customer and admin
export async function sendInvoiceEmails(orderId: string): Promise<{ customerSent: boolean; adminSent: boolean; customerCopySent: boolean }> {
  try {
    const invoiceData = await getInvoiceData(orderId)
    
    if (!invoiceData) {
      console.error(`[Invoice] Could not generate invoice data for order ${orderId}`)
      return { customerSent: false, adminSent: false, customerCopySent: false }
    }

    const company = getCompanyDetails()
    const adminEmail = company.email

    // Fetch logo as base64 for inline embedding
    const logoBase64 = await getLogoAsBase64(company.logoUrl)
    if (logoBase64) {
      console.log(`[Invoice] Logo fetched and converted to base64`)
    } else {
      console.warn(`[Invoice] Logo not available or could not be fetched`)
    }

    // Generate HTML with inline logo
    const customerHtml = generateCustomerInvoiceHTML(invoiceData, logoBase64)
    const adminHtml = generateAdminInvoiceHTML(invoiceData, logoBase64)

    // Generate PDF from customer invoice HTML
    const pdfBuffer = await generatePDFFromHTML(customerHtml)
    const pdfAttachment = pdfBuffer ? {
      name: `Factuur_${invoiceData.orderNumber}.pdf`,
      content: pdfBuffer
    } : undefined

    if (pdfBuffer) {
      console.log(`[Invoice] PDF generated successfully (${pdfBuffer.length} bytes)`)
    } else {
      console.warn(`[Invoice] PDF generation failed or skipped`)
    }

    // Send invoice to customer with PDF attachment
    const customerSubject = `Factuur ${invoiceData.orderNumber} - Studio Insight`
    const customerResult = await brevoSendEmail(
      invoiceData.customer.email,
      customerSubject,
      customerHtml,
      invoiceData.customer.name,
      pdfAttachment
    )

    // Send customer invoice copy to admin/company (info@studio-insight.nl) with PDF
    const customerCopySubject = `[KOPIE] Factuur ${invoiceData.orderNumber} - ${invoiceData.customer.name}`
    const customerCopyResult = await brevoSendEmail(
      adminEmail,
      customerCopySubject,
      customerHtml,
      company.name,
      pdfAttachment
    )

    // Send admin invoice to admin/company (without PDF, as it's internal)
    const adminSubject = `[ADMIN] Factuur ${invoiceData.orderNumber} - ${invoiceData.customer.name}`
    const adminResult = await brevoSendEmail(
      adminEmail,
      adminSubject,
      adminHtml,
      company.name
    )

    console.log(`[Invoice] Invoice emails sent for order ${orderId}:`, {
      customer: customerResult.sent,
      customerCopy: customerCopyResult.sent,
      admin: adminResult.sent,
      pdfAttached: !!pdfAttachment
    })

    return {
      customerSent: customerResult.sent || false,
      adminSent: adminResult.sent || false,
      customerCopySent: customerCopyResult.sent || false
    }
  } catch (error) {
    console.error('[Invoice] Error sending invoice emails:', error)
    return { customerSent: false, adminSent: false, customerCopySent: false }
  }
}

