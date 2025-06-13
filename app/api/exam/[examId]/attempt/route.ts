import { NextResponse } from 'next/server';
import { startExamAttempt, validateExamAttempt } from '@/actions/exam-actions';
import { canAccessChapterServices, getCurrentUser } from '@/lib/user';
import { db } from '@/lib/db';
import * as z from 'zod';

const startAttemptSchema = z.object({
  examId: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: { examId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'المستخدم غير مسجل الدخول' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const validationResult = startAttemptSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: 'بيانات غير صحيحة',
          errors: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const exam = await db.exam.findUnique({
      where: {
        id: params.examId,
        isPublished: true,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            isPublished: true,
          },
        },
        chapter: {
          select: {
            id: true,
            title: true,
            isPublished: true,
            isFree: true,
          },
        },
        _count: {
          select: {
            examQuestions: true,
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json(
        { message: 'الامتحان غير موجود أو غير منشور' },
        { status: 404 }
      );
    }

    if (!exam.course.isPublished) {
      return NextResponse.json(
        { message: 'الدورة غير منشورة' },
        { status: 403 }
      );
    }

    if (exam._count.examQuestions === 0) {
      return NextResponse.json(
        { message: 'الامتحان لا يحتوي على أسئلة' },
        { status: 400 }
      );
    }

    if (exam.chapterId) {
      const hasAccess = await canAccessChapterServices(user, exam.chapterId);
      if (!hasAccess) {
        return NextResponse.json(
          {
            message: 'ليس لديك صلاحية للوصول إلى هذا الامتحان. يتطلب هذا الامتحان الوصول إلى المحتوى المدفوع.',
            requiresAccess: true,
            chapterTitle: exam.chapter?.title,
          },
          { status: 403 }
        );
      }
    }

    const completedAttempts = await db.examAttempt.count({
      where: {
        userId: user.id,
        examId: params.examId,
        completedAt: { not: null },
      },
    });

    if (completedAttempts >= exam.maxAttempts) {
      return NextResponse.json(
        {
          message: `لقد وصلت إلى الحد الأقصى من المحاولات (${exam.maxAttempts})`,
          maxAttemptsReached: true,
          completedAttempts,
          maxAttempts: exam.maxAttempts,
        },
        { status: 403 }
      );
    }

    const existingAttempt = await db.examAttempt.findFirst({
      where: {
        userId: user.id,
        examId: params.examId,
        completedAt: null,
      },
    });

    if (existingAttempt) {
      const validation = await validateExamAttempt(user.id, existingAttempt.id);

      if (!validation.valid) {
        if (validation.reason === 'Time limit exceeded') {
          return NextResponse.json(
            {
              message: 'انتهت مدة المحاولة السابقة. يمكنك بدء محاولة جديدة.',
              timeExpired: true,
              attemptId: existingAttempt.id,
            },
            { status: 410 }
          );
        } else {
          return NextResponse.json(
            { message: validation.reason },
            { status: 400 }
          );
        }
      }

      return NextResponse.json({
        attempt: existingAttempt,
        isExisting: true,
        message: 'لديك محاولة نشطة بالفعل',
      });
    }

    const examAttempt = await startExamAttempt({
      userId: user.id,
      examId: params.examId,
    });

    return NextResponse.json({
      attempt: examAttempt,
      isExisting: false,
      message: 'تم بدء الامتحان بنجاح',
      exam: {
        title: exam.title,
        timeLimit: exam.timeLimit,
        totalQuestions: exam._count.examQuestions,
        maxAttempts: exam.maxAttempts,
        passingScore: exam.passingScore,
      },
    });

  } catch (error) {
    console.error('[START_EXAM_ATTEMPT_ERROR]', error);

    if (error instanceof Error) {
      if (error.message.includes('Maximum attempts')) {
        return NextResponse.json(
          {
            message: error.message,
            maxAttemptsReached: true,
          },
          { status: 403 }
        );
      }

      if (error.message.includes('not found') || error.message.includes('not published')) {
        return NextResponse.json(
          { message: error.message },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { message: 'حدث خطأ أثناء بدء الامتحان' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request, { params }: { params: { examId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'المستخدم غير مسجل الدخول' },
        { status: 401 }
      );
    }

    const attempts = await db.examAttempt.findMany({
      where: {
        userId: user.id,
        examId: params.examId,
      },
      include: {
        exam: {
          select: {
            title: true,
            timeLimit: true,
            maxAttempts: true,
            passingScore: true,
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    const activeAttempt = attempts.find(attempt => !attempt.completedAt);
    const completedAttempts = attempts.filter(attempt => attempt.completedAt);

    const stats = {
      totalAttempts: attempts.length,
      completedAttempts: completedAttempts.length,
      remainingAttempts: Math.max(0, (attempts[0]?.exam.maxAttempts || 1) - completedAttempts.length),
      bestScore: completedAttempts.length > 0
        ? Math.max(...completedAttempts.map(a => a.score || 0))
        : null,
      averageScore: completedAttempts.length > 0
        ? Math.round(completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length)
        : null,
      hasPassedAttempt: completedAttempts.some(a => a.isPassed),
    };

    return NextResponse.json({
      attempts: completedAttempts.slice(0, 10),
      activeAttempt,
      stats,
      exam: attempts[0]?.exam || null,
    });

  } catch (error) {
    console.error('[GET_EXAM_ATTEMPTS_ERROR]', error);
    return NextResponse.json(
      { message: 'حدث خطأ أثناء جلب المحاولات' },
      { status: 500 }
    );
  }
} 