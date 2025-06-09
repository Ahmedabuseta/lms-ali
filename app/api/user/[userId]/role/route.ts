import { NextRequest, NextResponse } from 'next/server';
import { UserRole, StudentAccessType } from '@prisma/client';
import { db } from '@/lib/db';
import { requireTeacher } from '@/lib/api-auth';

export async function PATCH(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const currentUser = await requireTeacher();

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
          accessGrantedBy: currentUser.id,
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
