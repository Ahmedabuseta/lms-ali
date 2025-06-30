import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth-helpers';
import { isTeacher } from '@/lib/user';
import { cookies } from 'next/headers';
import { auth } from '@/lib/auth';

// POST /api/admin/impersonate - Impersonate a user
export async function POST(request: NextRequest) {
  try {
    const { session } = await requireAuth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a teacher
    const teacherCheck = await isTeacher();
    if (!teacherCheck) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Find the target user
    const targetUser = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        banned: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Don't allow impersonating teachers
    if (targetUser.role === 'TEACHER') {
      return NextResponse.json({ error: 'Cannot impersonate teachers' }, { status: 403 });
    }

    // Don't allow impersonating banned users
    if (targetUser.banned) {
      return NextResponse.json({ error: 'Cannot impersonate banned users' }, { status: 403 });
    }

    // Create a new session for the target user with impersonation flag
    const newSession = await db.session.create({
      data: {
        userId: targetUser.id,
        token: generateSecureToken(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        ipAddress: getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined,
        impersonatedBy: session.userId, // Mark as impersonated by current teacher
      },
    });

    // Set the session cookie for the impersonated user
    const cookieStore = cookies();
    cookieStore.set('better-auth.session_token', newSession.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return NextResponse.json({ 
      message: 'Impersonation successful',
      session: {
        id: newSession.id,
        userId: targetUser.id,
        user: {
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role,
        },
        impersonatedBy: session.userId,
      },
    });

  } catch (error) {
    console.error('Error impersonating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate a secure token
function generateSecureToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}
