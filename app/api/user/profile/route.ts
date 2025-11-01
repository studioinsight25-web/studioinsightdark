import { NextRequest, NextResponse } from 'next/server'
import SessionManager from '@/lib/session'
import { UserService } from '@/lib/user-database'

export async function PUT(request: NextRequest) {
  try {
    // Get user from session
    const session = SessionManager.getSession()
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { name, email } = await request.json()

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if email is already taken by another user
    const existingUser = await UserService.getUserByEmail(email)
    if (existingUser && existingUser.id !== session.userId) {
      return NextResponse.json(
        { error: 'E-mailadres is al in gebruik door een ander account' },
        { status: 400 }
      )
    }

    // Update user
    const updatedUser = await UserService.updateUser(session.userId, {
      name,
      email
    })

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role
      }
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

