import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireTeacher } from '@/lib/auth-helpers';

export async function PATCH(req: Request, { params }: { params: { examId: string; questionId: string } }) {
  try {
    await requireTeacher();
    const { text, type, options } = await req.json();

    // Verify ownership through the course
    const examWithCourse = await db.exam.findUnique({
      where: {
        id: params.examId,
      },
      include: {
        course: true,
      },
    });

    if (!examWithCourse) {
      return new NextResponse('Exam not found', { status: 404 });
    }

    // TODO: Add course ownership check when createdById field is available
    // if (examWithCourse.course.createdById !== userId) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    // Don't allow editing questions for published exams
    if (examWithCourse.isPublished) {
      return new NextResponse('Cannot edit questions for published exams', {
        status: 400,
      });
    }

    // Get the existing question to check if it exists and belongs to the exam
    const existingQuestion = await db.question.findFirst({
      where: {
        id: params.questionId,
        examQuestions: {
          some: {
            examId: params.examId,
          },
        },
      },
      include: {
        options: true,
      },
    });

    if (!existingQuestion) {
      return new NextResponse('Question not found', { status: 404 });
    }

    // Update the question
    const updatedQuestion = await db.question.update({
      where: {
        id: params.questionId,
      },
      data: {
        text,
        type,
      },
      include: {
        options: true,
      },
    });

    // Delete all existing options
    await db.option.deleteMany({
      where: {
        questionId: params.questionId,
      },
    });

    // Create new options
    await db.option.createMany({
      data: options.map((option: any) => ({
        text: option.text,
        isCorrect: option.isCorrect,
        questionId: params.questionId,
      })),
    });

    // Fetch the updated question with options
    const refreshedQuestion = await db.question.findUnique({
      where: {
        id: params.questionId,
      },
      include: {
        options: true,
      },
    });

    return NextResponse.json(refreshedQuestion);
  } catch (error) {
    console.error('[QUESTION_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { examId: string; questionId: string } }) {
  try {
    await requireTeacher();

    // Verify ownership through the course
    const examWithCourse = await db.exam.findUnique({
      where: {
        id: params.examId,
      },
      include: {
        course: true,
      },
    });

    if (!examWithCourse) {
      return new NextResponse('Exam not found', { status: 404 });
    }

    // TODO: Add course ownership check when createdById field is available
    // if (examWithCourse.course.createdById !== userId) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    // Don't allow deleting questions for published exams
    if (examWithCourse.isPublished) {
      return new NextResponse('Cannot delete questions for published exams', {
        status: 400,
      });
    }

    // First, remove the ExamQuestion relationship
    await db.examQuestion.deleteMany({
      where: {
        examId: params.examId,
        questionId: params.questionId,
      },
    });

    // Then delete the question and its options (cascade delete will handle options)
    await db.question.delete({
      where: {
        id: params.questionId,
      },
    });

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('[QUESTION_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
