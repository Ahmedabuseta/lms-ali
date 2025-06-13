import { Attachment, Chapter } from '@prisma/client';
import { db } from '@/lib/db';
import { canAccessChapterContent, getCurrentUser } from '@/lib/user';

type GetChapterArgs = { userId: string;
  courseId: string;
  chapterId: string; };

export async function getChapter({ userId, courseId, chapterId }: GetChapterArgs) { try {
    const purchase = await db.purchase.findUnique({ where: { userId_courseId: { userId, courseId } } });
    const course = await db.course.findUnique({ where: { id: courseId, isPublished: true }, select: { price: true } });
    const chapter = await db.chapter.findUnique({ where: { id: chapterId, isPublished: true } });

    if (!chapter || !course) {
      throw new Error('Chapter or course not found!');
    }

    // Get user for access checking
    const user = await getCurrentUser();
    const hasChapterAccess = user ? await canAccessChapterContent(user, chapterId) : false;

    let muxData = null;
    let attachments: Attachment[] = [];
    let nextChapter: Chapter | null = null;
    let chapterQuiz = null;

    // Only provide attachments if user has purchased the course
    if (purchase) { attachments = await db.attachment.findMany({ where: { courseId } });
    }

    // Get chapter quiz if user has access
    if (hasChapterAccess) { chapterQuiz = await db.quiz.findFirst({
        where: {
          chapterId,
          isPublished: true, },
        include: { quizQuestions: {
            include: {
              question: {
                include: {
                  options: true, },
              },
            },
            orderBy: { position: 'asc', },
          },
          attempts: { where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });
    }

    // Provide video access only if user has chapter access
    if (hasChapterAccess) { muxData = await db.muxData.findUnique({ where: { chapterId } });

      nextChapter = await db.chapter.findFirst({ where: { courseId, isPublished: true, position: { gt: chapter.position } },
        orderBy: { position: 'asc' },
      });
    }

    const userProgress = await db.userProgress.findUnique({ where: { userId_chapterId: { userId, chapterId } } });

    return { chapter,
      course,
      muxData,
      attachments,
      nextChapter,
      userProgress,
      purchase,
      hasChapterAccess,
      chapterQuiz, };
  } catch { return {
      chapter: null,
      course: null,
      muxData: null,
      attachments: null,
      nextChapter: null,
      userProgress: null,
      purchase: null,
      hasChapterAccess: false,
      chapterQuiz: null, };
  }
}
