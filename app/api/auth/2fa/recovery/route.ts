import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'
import bcrypt from 'bcryptjs'

function generateCodes(count = 10): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    const raw = Math.random().toString(36).slice(2, 6) + '-' + Math.random().toString(36).slice(2, 6)
    codes.push(raw.toUpperCase())
  }
  return codes
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('studio-insight-session')
    if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const session = JSON.parse(sessionCookie.value)
    if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const codes = generateCodes(10)
    const hashes = await Promise.all(codes.map(c => bcrypt.hash(c, 10)))

    // Remove old codes
    await DatabaseService.query('DELETE FROM user_recovery_codes WHERE user_id = $1', [session.userId])
    // Insert new
    for (const h of hashes) {
      await DatabaseService.query('INSERT INTO user_recovery_codes (user_id, code_hash) VALUES ($1, $2)', [session.userId, h])
    }

    return NextResponse.json({ codes })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate codes' }, { status: 500 })
  }
}


