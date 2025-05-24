import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { isTeacher } from '@/lib/user';

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

    const { isApproved } = await request.json();

    if (typeof isApproved !== 'boolean') {
      return new NextResponse('Invalid approval status', { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: {
        id: params.userId,
      },
      data: {
        accessType: isApproved ? 'FULL_ACCESS' : 'NO_ACCESS',
        accessGrantedBy: isApproved ? currentUserId : null,
        accessGrantedAt: isApproved ? new Date() : null,
        paymentReceived: isApproved,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('[USER_APPROVAL_UPDATE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
