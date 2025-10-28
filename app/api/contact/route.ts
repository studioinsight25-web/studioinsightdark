// app/api/contact/route.ts - Secure Contact Form API
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

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

    // Check for potential spam patterns
    const spamPatterns = [
      /http[s]?:\/\/[^\s]+/gi, // URLs
      /[A-Z]{5,}/g, // Excessive caps
      /(.)\1{4,}/g, // Repeated characters
    ]

    const isSpam = spamPatterns.some(pattern => 
      pattern.test(name) || pattern.test(message)
    )

    if (isSpam) {
      return NextResponse.json(
        { error: 'Bericht lijkt op spam.' },
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

    // In production, you would:
    // 1. Save to database
    // 2. Send email notification
    // 3. Log the submission
    
    console.log('Contact form submission:', sanitizedData)

    // Simulate email sending (replace with actual email service)
    // await sendEmail({
    //   to: 'info@studioinsight.nl',
    //   subject: `Contact form: ${sanitizedData.subject}`,
    //   body: `From: ${sanitizedData.name} (${sanitizedData.email})\n\n${sanitizedData.message}`
    // })

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


