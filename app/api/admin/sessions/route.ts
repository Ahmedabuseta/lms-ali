import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth-helpers';
import { isTeacher } from '@/lib/user';

// GET /api/admin/sessions - Fetch all sessions
export async function GET(request: NextRequest) {
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

    // Fetch all sessions with user information
    const sessions = await db.session.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100, // Limit for performance
    });

    // Transform sessions for the frontend
    const transformedSessions = sessions.map(session => ({
      id: session.id,
      userId: session.userId,
      token: session.token,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
      impersonatedBy: session.impersonatedBy,
      user: {
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      },
    }));

    return NextResponse.json({ 
      sessions: transformedSessions,
      total: sessions.length 
    });

  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/sessions - Revoke a session
export async function DELETE(request: NextRequest) {
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

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Find the session to make sure it exists
    const existingSession = await db.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Delete the session
    await db.session.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({ 
      message: 'Session revoked successfully',
      sessionId,
      user: existingSession.user,
    });

  } catch (error) {
    console.error('Error revoking session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
