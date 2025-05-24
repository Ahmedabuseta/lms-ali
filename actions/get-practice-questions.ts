import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

interface GetPracticeQuestionsProps {
  // userId: string;
  courseId?: string;
  chapterIds?: string[];
  page?: number;
  pageSize?: number;
}

export const getPracticeQuestions = async ({
  // userId,
  courseId,
  chapterIds,
  page = 1,
  pageSize = 10,
}: GetPracticeQuestionsProps) => {
  try {
    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Base query conditions with proper typing
    const baseConditions: Prisma.PracticeQuestionWhereInput = {
      courseId: courseId,
      ...(chapterIds && chapterIds.length > 0
        ? {
            chapterId: {
              in: chapterIds,
            },
          }
        : {}),
    };

    // Get total count for pagination
    const totalQuestions = await db.practiceQuestion.count({
      where: baseConditions,
    });

    // Get random questions based on conditions
    const questions = await db.practiceQuestion.findMany({
      where: baseConditions,
      include: {
        options: true,
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
      orderBy: {
        // Use random ordering
        createdAt: 'desc',
      },
      take: pageSize,
      skip: skip,
    });

    // Shuffle the questions for randomness
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);

    return {
      questions: shuffledQuestions,
      totalQuestions,
      pageCount: Math.ceil(totalQuestions / pageSize),
      currentPage: page,
    };
  } catch (error) {
    console.error('[GET_PRACTICE_QUESTIONS]', error);
    throw new Error('Failed to fetch practice questions');
  }
};
