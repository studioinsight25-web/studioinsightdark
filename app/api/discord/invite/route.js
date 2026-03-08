import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createDiscordInvite } from '@/lib/discord';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!user.hasAccess) {
      return NextResponse.json(
        { error: 'Access denied. You need to purchase a course or ebook first.' },
        { status: 403 }
      );
    }

    const result = await createDiscordInvite();

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      inviteUrl: result.inviteUrl,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error('Discord invite error:', error);
    return NextResponse.json(
      { error: 'Failed to create Discord invite' },
      { status: 500 }
    );
  }
}
