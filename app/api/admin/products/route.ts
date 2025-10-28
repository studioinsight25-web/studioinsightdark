// app/api/admin/products/route.ts - Admin Products API
import { NextResponse } from 'next/server'
import { requireAdminAPI } from '@/lib/admin-auth'
import { DatabaseProductService } from '@/lib/products-database'
import { z } from 'zod'

const createProductSchema = z.object({
  name: z.string().min(1, 'Naam is verplicht'),
  description: z.string().min(10, 'Beschrijving is te kort'),
  shortDescription: z.string().min(5, 'Korte beschrijving is te kort'),
  price: z.number().min(0, 'Prijs moet positief zijn'),
  type: z.enum(['course', 'ebook']),
  category: z.string().min(1, 'Categorie is verplicht'),
  isActive: z.boolean().default(true),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    await requireAdminAPI()
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    
    let products = await DatabaseProductService.getAllProducts()
    
    if (type) {
      products = await DatabaseProductService.getProductsByType(type as 'course' | 'ebook')
    }
    
    if (category) {
      products = products.filter(p => p.category === category)
    }
    
    return NextResponse.json({
      success: true,
      data: products
    })
    
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message.includes('Authentication') ? 401 : 403 }
      )
    }
    
    console.error('Admin products GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Interne serverfout' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminAPI()
    
    const body = await request.json()
    const validatedData = createProductSchema.parse(body)
    
    // Generate unique ID
    const id = `product-${Date.now()}`
    
    // In een echte app zou je hier de database updaten
    const newProduct = {
      id,
      ...validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sales: 0
    }
    
    console.log('New product created:', newProduct)
    
    return NextResponse.json({
      success: true,
      data: newProduct,
      message: 'Product succesvol aangemaakt'
    }, { status: 201 })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      )
    }
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message.includes('Authentication') ? 401 : 403 }
      )
    }
    
    console.error('Admin products POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Interne serverfout' },
      { status: 500 }
    )
  }
}


