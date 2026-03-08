import { NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, productType } = body;

    if (!productId || !productType) {
      return NextResponse.json(
        { error: 'Product ID and type are required' },
        { status: 400 }
      );
    }

    let product;
    if (productType === 'course') {
      product = await prisma.course.findUnique({
        where: { id: productId, isActive: true },
      });
    } else if (productType === 'ebook') {
      product = await prisma.ebook.findUnique({
        where: { id: productId, isActive: true },
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid product type' },
        { status: 400 }
      );
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user already purchased this product
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: user.id,
        productId: product.id,
        productType: productType,
      },
    });

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'You already own this product' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const session = await createCheckoutSession({
      productId: product.id,
      productType: productType,
      price: product.price,
      title: product.title,
      description: product.description,
      customerEmail: user.email,
      successUrl: `${baseUrl}/dashboard?success=true`,
      cancelUrl: `${baseUrl}/${productType === 'course' ? 'cursus' : 'e-books'}`,
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
