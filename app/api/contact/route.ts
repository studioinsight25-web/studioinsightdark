// app/api/contact/route.ts - Secure Contact Form API
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { brevoSendEmail } from '@/lib/brevo'

// Input validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Naam moet minimaal 2 karakters bevatten').max(100),
  email: z.string().email('Ongeldig e-mailadres'),
  subject: z.string().min(1, 'Onderwerp is verplicht'),
  message: z.string().min(10, 'Bericht moet minimaal 10 karakters bevatten').max(1000),
})

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 5 // Max 5 requests per 15 minutes

  const userLimit = rateLimitStore.get(ip)
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (userLimit.count >= maxRequests) {
    return false
  }

  userLimit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting (from headers)
    const xff = request.headers.get('x-forwarded-for')
    const ip = (xff ? xff.split(',')[0]?.trim() : undefined)
      || request.headers.get('x-real-ip')
      || 'unknown'
    
    // Rate limiting check
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { error: 'Te veel verzoeken. Probeer het later opnieuw.' },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = contactSchema.parse(body)

    // Additional security checks
    const { name, email, subject, message } = validatedData

    // Check for potential spam patterns (more lenient)
    const spamPatterns = [
      /http[s]?:\/\/[^\s]{10,}/gi, // Long URLs only
      /[A-Z]{10,}/g, // Very excessive caps (10+)
      /(.)\1{10,}/g, // Many repeated characters (10+)
      /(spam|viagra|casino|lottery|prize|winner|click here|buy now){2,}/gi, // Spam keywords
    ]

    // Only check message for spam, not name (names can have caps)
    const isSpam = spamPatterns.some(pattern => 
      pattern.test(message)
    )

    if (isSpam) {
      console.warn('Potential spam detected:', { email, subject })
      return NextResponse.json(
        { error: 'Bericht lijkt op spam. Als dit een fout is, neem dan direct contact op via e-mail.' },
        { status: 400 }
      )
    }

    // Sanitize input (basic HTML escaping)
    const sanitizedData = {
      name: name.replace(/[<>]/g, ''),
      email: email.toLowerCase().trim(),
      subject: subject.replace(/[<>]/g, ''),
      message: message.replace(/[<>]/g, ''),
      timestamp: new Date().toISOString(),
      ip: ip
    }

    // Log the submission
    console.log('Contact form submission:', sanitizedData)

    // Send email notification using Brevo
    const adminEmail = process.env.CONTACT_EMAIL || 'info@studio-insight.nl'
    const subjectMapping: Record<string, string> = {
      'cursus': 'Vraag over cursussen',
      'ebook': 'Vraag over e-books',
      'review': 'Product review aanvraag',
      'partnership': 'Partnership mogelijkheden',
      'support': 'Technische ondersteuning',
      'other': 'Anders'
    }
    
    const subjectDisplay = subjectMapping[subject] || subject
    const emailSubject = `Contactformulier: ${subjectDisplay} - ${sanitizedData.name}`
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px;">Nieuw contactformulier bericht</h2>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Van:</strong> ${sanitizedData.name}</p>
          <p><strong>E-mail:</strong> <a href="mailto:${sanitizedData.email}">${sanitizedData.email}</a></p>
          <p><strong>Onderwerp:</strong> ${subjectDisplay}</p>
          <p><strong>Datum:</strong> ${new Date(sanitizedData.timestamp).toLocaleString('nl-NL')}</p>
        </div>
        
        <div style="margin: 20px 0;">
          <h3 style="color: #333;">Bericht:</h3>
          <div style="background: #fff; padding: 15px; border-left: 4px solid #0ea5e9; white-space: pre-wrap;">${sanitizedData.message.replace(/\n/g, '<br>')}</div>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
          <p>Dit bericht is verzonden via het contactformulier op studio-insight.nl</p>
          <p>Antwoord direct op deze e-mail om contact op te nemen met ${sanitizedData.name}</p>
        </div>
      </div>
    `
    
    // Try to send email, but don't fail the request if email fails
    const emailResult = await brevoSendEmail(adminEmail, emailSubject, emailHtml)
    
    if (!emailResult.sent) {
      console.error('❌ Failed to send contact form email:', emailResult.reason)
      // Still return success to user, but log the email failure
    } else {
      console.log('✅ Contact form email sent successfully')
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Bericht succesvol verzonden!' 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Contact form error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validatiefout', 
          details: error.issues 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Er is een fout opgetreden. Probeer het later opnieuw.' },
      { status: 500 }
    )
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}


