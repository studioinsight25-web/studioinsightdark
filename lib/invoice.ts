// lib/invoice.ts - Invoice Generation and Email System
import { brevoSendEmail } from './brevo'
import { DatabaseService } from './database-direct'
import { UserService } from './user-database'

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
  return {
    name: process.env.INVOICE_COMPANY_NAME || 'Studio Insight',
    address: process.env.INVOICE_COMPANY_ADDRESS || '',
    city: process.env.INVOICE_COMPANY_CITY || '',
    postcode: process.env.INVOICE_COMPANY_POSTCODE || '',
    country: process.env.INVOICE_COMPANY_COUNTRY || 'Nederland',
    vatNumber: process.env.INVOICE_COMPANY_VAT || '',
    email: process.env.INVOICE_COMPANY_EMAIL || process.env.BREVO_SENDER_EMAIL || 'info@studio-insight.nl',
    phone: process.env.INVOICE_COMPANY_PHONE || '',
    website: process.env.NEXT_PUBLIC_BASE_URL || 'https://studio-insight.nl'
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
export function generateCustomerInvoiceHTML(data: InvoiceData): string {
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
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0ea5e9, #6366f1); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">Factuur</h1>
        <p style="margin: 10px 0 0; opacity: 0.9;">Factuurnummer: ${data.orderNumber}</p>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
          <div>
            <h3 style="margin-top: 0; color: #111827; font-size: 16px; font-weight: 600;">Verzendadres:</h3>
            <p style="margin: 5px 0;">${data.customer.name}</p>
            ${data.customer.company ? `<p style="margin: 5px 0;">${data.customer.company}</p>` : ''}
            ${data.customer.address ? `<p style="margin: 5px 0;">${data.customer.address}</p>` : ''}
            ${data.customer.postcode && data.customer.city ? `<p style="margin: 5px 0;">${data.customer.postcode} ${data.customer.city}</p>` : ''}
            ${data.customer.country ? `<p style="margin: 5px 0;">${data.customer.country}</p>` : ''}
            <p style="margin: 5px 0;">${data.customer.email}</p>
          </div>
          
          <div>
            <h3 style="margin-top: 0; color: #111827; font-size: 16px; font-weight: 600;">Factuurgegevens:</h3>
            <p style="margin: 5px 0;"><strong>Factuurnummer:</strong> ${data.orderNumber}</p>
            <p style="margin: 5px 0;"><strong>Orderdatum:</strong> ${formatDate(data.orderDate)}</p>
            <p style="margin: 5px 0;"><strong>Betaaldatum:</strong> ${formatDate(data.paymentDate)}</p>
            ${data.paymentId ? `<p style="margin: 5px 0;"><strong>Transactie ID:</strong> ${data.paymentId}</p>` : ''}
          </div>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="margin-top: 0; color: #111827; font-size: 16px; font-weight: 600;">Betaald door:</h3>
          <p style="margin: 5px 0;">${data.customer.name}</p>
          <p style="margin: 5px 0;">${data.customer.email}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; background: white; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 15px; text-align: left; border-bottom: 2px solid #e5e7eb;">Product</th>
              <th style="padding: 15px; text-align: center; border-bottom: 2px solid #e5e7eb;">Aantal</th>
              <th style="padding: 15px; text-align: right; border-bottom: 2px solid #e5e7eb;">Prijs</th>
              <th style="padding: 15px; text-align: right; border-bottom: 2px solid #e5e7eb;">Subtotaal</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => `
              <tr>
                <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
                <td style="padding: 15px; text-align: center; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
                <td style="padding: 15px; text-align: right; border-bottom: 1px solid #e5e7eb;">€ ${formatPrice(item.price)}</td>
                <td style="padding: 15px; text-align: right; border-bottom: 1px solid #e5e7eb;">€ ${formatPrice(item.subtotal)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 15px; text-align: right; font-weight: 600; border-top: 2px solid #e5e7eb;">Totaal:</td>
              <td style="padding: 15px; text-align: right; font-weight: 600; font-size: 18px; border-top: 2px solid #e5e7eb; color: #0ea5e9;">€ ${totalFormatted}</td>
            </tr>
          </tfoot>
        </table>
        
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
          <p style="margin: 0; color: #1e40af;"><strong>✓ Betaling ontvangen</strong></p>
          <p style="margin: 5px 0 0; color: #1e40af; font-size: 14px;">Bedankt voor je aankoop! Je hebt toegang tot de gekochte producten in je dashboard.</p>
        </div>
      </div>
      
      <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; font-size: 12px; color: #6b7280;">
        <p style="margin: 0 0 10px;"><strong>${company.name}</strong></p>
        ${company.address ? `<p style="margin: 0 0 5px;">${company.address}</p>` : ''}
        ${company.postcode && company.city ? `<p style="margin: 0 0 5px;">${company.postcode} ${company.city}</p>` : ''}
        ${company.vatNumber ? `<p style="margin: 0 0 5px;">BTW: ${company.vatNumber}</p>` : ''}
        ${company.email ? `<p style="margin: 0 0 5px;">E-mail: ${company.email}</p>` : ''}
        ${company.website ? `<p style="margin: 0;"><a href="${company.website}" style="color: #0ea5e9;">${company.website}</a></p>` : ''}
      </div>
    </body>
    </html>
  `
}

// Generate invoice HTML for administration/internal use
export function generateAdminInvoiceHTML(data: InvoiceData): string {
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
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="background: #dc2626; color: white; padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">Factuur - Administratie</h1>
        <p style="margin: 10px 0 0; opacity: 0.9;">Factuurnummer: ${data.orderNumber}</p>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
          <div>
            <h3 style="margin-top: 0; color: #111827; font-size: 16px; font-weight: 600;">Klantgegevens:</h3>
            <p style="margin: 5px 0;"><strong>Naam:</strong> ${data.customer.name}</p>
            ${data.customer.company ? `<p style="margin: 5px 0;"><strong>Bedrijf:</strong> ${data.customer.company}</p>` : ''}
            <p style="margin: 5px 0;"><strong>E-mail:</strong> ${data.customer.email}</p>
            ${data.customer.address ? `<p style="margin: 5px 0;"><strong>Adres:</strong> ${data.customer.address}</p>` : ''}
            ${data.customer.postcode && data.customer.city ? `<p style="margin: 5px 0;"><strong>Plaats:</strong> ${data.customer.postcode} ${data.customer.city}</p>` : ''}
            ${data.customer.country ? `<p style="margin: 5px 0;"><strong>Land:</strong> ${data.customer.country}</p>` : ''}
          </div>
          
          <div>
            <h3 style="margin-top: 0; color: #111827; font-size: 16px; font-weight: 600;">Ordergegevens:</h3>
            <p style="margin: 5px 0;"><strong>Order ID:</strong> ${data.orderId}</p>
            <p style="margin: 5px 0;"><strong>Factuurnummer:</strong> ${data.orderNumber}</p>
            <p style="margin: 5px 0;"><strong>Orderdatum:</strong> ${formatDate(data.orderDate)}</p>
            <p style="margin: 5px 0;"><strong>Betaaldatum:</strong> ${formatDate(data.paymentDate)}</p>
            ${data.paymentId ? `<p style="margin: 5px 0;"><strong>Payment ID:</strong> ${data.paymentId}</p>` : ''}
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; background: white; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 15px; text-align: left; border-bottom: 2px solid #e5e7eb;">Product</th>
              <th style="padding: 15px; text-align: center; border-bottom: 2px solid #e5e7eb;">Aantal</th>
              <th style="padding: 15px; text-align: right; border-bottom: 2px solid #e5e7eb;">Prijs</th>
              <th style="padding: 15px; text-align: right; border-bottom: 2px solid #e5e7eb;">Subtotaal</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => `
              <tr>
                <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
                <td style="padding: 15px; text-align: center; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
                <td style="padding: 15px; text-align: right; border-bottom: 1px solid #e5e7eb;">€ ${formatPrice(item.price)}</td>
                <td style="padding: 15px; text-align: right; border-bottom: 1px solid #e5e7eb;">€ ${formatPrice(item.subtotal)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 15px; text-align: right; font-weight: 600; border-top: 2px solid #e5e7eb;">Totaal:</td>
              <td style="padding: 15px; text-align: right; font-weight: 600; font-size: 18px; border-top: 2px solid #e5e7eb; color: #dc2626;">€ ${totalFormatted}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; font-size: 12px; color: #6b7280;">
        <p style="margin: 0;"><strong>Interne factuur - ${company.name}</strong></p>
        <p style="margin: 5px 0 0;">Deze factuur is automatisch gegenereerd voor administratieve doeleinden.</p>
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

    const items = itemsResult.map((item: any) => ({
      name: item.product_name || 'Onbekend product',
      quantity: parseInt(item.quantity || '1', 10),
      price: parseFloat(item.price || '0'),
      subtotal: parseFloat(item.price || '0') * parseInt(item.quantity || '1', 10)
    }))

    const subtotal = items.reduce((sum: number, item) => sum + item.subtotal, 0)
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

    // Send invoice to customer
    const customerHtml = generateCustomerInvoiceHTML(invoiceData)
    const customerSubject = `Factuur ${invoiceData.orderNumber} - Studio Insight`
    const customerResult = await brevoSendEmail(
      invoiceData.customer.email,
      customerSubject,
      customerHtml,
      invoiceData.customer.name
    )

    // Send customer invoice copy to admin/company (info@studio-insight.nl)
    const customerCopySubject = `[KOPIE] Factuur ${invoiceData.orderNumber} - ${invoiceData.customer.name}`
    const customerCopyResult = await brevoSendEmail(
      adminEmail,
      customerCopySubject,
      customerHtml,
      company.name
    )

    // Send admin invoice to admin/company
    const adminHtml = generateAdminInvoiceHTML(invoiceData)
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
      admin: adminResult.sent
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

