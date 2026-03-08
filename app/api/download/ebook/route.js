import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { generateEbookDownloadUrl } from '@/lib/storage';

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
    const { ebookId } = body;

    if (!ebookId) {
      return NextResponse.json(
        { error: 'Ebook ID is required' },
        { status: 400 }
      );
    }

    const result = await generateEbookDownloadUrl(ebookId, user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      downloadUrl: result.downloadUrl,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error('Ebook download error:', error);
    return NextResponse.json(
      { error: 'Failed to generate download link' },
      { status: 500 }
    );
  }
}
