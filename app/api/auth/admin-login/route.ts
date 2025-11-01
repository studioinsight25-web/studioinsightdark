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

    console.log('🔍 Admin login attempt for:', email)

    // Get user from database
    const result = await DatabaseService.query(
      'SELECT id, email, name, password, role FROM users WHERE email = $1',
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

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Geen toegang tot admin dashboard' },
        { status: 403 }
      )
    }

    console.log('✅ Admin login successful for:', email)

    // Return user data (without password)
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het inloggen' },
      { status: 500 }
    )
  }
}






