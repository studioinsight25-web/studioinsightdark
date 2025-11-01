// app/api/cart/check/route.ts - Diagnostic endpoint for cart issues
import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-direct'
import SessionManager from '@/lib/session'

export async function GET(request: NextRequest) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    checks: {}
  }

  try {
    // Check 1: Session
    const session = SessionManager.getSession()
    diagnostics.checks.session = {
      exists: !!session,
      hasUserId: !!(session && session.userId),
      userId: session?.userId || null
    }

    // Check 2: Database connection
    try {
      await DatabaseService.query('SELECT 1')
      diagnostics.checks.database = { connected: true }
    } catch (error) {
      diagnostics.checks.database = { 
        connected: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }

    // Check 3: cartItems table exists
    try {
      const tableCheck = await DatabaseService.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'cartItems'
        )`
      )
      diagnostics.checks.cartItemsTable = { 
        exists: tableCheck[0]?.exists || false 
      }

      // Check 4: Try to query the table
      if (diagnostics.checks.cartItemsTable.exists && session?.userId) {
        try {
          const testQuery = await DatabaseService.query(
            'SELECT COUNT(*) as count FROM "cartItems" WHERE "userId" = $1',
            [session.userId]
          )
          diagnostics.checks.cartItemsQuery = { 
            success: true, 
            count: testQuery[0]?.count || 0 
          }
        } catch (error) {
          diagnostics.checks.cartItemsQuery = { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          }
        }
      }

      // Check 5: Check table structure
      if (diagnostics.checks.cartItemsTable.exists) {
        try {
          const columns = await DatabaseService.query(
            `SELECT column_name, data_type 
             FROM information_schema.columns 
             WHERE table_name = 'cartItems' 
             ORDER BY ordinal_position`
          )
          diagnostics.checks.tableStructure = { 
            columns: columns.map((col: any) => ({
              name: col.column_name,
              type: col.data_type
            }))
          }
        } catch (error) {
          diagnostics.checks.tableStructure = { 
            error: error instanceof Error ? error.message : 'Unknown error' 
          }
        }
      }
    } catch (error) {
      diagnostics.checks.cartItemsTable = { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }

    // Overall status
    const allChecksPass = 
      diagnostics.checks.session?.hasUserId &&
      diagnostics.checks.database?.connected &&
      diagnostics.checks.cartItemsTable?.exists

    diagnostics.status = allChecksPass ? 'ok' : 'error'
    diagnostics.message = allChecksPass 
      ? 'All checks passed' 
      : 'Some checks failed - see details above'

    return NextResponse.json(diagnostics, { 
      status: allChecksPass ? 200 : 500 
    })
  } catch (error) {
    diagnostics.error = error instanceof Error ? error.message : 'Unknown error'
    diagnostics.status = 'error'
    return NextResponse.json(diagnostics, { status: 500 })
  }
}

