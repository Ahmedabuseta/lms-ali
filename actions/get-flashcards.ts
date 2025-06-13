import { db } from '@/lib/db';

interface GetFlashcardsProps { userId: string;
  courseId?: string;
  chapterId?: string;
  page?: number;
  pageSize?: number; }

export async function getFlashcards({ userId, courseId, chapterId, page = 1, pageSize = 10 }: GetFlashcardsProps) { try {
    // Check if the user has purchased the course
    if (courseId) {
      const purchase = await db.purchase.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId, },
        },
      });

      if (!purchase) { return { flashcards: [], totalCount: 0 };
      }
    }

    // Create the base query
    const where: any = {};

    // Add filters if provided
    if (chapterId) {
      where.chapterId = chapterId;
    } else if (courseId) { // Filter flashcards by course through the chapter relationship
      where.chapter = {
        courseId: courseId,
        isPublished: true, };
    }

    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Get total count for pagination
    const totalCount = await db.flashcard.count({ where });

    // Get the flashcards
    const flashcards = await db.flashcard.findMany({ where,
      skip,
      take: pageSize,
      orderBy: {
        createdAt: 'desc', },
      include: { chapter: {
          select: {
            title: true,
            course: {
              select: {
                title: true, },
            },
          },
        },
      },
    });

    return { flashcards,
      totalCount, };
  } catch (error) { console.error('[GET_FLASHCARDS_ERROR]', error);
    return { flashcards: [], totalCount: 0 };
  }
}
