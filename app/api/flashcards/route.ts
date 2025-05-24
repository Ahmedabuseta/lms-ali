import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    const { searchParams } = new URL(req.url);

    const courseId = searchParams.get('courseId');
    const chapterId = searchParams.get('chapterId');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify user has access to the course (purchased or is creator)
    if (courseId) {
      const courseAccess = await db.course.findFirst({
        where: {
          id: courseId,
          OR: [
            {
              purchases: {
                some: {
                  userId,
                },
              },
            },
            {},
          ],
        },
      });

      if (!courseAccess) {
        return new NextResponse('No access to this course', { status: 403 });
      }
    }

    // Get flashcards with pagination
    const flashcards = await db.flashcard.findMany({
      where: {
        ...(courseId
          ? {
              Course: {
                some: {
                  id: courseId,
                },
              },
            }
          : {}),
        ...(chapterId ? { chapterId } : {}),
      },
      take: 20,
      skip: offset,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        question: true,
        answer: true,
      },
    });

    return NextResponse.json(flashcards);
  } catch (error) {
    console.error('[FLASHCARDS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
