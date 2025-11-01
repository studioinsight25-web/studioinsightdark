// app/api/auth/logout/route.ts - Logout API
import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth'

export async function POST() {
  try {
    await clearAuthCookie()
    
    return NextResponse.json({
      success: true,
      message: 'Succesvol uitgelogd'
    })

  } catch (error) {
    console.error('Logout error:', error)
    
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}








