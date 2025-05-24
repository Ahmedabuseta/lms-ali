import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
// import { db } from '@/lib/db'
import { Purchase } from '@prisma/client';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const purchases = await db.purchase.findMany({
      where: {
        userId,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Return just the courses from the purchases
    const courses = purchases.map((purchase: Purchase) => purchase.courseId);

    return NextResponse.json(courses);
  } catch (error) {
    console.log('[PURCHASES_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
