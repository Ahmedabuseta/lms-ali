import { db } from '@/lib/db';

export async function canAccessNextChapter(
  userId: string, 
  courseId: string, 
  currentChapterPosition: number
): Promise<boolean> {
  try {
    // Get the previous chapter (the one that needs to be completed first)
    const previousChapter = await db.chapter.findFirst({
      where: {
        courseId,
        position: currentChapterPosition - 1,
        isPublished: true,
      },
      include: {
        quizzes: {
          where: { isPublished: true },
          include: {
            attempts: {
              where: { userId },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
        userProgress: {
          where: { userId },
        },
      },
    });

    // If there's no previous chapter (this is the first chapter), allow access
    if (!previousChapter) {
      return true;
    }

    // Check if the previous chapter is marked as completed
    const isPreviousChapterCompleted = previousChapter.userProgress.some(
      progress => progress.isCompleted
    );

    if (!isPreviousChapterCompleted) {
      return false;
    }

    // Check if previous chapter has a quiz requirement
    const previousChapterQuiz = previousChapter.quizzes[0];
    
    if (previousChapterQuiz && previousChapterQuiz.attempts.length > 0) {
      // If there's a quiz, check if the user has passed it
      const hasPassedQuiz = previousChapterQuiz.attempts.some(
        attempt => attempt.isPassed
      );
      
      return hasPassedQuiz;
    }

    // If no quiz requirement, just check if chapter is completed
    return isPreviousChapterCompleted;
  } catch (error) {
    console.error('Error checking chapter access:', error);
    return false;
  }
}

export async function getChapterAccessInfo(
  userId: string, 
  courseId: string
): Promise<Record<string, boolean>> {
  try {
    const chapters = await db.chapter.findMany({
      where: {
        courseId,
        isPublished: true,
      },
      orderBy: {
        position: 'asc',
      },
    });

    const accessInfo: Record<string, boolean> = {};

    for (const chapter of chapters) {
      accessInfo[chapter.id] = await canAccessNextChapter(
        userId, 
        courseId, 
        chapter.position
      );
    }

    return accessInfo;
  } catch (error) {
    console.error('Error getting chapter access info:', error);
    return {};
  }
} 