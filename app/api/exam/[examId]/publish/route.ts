import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: { examId: string } }) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Find the exam with its course and questions
    const examWithQuestions = await db.exam.findUnique({
      where: {
        id: params.examId,
      },
      include: {
        course: true,
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!examWithQuestions) {
      return new NextResponse('Exam not found', { status: 404 });
    }

    // Verify ownership through course
    // TODO: Add course ownership check when createdById field is available
    // if (examWithQuestions.course.createdById !== userId) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    // Check if the exam has questions
    if (examWithQuestions.questions.length === 0) {
      return new NextResponse('Cannot publish an exam with no questions', { status: 400 });
    }

    // Verify that each question has at least one correct option
    for (const question of examWithQuestions.questions) {
      const hasCorrectOption = question.options.some((option) => option.isCorrect);

      if (!hasCorrectOption) {
        return new NextResponse(`Question "${question.text}" has no correct option`, { status: 400 });
      }
    }

    // Publish the exam
    const publishedExam = await db.exam.update({
      where: {
        id: params.examId,
      },
      data: {
        isPublished: true,
      },
    });

    return NextResponse.json(publishedExam);
  } catch (error) {
    console.error('[EXAM_PUBLISH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
