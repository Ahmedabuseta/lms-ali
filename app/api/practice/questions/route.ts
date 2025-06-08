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
      return new NextResponse('Course ID required', { status: 400 });
    }

    const questions = await db.practiceQuestion.findMany({
      where: {
        courseId,
      },
      include: {
        options: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Found ${questions.length} practice questions for course ${courseId}`);

    return NextResponse.json(questions);
  } catch (error) {
    console.log('[PRACTICE_QUESTIONS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
