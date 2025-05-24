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

    const { accessType, paymentAmount, paymentNotes } = await request.json();

    if (!Object.values(StudentAccessType).includes(accessType)) {
      return new NextResponse('Invalid access type', { status: 400 });
    }

    if (accessType === StudentAccessType.NO_ACCESS || accessType === StudentAccessType.FREE_TRIAL) {
      return new NextResponse('Cannot grant trial or no access through this endpoint', { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: {
        id: params.userId,
      },
      data: {
        accessType,
        paymentReceived: true,
        paymentAmount,
        paymentNotes,
        accessGrantedBy: currentUserId,
        accessGrantedAt: new Date(),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('[GRANT_ACCESS]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
