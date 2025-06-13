import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireTeacher } from '@/lib/api-auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { courseId: string; chapterId: string; questionId: string } }
) { try {
    const user = await requireTeacher();
    const { text, type, difficulty, points, explanation, options } = await req.json();

    // Get the quiz for this chapter
    const quiz = await db.quiz.findFirst({ where: {
        chapterId: params.chapterId, },
    });

    if (!quiz) { return new NextResponse('Quiz not found', { status: 404 });
    }

    // Check if quiz is published (can't edit published quiz questions)
    if (quiz.isPublished) { return new NextResponse('Cannot edit questions in published quiz', { status: 400 });
    }

    // Find the quiz question association
    const quizQuestion = await db.quizQuestion.findFirst({ where: {
        quizId: quiz.id,
        questionId: params.questionId, },
    });

    if (!quizQuestion) { return new NextResponse('Question not found in quiz', { status: 404 });
    }

    // Update the question
    const updatedQuestion = await db.question.update({ where: {
        id: params.questionId, },
      data: { text,
        type,
        difficulty: difficulty || 'MEDIUM',
        points: points || 1,
        explanation, },
    });

    // Delete existing options
    await db.option.deleteMany({ where: {
        questionId: params.questionId, },
    });

    // Create new options
    await db.option.createMany({ data: options.map((option: any) => ({
        text: option.text,
        isCorrect: option.isCorrect,
        questionId: params.questionId, })),
    });

    // Get the updated question with options
    const questionWithOptions = await db.question.findUnique({ where: {
        id: params.questionId, },
      include: { options: true, },
    });

    return NextResponse.json(questionWithOptions);
  } catch (error) { console.error('[QUIZ_QUESTION_UPDATE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { courseId: string; chapterId: string; questionId: string } }
) { try {
    const user = await requireTeacher();

    // Get the quiz for this chapter
    const quiz = await db.quiz.findFirst({
      where: {
        chapterId: params.chapterId, },
    });

    if (!quiz) { return new NextResponse('Quiz not found', { status: 404 });
    }

    // Find the quiz question association
    const quizQuestion = await db.quizQuestion.findFirst({ where: {
        quizId: quiz.id,
        questionId: params.questionId, },
    });

    if (!quizQuestion) { return new NextResponse('Question not found in quiz', { status: 404 });
    }

    // Remove question from quiz
    await db.quizQuestion.delete({ where: {
        id: quizQuestion.id, },
    });

    // Delete the question from question bank (this will cascade delete options)
    await db.question.delete({ where: {
        id: params.questionId, },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) { console.error('[QUIZ_QUESTION_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
