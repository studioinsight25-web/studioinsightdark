import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'

// Protected migration endpoint to create password reset infrastructure
// Requires header: x-migration-secret: <ADMIN_MIGRATION_SECRET>
export async function POST(request: NextRequest) {
  try {
    const secretHeader = request.headers.get('x-migration-secret') || ''
    const expected = process.env.ADMIN_MIGRATION_SECRET || ''

    if (!expected) {
      return NextResponse.json(
        { error: 'Server not configured: ADMIN_MIGRATION_SECRET missing' },
        { status: 500 }
      )
    }

    if (secretHeader !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Run migration statements idempotently
    const statements: string[] = [
      'CREATE EXTENSION IF NOT EXISTS pgcrypto;',
      `CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token VARCHAR(255) NOT NULL UNIQUE,
          expires_at TIMESTAMP NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );`,
      'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON "password_reset_tokens"(token);',
      'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON "password_reset_tokens"(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON "password_reset_tokens"(expires_at);'
    ]

    for (const sql of statements) {
      await DatabaseService.query(sql)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Migration] Error:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}


