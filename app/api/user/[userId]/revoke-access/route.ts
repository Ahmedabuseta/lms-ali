import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { isTeacher } from '@/lib/user';
import { StudentAccessType } from '@prisma/client';

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

    const updatedUser = await db.user.update({
      where: {
        id: params.userId,
      },
      data: {
        accessType: StudentAccessType.NO_ACCESS,
        paymentReceived: false,
        accessGrantedBy: null,
        accessGrantedAt: null,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('[REVOKE_ACCESS]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
