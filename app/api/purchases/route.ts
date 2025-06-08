import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return new NextResponse('Course ID is required', { status: 400 });
    }

    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });

    console.log(`Purchase check for user ${user.id} and course ${courseId}:`, !!purchase);

    return NextResponse.json({ purchased: !!purchase });
  } catch (error) {
    console.log('[PURCHASES_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
