 import { db } from "@/lib/db";

interface GetFlashcardsProps {
  userId: string;
  courseId?: string;
  chapterId?: string;
  page?: number;
  pageSize?: number;
}

export async function getFlashcards({
  userId,
  courseId,
  chapterId,
  page = 1,
  pageSize = 10,
}: GetFlashcardsProps) {
  try {
    // Check if the user has purchased the course
    if (courseId) {
      const purchase = await db.purchase.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      });

      if (!purchase) {
        return { flashcards: [], totalCount: 0 };
      }
    }

    // Create the base query
    const where: any = {};
    
    // Add filters if provided
    if (courseId) {
      where.courseId = courseId;
    }
    
    if (chapterId) {
      where.chapterId = chapterId;
    } else if (courseId) {
      // If only courseId is specified, we need to make sure we only get flashcards
      // for chapters that are published
      where.course = {
        chapters: {
          some: {
            isPublished: true,
          },
        },
      };
    }
    
    // Calculate pagination
    const skip = (page - 1) * pageSize;
    
    // Get total count for pagination
    const totalCount = await db.flashcard.count({ where });

    // Get the flashcards
    const flashcards = await db.flashcard.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        course: {
          select: {
            title: true,
          },
        },
        chapter: {
          select: {
            title: true,
          },
        },
      },
    });

    return {
      flashcards,
      totalCount,
    };
  } catch (error) {
    console.error("[GET_FLASHCARDS_ERROR]", error);
    return { flashcards: [], totalCount: 0 };
  }
}