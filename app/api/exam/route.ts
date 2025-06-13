import { NextResponse } from 'next/server';
import { requireTeacher } from '@/lib/api-auth';
import { db } from '@/lib/db';
import * as z from 'zod';

// Validation schema for exam creation
const createExamSchema = z.object({
  title: z
    .string()
    .min(1, 'العنوان مطلوب')
    .max(100, 'العنوان يجب أن يكون أقل من 100 حرف'),
  description: z
    .string()
    .max(500, 'الوصف يجب أن يكون أقل من 500 حرف')
    .optional(),
  courseId: z.string().min(1, 'معرف الدورة مطلوب'),
  chapterId: z.string().optional(),
  timeLimit: z
    .number()
    .int()
    .min(1, 'الحد الأدنى دقيقة واحدة')
    .max(300, 'الحد الأقصى 300 دقيقة')
    .optional(),
  isPublished: z.boolean().default(false),
});

export async function POST(req: Request) {
  try {
    const user = await requireTeacher();

    const body = await req.json();

    // Validate request body
    const validationResult = createExamSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: 'بيانات غير صحيحة',
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { title, description, courseId, chapterId, timeLimit, isPublished } = validationResult.data;

    // Verify that the course exists and belongs to the teacher
    const course = await db.course.findFirst({
      where: {
        id: courseId,
        // Add ownership verification here if needed
      },
    });

    if (!course) {
      return NextResponse.json(
        { message: 'الدورة غير موجودة أو لا يمكن الوصول إليها' },
        { status: 404 }
      );
    }

    // If chapterId is provided, verify it belongs to the course
    if (chapterId) {
      const chapter = await db.chapter.findFirst({
        where: {
          id: chapterId,
          courseId: courseId,
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

    // Create the exam
    const exam = await db.exam.create({
      data: {
        title,
        description: description || null,
        courseId,
        chapterId: chapterId || null,
        timeLimit: timeLimit || null,
        isPublished: isPublished || false,
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
      },
    });

    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    console.error('[EXAM_POST]', error);

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
