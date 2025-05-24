import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { isTeacher } from '@/lib/user';
import { UserRole, StudentAccessType } from '@prisma/client';

export async function PATCH(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId: currentUserId } = auth();

    if (!currentUserId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const teacherCheck = await isTeacher();
    if (!teacherCheck) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { role } = await request.json();

    if (!Object.values(UserRole).includes(role)) {
      return new NextResponse('Invalid role', { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: {
        id: params.userId,
      },
      data: {
        role,
        // If changing to TEACHER, give full access
        ...(role === UserRole.TEACHER && {
          accessType: StudentAccessType.FULL_ACCESS,
          paymentReceived: true,
          accessGrantedBy: currentUserId,
          accessGrantedAt: new Date(),
        }),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('[USER_ROLE_UPDATE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
