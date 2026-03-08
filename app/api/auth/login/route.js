import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, setAuthCookie } from '@/lib/auth';
import { validateEmail, validateRequired, sanitizeInput } from '@/lib/validation';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    validateRequired(email, 'Email');
    validateRequired(password, 'Password');
    
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Sanitize input
    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Set auth cookie
    await setAuthCookie(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        hasAccess: user.hasAccess,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
