import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { questionId, selectedOptionId } = await req.json();

    if (!questionId || !selectedOptionId) {
      return new NextResponse('Question ID and selected option ID are required', { status: 400 });
    }

    // Validate question belongs to the course
    const question = await db.question.findFirst({
      where: {
        id: questionId,
        questionBank: {
          courseId: params.courseId,
        },
      },
      include: {
        options: true,
        questionBank: {
          select: {
            title: true,
            chapterId: true,
          },
        },
      },
    });

    if (!question) {
      return new NextResponse('Question not found', { status: 404 });
    }

    // Validate selected option belongs to this question
    const selectedOption = question.options.find(option => option.id === selectedOptionId);
    if (!selectedOption) {
      return new NextResponse('Invalid option selected', { status: 400 });
    }

    const correctOption = question.options.find(option => option.isCorrect);
    const isCorrect = selectedOption.isCorrect;

    // Create practice attempt
    const practiceAttempt = await db.practiceAttempt.create({
      data: {
        userId: user.id,
        questionId,
        selectedOptionId,
        isCorrect,
        score: isCorrect ? question.points : 0,
      },
    });

    // Get user's total attempts for this question
    const totalAttempts = await db.practiceAttempt.count({
      where: {
        userId: user.id,
        questionId,
      },
    });

    // Get user's correct attempts for this question
    const correctAttempts = await db.practiceAttempt.count({
      where: {
        userId: user.id,
        questionId,
        isCorrect: true,
      },
    });

    return NextResponse.json({
      isCorrect,
      correctOption: {
        id: correctOption?.id,
        text: correctOption?.text,
      },
      selectedOption: {
        id: selectedOption.id,
        text: selectedOption.text,
      },
      explanation: question.explanation,
      stats: {
        totalAttempts,
        correctAttempts,
        accuracy: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
      },
      attempt: {
        id: practiceAttempt.id,
        createdAt: practiceAttempt.createdAt,
      },
    });
  } catch (error) {
    console.error('[PRACTICE_ANSWER_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 