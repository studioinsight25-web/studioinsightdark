import { NextRequest, NextResponse } from 'next/server'
import { brevoFetchListContacts } from '@/lib/brevo'
import { requireAdminAPI } from '@/lib/admin-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { listId: string } }
) {
  try {
    await requireAdminAPI()

    const listIdRaw = params.listId
    const listId = Number(listIdRaw)

    if (!Number.isFinite(listId) || listId <= 0) {
      return NextResponse.json({ error: 'Ongeldig lijst ID' }, { status: 400 })
    }

    const contacts = await brevoFetchListContacts(listId)

    return NextResponse.json({
      listId,
      count: contacts.length,
      contacts
    })
  } catch (error) {
    console.error('❌ Brevo lijst ophalen mislukt:', error)
    return NextResponse.json({
      error: 'Kon Brevo lijst niet ophalen',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

