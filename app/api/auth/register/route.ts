// app/api/auth/register/route.ts - Register API
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createUser, getUserByEmail, generateToken, setAuthCookie } from '@/lib/auth'

const registerSchema = z.object({
  name: z.string().min(2, 'Naam moet minimaal 2 karakters bevatten'),
  email: z.string().email('Ongeldig e-mailadres'),
  password: z.string().min(6, 'Wachtwoord moet minimaal 6 karakters bevatten'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Wachtwoorden komen niet overeen",
  path: ["confirmPassword"],
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'Er bestaat al een account met dit e-mailadres' },
        { status: 400 }
      )
    }

    // Create new user
    const user = await createUser(email, password, name)
    const token = generateToken(user)
    await setAuthCookie(token)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Register error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validatiefout', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}


