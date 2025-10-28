// app/api/admin/products/[id]/route.ts - Individual Product API
import { NextResponse } from 'next/server'
import { requireAdminAPI } from '@/lib/admin-auth'
import { z } from 'zod'

const updateProductSchema = z.object({
  name: z.string().min(1, 'Naam is verplicht').optional(),
  description: z.string().min(10, 'Beschrijving is te kort').optional(),
  shortDescription: z.string().min(5, 'Korte beschrijving is te kort').optional(),
  price: z.number().min(0, 'Prijs moet positief zijn').optional(),
  type: z.enum(['course', 'ebook']).optional(),
  category: z.string().min(1, 'Categorie is verplicht').optional(),
  isActive: z.boolean().optional(),
  featured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAPI()
    
    const { id: productId } = await params
    
    // Mock data - in echte app zou je database query maken
    const mockProduct = {
      id: productId,
      name: 'Podcasten voor beginners',
      description: 'Leer alles over podcasten in deze uitgebreide cursus...',
      shortDescription: 'Een complete cursus over podcasten',
      price: 9700,
      type: 'course',
      category: 'Audio',
      isActive: true,
      featured: true,
      tags: ['podcast', 'audio', 'beginners'],
      metaTitle: 'Podcasten voor beginners - Studio Insight',
      metaDescription: 'Leer podcasten met onze uitgebreide cursus',
      sales: 45,
      createdAt: '2024-10-20T10:00:00Z',
      updatedAt: '2024-10-26T15:30:00Z'
    }
    
    return NextResponse.json({
      success: true,
      data: mockProduct
    })
    
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message.includes('Authentication') ? 401 : 403 }
      )
    }
    
    console.error('Admin product GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Interne serverfout' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAPI()
    
    const { id: productId } = await params
    const body = await request.json()
    const validatedData = updateProductSchema.parse(body)
    
    // In een echte app zou je hier de database updaten
    const updatedProduct = {
      id: productId,
      ...validatedData,
      updatedAt: new Date().toISOString()
    }
    
    console.log('Product updated:', updatedProduct)
    
    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Product succesvol bijgewerkt'
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message.includes('Authentication') ? 401 : 403 }
      )
    }
    
    console.error('Admin product PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'Interne serverfout' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAPI()
    
    const { id: productId } = await params
    
    // In een echte app zou je hier de database verwijderen
    console.log('Product deleted:', productId)
    
    return NextResponse.json({
      success: true,
      message: 'Product succesvol verwijderd'
    })
    
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message.includes('Authentication') ? 401 : 403 }
      )
    }
    
    console.error('Admin product DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Interne serverfout' },
      { status: 500 }
    )
  }
}


