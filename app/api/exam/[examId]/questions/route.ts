import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request, { params }: { params: { examId: string } }) {
  try {
    const { userId } = auth();
    const { text, type, options } = await req.json();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify ownership through the course
    const examWithCourse = await db.exam.findUnique({
      where: {
        id: params.examId,
      },
      include: {
        course: true,
        questions: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!examWithCourse) {
      return new NextResponse('Exam not found', { status: 404 });
    }

    /*if (examWithCourse.course.createdById !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }*/

    // Don't allow adding questions to published exams
    if (examWithCourse.isPublished) {
      return new NextResponse('Cannot add questions to published exams', {
        status: 400,
      });
    }

    // Create a new question with its options
    const newQuestion = await db.question.create({
      data: {
        text,
        type,
        examId: params.examId,
        options: {
          createMany: {
            data: options.map((option: any) => ({
              text: option.text,
              isCorrect: option.isCorrect,
            })),
          },
        },
      },
      include: {
        options: true,
      },
    });

    return NextResponse.json(newQuestion);
  } catch (error) {
    console.error('[QUESTIONS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
