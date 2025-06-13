import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { Flashcard } from '@prisma/client';
import { canAccessChapterServices } from '@/lib/user';

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
    const limit = parseInt(searchParams.get('limit') || '25');
    const randomSeed = searchParams.get('seed') || Date.now().toString(); // For consistent randomization in same session

    if (!courseId) {
      return new NextResponse('Course ID required', { status: 400 });
    }

    // If specific chapter requested, check chapter-specific access
    if (chapterId) {
      const hasAccess = await canAccessChapterServices(user, chapterId);
      if (!hasAccess) {
        return new NextResponse('Access denied for this chapter content', { status: 403 });
      }
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

    // Get flashcards with true database-level randomization
    let flashcards: Flashcard[] = [];
    
    if (chapterId) {
      // Use raw SQL for true randomization when filtering by chapter
      flashcards = await db.$queryRaw`
        SELECT 
          f.*,
          c.id as "chapter_id",
          c.title as "chapter_title",
          c."courseId" as "chapter_courseId"
        FROM "Flashcard" f
        JOIN "Chapter" c ON f."chapterId" = c.id
        WHERE f."chapterId" = ${chapterId}
        AND c."courseId" = ${courseId}
        ORDER BY RANDOM()
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    } else {
      // Use raw SQL for true randomization across all chapters in course
      flashcards = await db.$queryRaw`
        SELECT 
          f.*,
          c.id as "chapter_id", 
          c.title as "chapter_title",
          c."courseId" as "chapter_courseId"
        FROM "Flashcard" f
        JOIN "Chapter" c ON f."chapterId" = c.id
        WHERE c."courseId" = ${courseId}
        ORDER BY RANDOM()
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    }

    // Transform the raw result to match expected structure
    const randomizedFlashcards = flashcards.map((flashcard: any) => ({
      id: flashcard.id,
      question: flashcard.question,
      answer: flashcard.answer,
      chapterId: flashcard.chapterId,
      createdAt: flashcard.createdAt,
      updatedAt: flashcard.updatedAt,
      chapter: {
        id: flashcard.chapter_id,
        title: flashcard.chapter_title,
        courseId: flashcard.chapter_courseId,
      },
    }));

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
