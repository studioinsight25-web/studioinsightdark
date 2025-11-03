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

    // Run migration statements idempotently with detailed diagnostics
    const diagnostics: any[] = []

    async function run(label: string, sql: string) {
      try {
        await DatabaseService.query(sql)
        diagnostics.push({ step: label, ok: true })
      } catch (e: any) {
        diagnostics.push({ step: label, ok: false, error: e?.message || String(e) })
      }
    }

    // Basic connectivity check
    await run('connect_test', 'SELECT NOW() as now;')

    await run('create_extension_pgcrypto', 'CREATE EXTENSION IF NOT EXISTS pgcrypto;')

    await run('create_table_password_reset_tokens', `
      CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `)

    await run('index_token', 'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON "password_reset_tokens"(token);')
    await run('index_user', 'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON "password_reset_tokens"(user_id);')
    await run('index_expires', 'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON "password_reset_tokens"(expires_at);')

    const hasFailure = diagnostics.some(d => !d.ok)
    return NextResponse.json({ success: !hasFailure, diagnostics })
  } catch (error) {
    console.error('[Migration] Error:', error)
    // Return as 200 with detailed error to avoid Invoke-RestMethod masking body
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) })
  }
}


