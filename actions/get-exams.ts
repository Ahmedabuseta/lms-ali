import { db } from '@/lib/db';

interface GetExamsProps {
  userId: string;
  courseId?: string;
  chapterId?: string;
  examId?: string;
}

export async function getExams({ userId, courseId, chapterId, examId }: GetExamsProps) {
  try {
    // If examId is provided, get a single exam with its questions and options
    if (examId) {
      const exam = await db.exam.findUnique({
        where: {
          id: examId,
          isPublished: true,
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
          questions: {
            include: {
              options: true,
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      if (!exam) {
        return null;
      }

      // // Check if the user has purchased the course
      // const purchase = await db.purchase.findUnique({
      //   where: {
      //     userId_courseId: {
      //       userId,
      //       courseId: exam.courseId,
      //     },
      //   },
      // });

      // if (!purchase) {
      //   return null;
      // }

      // Check if the user has an active attempt
      const activeAttempt = await db.examAttempt.findFirst({
        where: {
          userId,
          examId: exam.id,
          completedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Get the user's past attempts
      const pastAttempts = await db.examAttempt.findMany({
        where: {
          userId,
          examId: exam.id,
          completedAt: {
            not: null,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return { exam, activeAttempt, pastAttempts };
    }

    // Create base query
    const where: any = {
      isPublished: true,
    };

    // Add filters
    if (courseId) {
      where.courseId = courseId;
    }

    if (chapterId) {
      where.chapterId = chapterId;
    }

    // If courseId is specified, verify the user has purchased the course
    // if (courseId) {
    // const purchase = await db.purchase.findUnique({
    //   where: {
    //     userId_courseId: {
    //       userId,
    //       courseId,
    //     },
    //   },
    // });

    // if (!purchase) {
    //   return { exams: [] };
    // }
    // }

    // Get all courses purchased by the user if no courseId filter
    // if (!courseId) {
    //   const purchases = await db.purchase.findMany({
    //     where: {
    //       userId,
    //     },
    //     select: {
    //       courseId: true,
    //     },
    //   });

    //   const courseIds = purchases.map(purchase => purchase.courseId);

    //   if (courseIds.length > 0) {
    //     where.courseId = {
    //       in: courseIds,
    //     };
    //   } else {
    //     return { exams: [] };
    //   }
    // }

    // Get the exams
    const exams = await db.exam.findMany({
      where,
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
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { exams };
  } catch (error) {
    console.error('[GET_EXAMS_ERROR]', error);
    return { exams: [] };
  }
}
