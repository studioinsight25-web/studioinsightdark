import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'

export async function GET(request: NextRequest) {
  try {
    const users = await DatabaseService.query(
      'SELECT id, email, name, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    )

    return NextResponse.json(users.map((user: any) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.created_at || user.createdAt,
      updatedAt: user.updated_at || user.updatedAt
    })))
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}