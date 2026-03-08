import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, setAuthCookie } from '@/lib/auth';
import { validateEmail, validatePassword, validateRequired, sanitizeInput } from '@/lib/validation';

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

    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters with uppercase, lowercase, and number' },
        { status: 400 }
      );
    }

    // Sanitize input
    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    
    const user = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        hasAccess: true,
        createdAt: true,
      },
    });

    // Set auth cookie
    await setAuthCookie(user.id);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
