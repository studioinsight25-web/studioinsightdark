// lib/invoice.ts - Invoice Generation and Email System
import { brevoSendEmail } from './brevo'
import { DatabaseService } from './database-direct'
import { UserService } from './user-database'

// Generate PDF from HTML using external API (lightweight, no build dependencies)
async function generatePDFFromHTML(html: string): Promise<Buffer | null> {
  try {
    // Option 1: Use Doppio API (free tier available)
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
          margin: {
            top: '20mm',
            right: '15mm',
            bottom: '20mm',
            left: '15mm'
          }
        })
      })
      
      if (response.ok) {
        const pdfBuffer = await response.arrayBuffer()
        return Buffer.from(pdfBuffer)
      } else {
        console.warn('[Invoice] Doppio API error:', await response.text())
      }
    }
    
    // Option 2: Use HTMLtoPDF.io API (alternative)
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
    
    // Option 3: Fallback - use Gotenberg (self-hosted) if available
    const gotenbergUrl = process.env.GOTENBERG_URL
    if (gotenbergUrl) {
      try {
        // Use node-fetch FormData if available, otherwise skip
        const { FormData: NodeFormData, Blob: NodeBlob } = await import('node-fetch')
        const formData = new NodeFormData()
        const blob = new NodeBlob([html], { type: 'text/html' })
        formData.append('html', blob)
        formData.append('format', 'A4')
        
        const response = await fetch(`${gotenbergUrl}/forms/chromium/convert/html`, {
          method: 'POST',
          body: formData as any
        })
        
        if (response.ok) {
          const pdfBuffer = await response.arrayBuffer()
          return Buffer.from(pdfBuffer)
        }
      } catch (gotenbergError) {
        console.warn('[Invoice] Gotenberg not available:', gotenbergError)
      }
    }
    
    // If no API is configured, return null (email will still be sent without PDF)
    console.warn('[Invoice] No PDF API configured. Set DOPPIO_API_KEY, HTMLPDF_API_KEY, or GOTENBERG_URL')
    return null
  } catch (error) {
    console.error('[Invoice] Error generating PDF:', error)
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
  subtotal: number // Subtotaal exclusief BTW
  vatAmount?: number // BTW bedrag (21%)
  total: number // Totaal inclusief BTW
  paymentId?: string
}

