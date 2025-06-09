import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    const { searchParams } = new URL(req.url);

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const courseId = searchParams.get('courseId');
    const chapterId = searchParams.get('chapterId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!courseId) {
      return new NextResponse('Course ID required', { status: 400 });
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      chapter: {
        courseId,
      },
    };

    // Add chapter filter if provided
    if (chapterId) {
      whereClause.chapterId = chapterId;
    }

    // Get total count for pagination info
    const totalCount = await db.flashcard.count({
      where: whereClause,
    });

    // Get flashcards with pagination and randomization
    const flashcards = await db.flashcard.findMany({
      where: whereClause,
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
            courseId: true,
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy: {
        // Use a combination of random ordering
        createdAt: 'desc',
      },
    });

    // Randomize the results after fetching
    const randomizedFlashcards = flashcards.sort(() => Math.random() - 0.5);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      flashcards: randomizedFlashcards,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.log('[FLASHCARDS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
