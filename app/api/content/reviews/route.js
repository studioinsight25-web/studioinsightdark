import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        slug: true,
        productName: true,
        brand: true,
        rating: true,
        pros: true,
        cons: true,
        content: true,
        affiliateUrl: true,
        imageUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
