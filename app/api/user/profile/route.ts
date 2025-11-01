import { NextRequest, NextResponse } from 'next/server'
import SessionManager from '@/lib/session'
import { UserService } from '@/lib/user-database'

export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const session = SessionManager.getSession()
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user profile
    const user = await UserService.getUserById(session.userId)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        address: user.address,
        city: user.city,
        postcode: user.postcode,
        country: user.country,
        phone: user.phone,
        company_name: user.company_name,
        industry: user.industry,
        website: user.website
      }
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

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

    const { 
      name, 
      email, 
      address, 
      city, 
      postcode, 
      country, 
      phone, 
      company_name, 
      industry, 
      website 
    } = await request.json()

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

    // Update user with all profile fields
    const updatedUser = await UserService.updateUser(session.userId, {
      name,
      email,
      address: address || null,
      city: city || null,
      postcode: postcode || null,
      country: country || null,
      phone: phone || null,
      company_name: company_name || null,
      industry: industry || null,
      website: website || null
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
        role: updatedUser.role,
        address: updatedUser.address,
        city: updatedUser.city,
        postcode: updatedUser.postcode,
        country: updatedUser.country,
        phone: updatedUser.phone,
        company_name: updatedUser.company_name,
        industry: updatedUser.industry,
        website: updatedUser.website
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

