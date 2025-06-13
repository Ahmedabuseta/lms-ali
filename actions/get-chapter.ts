import { Attachment, Chapter } from '@prisma/client';
import { db } from '@/lib/db';
import { canAccessChapterContent, getCurrentUser } from '@/lib/user';

type GetChapterArgs = { userId: string;
  courseId: string;
  chapterId: string; };

export async function getChapter({ userId, courseId, chapterId }: GetChapterArgs) {
  try {
    const course = await db.course.findUnique({ where: { id: courseId, isPublished: true }, select: { price: true } });
    const chapter = await db.chapter.findUnique({ where: { id: chapterId, isPublished: true } });

    if (!chapter || !course) {
      console.log('Chapter or course not found:', { chapterId, courseId, chapter: !!chapter, course: !!course });
      throw new Error('Chapter or course not found!');
    }

    // Get user for access checking
    const user = await getCurrentUser();
    const hasChapterAccess = user ? await canAccessChapterContent(user, chapterId) : false;

    let muxData = null;
    let attachments: Attachment[] = [];
    let nextChapter: Chapter | null = null;
    let chapterQuiz = null;



    // Get chapter quiz if user has access
    if (hasChapterAccess) {
      chapterQuiz = await db.quiz.findFirst({
        where: {
          chapterId,
          isPublished: true,
        },
        include: {
          quizQuestions: {
            include: {
              question: {
                include: {
                  options: true,
                },
              },
            },
            orderBy: { position: 'asc' },
          },
          attempts: {
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });
    }

    // Provide video access only if user has chapter access
    if (hasChapterAccess) {
      muxData = await db.muxData.findUnique({ where: { chapterId } });

      nextChapter = await db.chapter.findFirst({
        where: {
          courseId,
          isPublished: true,
          position: { gt: chapter.position }
        },
        orderBy: { position: 'asc' },
      });
    }

    const userProgress = await db.userProgress.findUnique({
      where: { userId_chapterId: { userId, chapterId } }
    });

    return {
      chapter,
      course,
      muxData,
      attachments,
      nextChapter,
      userProgress,
      hasChapterAccess,
      chapterQuiz,
    };
  } catch (error) {
    console.error('Error in getChapter:', error);
    return {
      chapter: null,
      course: null,
      muxData: null,
      attachments: [],
      nextChapter: null,
      userProgress: null,
      purchase: null,
      hasChapterAccess: false,
      chapterQuiz: null,
    };
  }
}
