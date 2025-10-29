import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email en wachtwoord zijn verplicht' },
        { status: 400 }
      )
    }

    console.log('🔍 Attempting login for:', email)

    // Get user from database
    const result = await DatabaseService.query(
      'SELECT id, email, name, password, role, "createdAt", "updatedAt" FROM users WHERE email = $1',
      [email]
    )

    if (result.length === 0) {
      console.log('❌ User not found:', email)
      return NextResponse.json(
        { error: 'Ongeldige inloggegevens' },
        { status: 401 }
      )
    }

    const user = result[0]
    console.log('✅ User found:', user.email, 'Role:', user.role)

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      console.log('❌ Invalid password for:', email)
      return NextResponse.json(
        { error: 'Ongeldige inloggegevens' },
        { status: 401 }
      )
    }

    console.log('✅ Login successful for:', email)

    // Return user data (without password)
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })

  } catch (error) {
    console.error('❌ Login error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het inloggen' },
      { status: 500 }
    )
  }
}