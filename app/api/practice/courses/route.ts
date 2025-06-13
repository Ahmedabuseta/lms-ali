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
    const categoryId = searchParams.get('categoryId');

    const courses = await db.course.findMany({
      where: {
        isPublished: true,
        ...(categoryId && { categoryId }),
      },
      include: {
        category: true,
        chapters: {
          where: {
            isPublished: true,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const coursesWithProgress = courses.map((course) => ({
      ...course,
      progress: null, // Add progress calculation if needed
    }));

    console.log(`Found ${coursesWithProgress.length} courses for practice`);

    return NextResponse.json(coursesWithProgress);
  } catch (error) {
    console.log('[PRACTICE_COURSES_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
