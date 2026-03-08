import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const ebooks = await prisma.ebook.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        price: true,
        coverUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      ebooks,
    });
  } catch (error) {
    console.error('Error fetching ebooks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ebooks' },
      { status: 500 }
    );
  }
}