// Generate Cloudinary URL from public_id or full URL
export function getLogoUrl(logoIdOrUrl?: string): string | null {
  if (!logoIdOrUrl) {
    logoIdOrUrl = process.env.INVOICE_LOGO_URL
  }
  
  if (!logoIdOrUrl) {
    // Try default Cloudinary path
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    if (cloudName) {
      logoIdOrUrl = `studio-insight/logo`
    } else {
      return null
    }
  }
  
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  if (!cloudName) {
    console.warn('[Invoice] CLOUDINARY_CLOUD_NAME not set. Cannot generate logo URL.')
    return null
  }
  
  // If it's already a full HTTPS URL, use it
  if (logoIdOrUrl.startsWith('https://')) {
    return logoIdOrUrl
  }
  
  // If it's a Cloudinary public_id, generate the URL
  // Remove leading slash if present
  const publicId = logoIdOrUrl.startsWith('/') ? logoIdOrUrl.substring(1) : logoIdOrUrl
  
  // Generate Cloudinary HTTPS URL
  // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}
  const logoUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`
  
  return logoUrl
}

// Get company details from environment variables
function getCompanyDetails() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://studio-insight.nl'
  
  // Get logo URL - can be Cloudinary public_id or full HTTPS URL
  const logoUrl = getLogoUrl()
  
  if (!logoUrl) {
    console.warn('[Invoice] No logo URL available. Set INVOICE_LOGO_URL to Cloudinary public_id (e.g., "studio-insight/logo") or full HTTPS URL.')
  } else {
    console.log(`[Invoice] Using logo URL: ${logoUrl}`)
  }
  
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
    logoUrl: logoUrl // HTTPS URL generated from Cloudinary public_id or full URL
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
export function generateCustomerInvoiceHTML(data: InvoiceData, logoUrl?: string | null): string {
  const company = getCompanyDetails()
  const VAT_RATE = 0.21
  // Calculate VAT if not provided (backward compatibility)
  const vatAmount = data.vatAmount !== undefined ? data.vatAmount : (data.total - data.subtotal)
  const subtotalFormatted = formatPrice(data.subtotal)
  const vatFormatted = formatPrice(vatAmount)
  const totalFormatted = formatPrice(data.total)
  
  // Use ONLY HTTPS URLs - base64 does NOT work in Outlook
  // Logo URL must be publicly accessible HTTPS URL (e.g., Cloudinary)
  const finalLogoUrl = logoUrl || company.logoUrl
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Factuur ${data.orderNumber}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.4; color: #333; margin: 0; padding: 0; background: white;">
      <div style="max-width: 210mm; margin: 0 auto; background: white; padding: 15mm;">
        <!-- Header with Logo and Company Info - Compact for A4 -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0ea5e9; background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);">
          <!--[if mso]>
          <tr>
            <td bgcolor="#0ea5e9" style="padding: 15px 20px;">
          <![endif]-->
          <tr>
            <td style="padding: 15px 20px; color: white;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="width: 50%; vertical-align: top;">
                    ${finalLogoUrl ? `
                      <img src="${finalLogoUrl}" alt="${company.name}" width="120" style="background: white; padding: 8px; border-radius: 8px; display: block; max-width: 120px; width: 120px; height: auto; border: 0;">
                    ` : ''}
                  </td>
                  <td style="width: 50%; vertical-align: top; text-align: right;">
                    <h1 style="margin: 0 0 5px 0; font-size: 24px; font-weight: 700; color: white;">Factuur</h1>
                    <p style="margin: 0; font-size: 13px; color: white;">${data.orderNumber}</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 12px;">
                <tr>
                  <td style="background-color: rgba(255,255,255,0.2); padding: 12px; border-radius: 6px;">
                    <p style="margin: 0 0 4px 0; font-weight: 600; font-size: 14px; color: white;">${company.name}</p>
                    <p style="margin: 0 0 2px 0; font-size: 11px; color: white; line-height: 1.3;">
                      ${company.address ? `${company.address}, ` : ''}${company.postcode && company.city ? `${company.postcode} ${company.city}` : ''}${company.country ? `, ${company.country}` : ''}
                    </p>
                    ${company.email || company.phone ? `
                      <p style="margin: 2px 0 0 0; font-size: 11px; color: white;">
                        ${company.email ? `${company.email}` : ''}${company.email && company.phone ? ' • ' : ''}${company.phone ? `${company.phone}` : ''}
                      </p>
                    ` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!--[if mso]>
            </td>
          </tr>
          <![endif]-->
        </table>
      
        <!-- Customer and Invoice Details - Compact side-by-side -->
        <div style="margin-top: 20px; margin-bottom: 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="width: 50%; vertical-align: top; padding-right: 10px;">
                <div style="background: #f9fafb; padding: 12px; border-radius: 6px; border-left: 3px solid #0ea5e9;">
                  <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Factuurgegevens</h3>
                  <p style="margin: 4px 0; color: #374151; font-size: 12px; line-height: 1.4;"><strong style="font-size: 11px;">Datum:</strong> ${formatDate(data.orderDate)}</p>
                  <p style="margin: 4px 0; color: #374151; font-size: 12px; line-height: 1.4;"><strong style="font-size: 11px;">Betaald:</strong> ${formatDate(data.paymentDate)}</p>
                  ${data.paymentId ? `<p style="margin: 4px 0; color: #374151; font-size: 11px; line-height: 1.4;"><strong>Transactie:</strong> ${data.paymentId.substring(0, 20)}...</p>` : ''}
                </div>
              </td>
              <td style="width: 50%; vertical-align: top; padding-left: 10px;">
                <div style="background: #f9fafb; padding: 12px; border-radius: 6px; border-left: 3px solid #6366f1;">
                  <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Factuur naar</h3>
                  <p style="margin: 4px 0; color: #374151; font-size: 12px; font-weight: 600; line-height: 1.4;">${data.customer.name}</p>
                  ${data.customer.company ? `<p style="margin: 4px 0; color: #374151; font-size: 11px; line-height: 1.4;">${data.customer.company}</p>` : ''}
                  ${data.customer.address ? `<p style="margin: 4px 0; color: #374151; font-size: 11px; line-height: 1.4;">${data.customer.address}</p>` : ''}
                  ${data.customer.postcode && data.customer.city ? `<p style="margin: 4px 0; color: #374151; font-size: 11px; line-height: 1.4;">${data.customer.postcode} ${data.customer.city}</p>` : ''}
                  <p style="margin: 4px 0; color: #374151; font-size: 11px; line-height: 1.4;">${data.customer.email}</p>
                </div>
              </td>
            </tr>
          </table>
        </div>
        
        <!-- Products Table - Compact -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <thead>
            <!--[if mso]>
            <tr style="background-color: #0ea5e9;">
              <th style="padding: 10px 8px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; color: white;">Product</th>
              <th style="padding: 10px 8px; text-align: center; font-weight: 600; font-size: 11px; text-transform: uppercase; color: white;">Aantal</th>
              <th style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 11px; text-transform: uppercase; color: white;">Prijs</th>
              <th style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 11px; text-transform: uppercase; color: white;">Totaal</th>
            </tr>
            <![endif]-->
            <!--[if !mso]><!-->
            <tr style="background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%); color: white;">
              <th style="padding: 10px 8px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase;">Product</th>
              <th style="padding: 10px 8px; text-align: center; font-weight: 600; font-size: 11px; text-transform: uppercase;">Aantal</th>
              <th style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 11px; text-transform: uppercase;">Prijs</th>
              <th style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 11px; text-transform: uppercase;">Totaal</th>
            </tr>
            <!--<![endif]-->
          </thead>
          <tbody>
            ${data.items.map((item, index) => `
              <tr style="${index % 2 === 0 ? 'background: #ffffff;' : 'background: #f9fafb;'}">
                <td style="padding: 10px 8px; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 500; font-size: 12px;">${item.name}</td>
                <td style="padding: 10px 8px; text-align: center; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 12px;">${item.quantity}</td>
                <td style="padding: 10px 8px; text-align: right; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 12px;">€ ${formatPrice(item.price)}</td>
                <td style="padding: 10px 8px; text-align: right; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 600; font-size: 12px;">€ ${formatPrice(item.subtotal)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background: #f9fafb;">
              <td colspan="3" style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 13px; color: #111827; border-top: 2px solid #e5e7eb;">Subtotaal (excl. BTW):</td>
              <td style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 13px; border-top: 2px solid #e5e7eb; color: #374151;">€ ${subtotalFormatted}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td colspan="3" style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 13px; color: #111827;">BTW (21%):</td>
              <td style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 13px; color: #374151;">€ ${vatFormatted}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td colspan="3" style="padding: 12px 8px; text-align: right; font-weight: 700; font-size: 16px; color: #111827; border-top: 2px solid #0ea5e9;">Totaal (incl. BTW):</td>
              <td style="padding: 12px 8px; text-align: right; font-weight: 700; font-size: 16px; border-top: 2px solid #0ea5e9; color: #0ea5e9;">€ ${totalFormatted}</td>
            </tr>
          </tfoot>
        </table>
        
        <!-- Payment Confirmation - Compact -->
        <div style="background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%); padding: 12px; border-radius: 6px; border-left: 3px solid #0ea5e9; margin-bottom: 15px;">
          <p style="margin: 0; color: #1e40af; font-weight: 600; font-size: 12px;">✓ Betaling ontvangen - Bedankt voor je aankoop!</p>
        </div>
        
        <!-- Footer - Compact -->
        <div style="background: #1f2937; color: #9ca3af; padding: 12px; text-align: center; font-size: 10px; border-radius: 6px;">
          <p style="margin: 0 0 4px; color: #ffffff; font-weight: 600; font-size: 11px;">${company.name}</p>
          <p style="margin: 0 0 2px; font-size: 10px;">
            ${company.address ? `${company.address}, ` : ''}${company.postcode && company.city ? `${company.postcode} ${company.city}` : ''}
            ${company.vatNumber ? ` • BTW: ${company.vatNumber}` : ''}
          </p>
          ${company.email ? `<p style="margin: 2px 0 0; font-size: 10px;"><a href="mailto:${company.email}" style="color: #0ea5e9; text-decoration: none;">${company.email}</a></p>` : ''}
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate invoice HTML for administration/internal use
export function generateAdminInvoiceHTML(data: InvoiceData, logoUrl?: string | null): string {
  const company = getCompanyDetails()
  const VAT_RATE = 0.21
  // Calculate VAT if not provided (backward compatibility)
  const vatAmount = data.vatAmount !== undefined ? data.vatAmount : (data.total - data.subtotal)
  const subtotalFormatted = formatPrice(data.subtotal)
  const vatFormatted = formatPrice(vatAmount)
  const totalFormatted = formatPrice(data.total)
  
  // Use ONLY HTTPS URLs - base64 does NOT work in Outlook
  const finalLogoUrl = logoUrl || company.logoUrl
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Factuur ${data.orderNumber} - Administratie</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.4; color: #333; margin: 0; padding: 0; background: white;">
      <div style="max-width: 210mm; margin: 0 auto; background: white; padding: 15mm;">
        <!-- Header with Logo and Company Info - Compact for A4 -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #dc2626; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);">
          <!--[if mso]>
          <tr>
            <td bgcolor="#dc2626" style="padding: 15px 20px;">
          <![endif]-->
          <tr>
            <td style="padding: 15px 20px; color: white;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="width: 50%; vertical-align: top;">
                    ${finalLogoUrl ? `
                      <img src="${finalLogoUrl}" alt="${company.name}" width="120" style="background: white; padding: 8px; border-radius: 8px; display: block; max-width: 120px; width: 120px; height: auto; border: 0;">
                    ` : ''}
                  </td>
                  <td style="width: 50%; vertical-align: top; text-align: right;">
                    <h1 style="margin: 0 0 5px 0; font-size: 20px; font-weight: 700; color: white;">ADMIN FACTUUR</h1>
                    <p style="margin: 0; font-size: 13px; color: white;">${data.orderNumber}</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 12px;">
                <tr>
                  <td style="background-color: rgba(255,255,255,0.2); padding: 12px; border-radius: 6px;">
                    <p style="margin: 0 0 4px 0; font-weight: 600; font-size: 14px; color: white;">${company.name}</p>
                    <p style="margin: 0 0 2px 0; font-size: 11px; color: white; line-height: 1.3;">
                      ${company.address ? `${company.address}, ` : ''}${company.postcode && company.city ? `${company.postcode} ${company.city}` : ''}${company.country ? `, ${company.country}` : ''}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!--[if mso]>
            </td>
          </tr>
          <![endif]-->
        </table>
      
        <!-- Customer and Order Details - Compact side-by-side -->
        <div style="margin-top: 20px; margin-bottom: 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="width: 50%; vertical-align: top; padding-right: 10px;">
                <div style="background: #fef2f2; padding: 12px; border-radius: 6px; border-left: 3px solid #dc2626;">
                  <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Klantgegevens</h3>
                  <p style="margin: 4px 0; color: #374151; font-size: 12px; font-weight: 600; line-height: 1.4;">${data.customer.name}</p>
                  ${data.customer.company ? `<p style="margin: 4px 0; color: #374151; font-size: 11px; line-height: 1.4;">${data.customer.company}</p>` : ''}
                  <p style="margin: 4px 0; color: #374151; font-size: 11px; line-height: 1.4;">${data.customer.email}</p>
                  ${data.customer.address ? `<p style="margin: 4px 0; color: #374151; font-size: 11px; line-height: 1.4;">${data.customer.address}</p>` : ''}
                  ${data.customer.postcode && data.customer.city ? `<p style="margin: 4px 0; color: #374151; font-size: 11px; line-height: 1.4;">${data.customer.postcode} ${data.customer.city}</p>` : ''}
                </div>
              </td>
              <td style="width: 50%; vertical-align: top; padding-left: 10px;">
                <div style="background: #f9fafb; padding: 12px; border-radius: 6px; border-left: 3px solid #dc2626;">
                  <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Ordergegevens</h3>
                  <p style="margin: 4px 0; color: #374151; font-size: 11px; line-height: 1.4;"><strong>Order ID:</strong> <span style="font-family: monospace; font-size: 10px;">${data.orderId.substring(0, 20)}...</span></p>
                  <p style="margin: 4px 0; color: #374151; font-size: 12px; line-height: 1.4;"><strong>Factuur:</strong> ${data.orderNumber}</p>
                  <p style="margin: 4px 0; color: #374151; font-size: 11px; line-height: 1.4;"><strong>Datum:</strong> ${formatDate(data.orderDate)}</p>
                  <p style="margin: 4px 0; color: #374151; font-size: 11px; line-height: 1.4;"><strong>Betaald:</strong> ${formatDate(data.paymentDate)}</p>
                  ${data.paymentId ? `<p style="margin: 4px 0; color: #374151; font-size: 10px; line-height: 1.4;"><strong>Payment ID:</strong> <span style="font-family: monospace;">${data.paymentId.substring(0, 20)}...</span></p>` : ''}
                </div>
              </td>
            </tr>
          </table>
        </div>
        
        <!-- Products Table - Compact -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <thead>
            <!--[if mso]>
            <tr style="background-color: #dc2626;">
              <th style="padding: 10px 8px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; color: white;">Product</th>
              <th style="padding: 10px 8px; text-align: center; font-weight: 600; font-size: 11px; text-transform: uppercase; color: white;">Aantal</th>
              <th style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 11px; text-transform: uppercase; color: white;">Prijs</th>
              <th style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 11px; text-transform: uppercase; color: white;">Totaal</th>
            </tr>
            <![endif]-->
            <!--[if !mso]><!-->
            <tr style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white;">
              <th style="padding: 10px 8px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase;">Product</th>
              <th style="padding: 10px 8px; text-align: center; font-weight: 600; font-size: 11px; text-transform: uppercase;">Aantal</th>
              <th style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 11px; text-transform: uppercase;">Prijs</th>
              <th style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 11px; text-transform: uppercase;">Totaal</th>
            </tr>
            <!--<![endif]-->
          </thead>
          <tbody>
            ${data.items.map((item, index) => `
              <tr style="${index % 2 === 0 ? 'background: #ffffff;' : 'background: #f9fafb;'}">
                <td style="padding: 10px 8px; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 500; font-size: 12px;">${item.name}</td>
                <td style="padding: 10px 8px; text-align: center; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 12px;">${item.quantity}</td>
                <td style="padding: 10px 8px; text-align: right; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 12px;">€ ${formatPrice(item.price)}</td>
                <td style="padding: 10px 8px; text-align: right; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 600; font-size: 12px;">€ ${formatPrice(item.subtotal)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background: #f9fafb;">
              <td colspan="3" style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 13px; color: #111827; border-top: 2px solid #e5e7eb;">Subtotaal (excl. BTW):</td>
              <td style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 13px; border-top: 2px solid #e5e7eb; color: #374151;">€ ${subtotalFormatted}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td colspan="3" style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 13px; color: #111827;">BTW (21%):</td>
              <td style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 13px; color: #374151;">€ ${vatFormatted}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td colspan="3" style="padding: 12px 8px; text-align: right; font-weight: 700; font-size: 16px; color: #111827; border-top: 2px solid #dc2626;">Totaal (incl. BTW):</td>
              <td style="padding: 12px 8px; text-align: right; font-weight: 700; font-size: 16px; border-top: 2px solid #dc2626; color: #dc2626;">€ ${totalFormatted}</td>
            </tr>
          </tfoot>
        </table>
        
        <!-- Admin Notice - Compact -->
        <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); padding: 12px; border-radius: 6px; border-left: 3px solid #dc2626; margin-bottom: 15px;">
          <p style="margin: 0; color: #991b1b; font-weight: 600; font-size: 11px;">INTERNE FACTUUR - Automatisch gegenereerd voor administratieve doeleinden</p>
        </div>
        
        <!-- Footer - Compact -->
        <div style="background: #1f2937; color: #9ca3af; padding: 12px; text-align: center; font-size: 10px; border-radius: 6px;">
          <p style="margin: 0 0 4px; color: #ffffff; font-weight: 600; font-size: 11px;">${company.name}</p>
          <p style="margin: 0 0 2px; font-size: 10px;">
            ${company.address ? `${company.address}, ` : ''}${company.postcode && company.city ? `${company.postcode} ${company.city}` : ''}
            ${company.vatNumber ? ` • BTW: ${company.vatNumber}` : ''}
          </p>
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

    // Calculate totals: prices in database are INCLUSIVE of VAT (21%)
    // So we need to calculate: subtotal excl. VAT, VAT amount, and total incl. VAT
    const totalInclVAT = parseFloat(order.total_amount || '0')
    const VAT_RATE = 0.21
    const subtotalExclVAT = Math.round(totalInclVAT / (1 + VAT_RATE))
    const vatAmount = totalInclVAT - subtotalExclVAT

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
      subtotal: subtotalExclVAT, // Subtotaal exclusief BTW
      vatAmount: vatAmount, // BTW bedrag
      total: totalInclVAT, // Totaal inclusief BTW
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

    // Use ONLY HTTPS URLs - base64 does NOT work in Outlook
    // Logo URL must be publicly accessible HTTPS URL (e.g., Cloudinary)
    const logoUrl = company.logoUrl
    
    if (logoUrl) {
      // Validate HTTPS URL
      if (!logoUrl.startsWith('https://')) {
        console.error(`[Invoice] Logo URL must be HTTPS for email compatibility. Current URL: ${logoUrl}`)
      } else {
        console.log(`[Invoice] Using logo URL: ${logoUrl}`)
      }
    } else {
      console.warn(`[Invoice] No logo URL configured. Set INVOICE_LOGO_URL to a publicly accessible HTTPS URL (e.g., Cloudinary URL)`)
    }

    // Generate HTML with HTTPS URL only (works in all email clients)
    const customerHtml = generateCustomerInvoiceHTML(invoiceData, logoUrl)
    const adminHtml = generateAdminInvoiceHTML(invoiceData, logoUrl)

    // Generate PDF from customer invoice HTML (using external API - lightweight)
    const pdfBuffer = await generatePDFFromHTML(customerHtml)
    const pdfAttachment = pdfBuffer ? {
      name: `Factuur_${invoiceData.orderNumber}.pdf`,
      content: pdfBuffer
    } : undefined

    if (pdfBuffer) {
      console.log(`[Invoice] PDF generated successfully (${pdfBuffer.length} bytes)`)
    } else {
      console.warn(`[Invoice] PDF generation skipped - no API configured. Add DOPPIO_API_KEY or HTMLPDF_API_KEY to enable PDF attachments`)
    }

    // Send invoice to customer with PDF attachment (no inline attachment needed - using URL/base64 in HTML)
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

