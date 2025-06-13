import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireTeacher } from '@/lib/api-auth';
import * as z from 'zod';

// Validation schemas
const updateExamSchema = z.object({
  title: z
    .string()
    .min(1, 'العنوان مطلوب')
    .max(100, 'العنوان يجب أن يكون أقل من 100 حرف')
    .optional(),
  description: z
    .string()
    .max(500, 'الوصف يجب أن يكون أقل من 500 حرف')
    .optional(),
  chapterId: z.string().optional(),
  timeLimit: z
    .number()
    .int()
    .min(1, 'الحد الأدنى دقيقة واحدة')
    .max(300, 'الحد الأقصى 300 دقيقة')
    .optional(),
  maxAttempts: z.number().int().min(1, 'الحد الأدنى محاولة واحدة').max(10, 'الحد الأقصى 10 محاولات').optional(),
  passingScore: z.number().int().min(0, 'النتيجة لا يمكن أن تكون سالبة').max(100, 'النتيجة لا يمكن أن تزيد عن 100').optional(),
  isRandomized: z.boolean().optional(),
  showResults: z.boolean().optional(),
  allowReview: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export async function GET(req: Request, { params }: { params: { examId: string } }) {
  try {
    const userId = await requireAuth();

    // Get exam with questions and user attempts
    const exam = await db.exam.findUnique({
      where: {
        id: params.examId,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            createdById: true,
          },
        },
        chapter: {
          select: {
            id: true,
            title: true,
          },
        },
        examQuestions: {
          select: {
            id: true,
            question: true,
            type: true,
            options: true,
            position: true,
          },
          orderBy: { position: 'asc' },
        },
        _count: {
          select: {
            examQuestions: true,
            attempts: true,
          },
        },
      },
    });

    if (!exam) {
      return new NextResponse('Exam not found', { status: 404 });
    }

    // Check if user has access to this exam
    if (!exam.isPublished && !exam.course.createdById) {
      // For now, allow access if exam is published or if it's a teacher
      // TODO: Add proper ownership check when createdById is available
    }

    // Get user's attempts for this exam
    const userAttempts = await db.examAttempt.findMany({
      where: {
        userId,
        examId: params.examId,
      },
      orderBy: { startedAt: 'desc' },
      take: 5, // Last 5 attempts
    });

    // Get active attempt
    const activeAttempt = userAttempts.find(attempt => !attempt.completedAt);

    return NextResponse.json({
      exam,
      userAttempts,
      activeAttempt,
    });
  } catch (error) {
    console.error('[EXAM_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { examId: string } }) {
  try {
    await requireTeacher();

    const body = await req.json();

    // Validate request body
    const validationResult = updateExamSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: 'بيانات غير صحيحة',
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Verify exam exists and get current state
    const existingExam = await db.exam.findUnique({
      where: {
        id: params.examId,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            attempts: {
              where: {
                completedAt: null, // Active attempts
              },
            },
          },
        },
      },
    });

    if (!existingExam) {
      return NextResponse.json(
        { message: 'الامتحان غير موجود' },
        { status: 404 }
      );
    }

    // Don't allow certain changes if there are active attempts
    if (existingExam._count.attempts > 0) {
      const restrictedFields = ['timeLimit', 'maxAttempts'];
      const hasRestrictedChanges = restrictedFields.some(field =>
        validatedData[field as keyof typeof validatedData] !== undefined
      );

      if (hasRestrictedChanges) {
        return NextResponse.json(
          { message: 'لا يمكن تعديل هذه الإعدادات أثناء وجود محاولات نشطة' },
          { status: 400 }
        );
      }
    }

    // If chapterId is provided, verify it belongs to the course
    if (validatedData.chapterId) {
      const chapter = await db.chapter.findFirst({
        where: {
          id: validatedData.chapterId,
          courseId: existingExam.course.id,
          isPublished: true,
        },
      });

      if (!chapter) {
        return NextResponse.json(
          { message: 'الفصل غير موجود أو غير منشور' },
          { status: 404 }
        );
      }
    }

    // Update the exam
    const updatedExam = await db.exam.update({
      where: {
        id: params.examId,
      },
      data: {
        ...validatedData,
        chapterId: validatedData.chapterId || null,
        timeLimit: validatedData.timeLimit || null,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        chapter: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            examQuestions: true,
          },
        },
      },
    });

    return NextResponse.json(updatedExam);
  } catch (error) {
    console.error('[EXAM_PATCH]', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: 'بيانات غير صحيحة',
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'حدث خطأ داخلي في الخادم' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { examId: string } }) {
  try {
    await requireTeacher();

    // Verify exam exists and get related data
    const examWithRelations = await db.exam.findUnique({
      where: {
        id: params.examId,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            attempts: true,
          },
        },
      },
    });

    if (!examWithRelations) {
      return NextResponse.json(
        { message: 'الامتحان غير موجود' },
        { status: 404 }
      );
    }

    // Don't allow deletion if there are any attempts
    if (examWithRelations._count.attempts > 0) {
      return NextResponse.json(
        { message: 'لا يمكن حذف امتحان يحتوي على محاولات' },
        { status: 400 }
      );
    }

    // Delete the exam (cascade will handle related records)
    await db.exam.delete({
      where: {
        id: params.examId,
      },
    });

    return NextResponse.json({
      message: 'تم حذف الامتحان بنجاح',
      examId: params.examId,
    });
  } catch (error) {
    console.error('[EXAM_DELETE]', error);
    return NextResponse.json(
      { message: 'حدث خطأ أثناء حذف الامتحان' },
      { status: 500 }
    );
  }
} 