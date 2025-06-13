import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireTeacher } from '@/lib/api-auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const user = await requireTeacher();

    const quiz = await db.quiz.findFirst({
      where: {
        chapterId: params.chapterId,
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
        },
      },
    });

    if (!quiz) {
      return new NextResponse('Quiz not found', { status: 404 });
    }

    // Validate quiz has questions
    if (quiz.quizQuestions.length === 0) {
      return new NextResponse('Cannot publish quiz without questions', { status: 400 });
    }

    // Validate all questions have correct answers
    for (const quizQuestion of quiz.quizQuestions) {
      const hasCorrectAnswer = quizQuestion.question.options.some(option => option.isCorrect);
      if (!hasCorrectAnswer) {
        return new NextResponse(
          `Question "${quizQuestion.question.text}" must have at least one correct answer`,
          { status: 400 }
        );
      }
    }

    const updatedQuiz = await db.quiz.update({
      where: {
        id: quiz.id,
      },
      data: {
        isPublished: true,
      },
    });

    return NextResponse.json(updatedQuiz);
  } catch (error) {
    console.error('[QUIZ_PUBLISH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 