import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string; chapterId: string } }
) { 
  let user = null;
  try {
    user = await getAuthenticatedUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    console.log('[QUIZ_SUBMIT] Request body:', body);
    
    const { attemptId, answers } = body;

    if (!attemptId || !answers || !Array.isArray(answers)) {
      console.log('[QUIZ_SUBMIT] Invalid submission data:', { attemptId, answers });
      return new NextResponse('Invalid submission data', { status: 400 });
    }

    // Get the quiz attempt
    const attempt = await db.quizAttempt.findUnique({
      where: {
        id: attemptId,
      },
      include: {
        quiz: {
          include: {
            quizQuestions: {
              include: {
                question: {
                  include: {
                    options: true,
                  },
                },
              },
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    });

    if (!attempt) {
      console.log('[QUIZ_SUBMIT] Quiz attempt not found:', attemptId);
      return new NextResponse('Quiz attempt not found', { status: 404 });
    }

    if (attempt.userId !== user.id) {
      console.log('[QUIZ_SUBMIT] Unauthorized access:', { attemptUserId: attempt.userId, currentUserId: user.id });
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (attempt.completedAt) {
      console.log('[QUIZ_SUBMIT] Quiz already submitted:', attempt.completedAt);
      return new NextResponse('Quiz already submitted', { status: 400 });
    }

    console.log('[QUIZ_SUBMIT] Processing answers for quiz:', attempt.quiz.id);

    // Process answers and calculate score
    let totalQuestions = 0;
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    const questionAttempts = [];

    for (const answer of answers) {
      const { questionId, selectedOptionId } = answer;

      const quizQuestion = attempt.quiz.quizQuestions.find(
        qq => qq.questionId === questionId
      );

      if (!quizQuestion) {
        console.log('[QUIZ_SUBMIT] Quiz question not found:', questionId);
        continue;
      }

      const question = quizQuestion.question;
      const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
      const correctOption = question.options.find(opt => opt.isCorrect);

      const isCorrect = selectedOption?.isCorrect || false;

      totalQuestions++;
      totalPoints += question.points;

      if (isCorrect) {
        correctAnswers++;
        earnedPoints += question.points;
      }

      console.log('[QUIZ_SUBMIT] Processing question:', {
        questionId,
        selectedOptionId,
        isCorrect,
        points: question.points
      });

      // Create question attempt record
      const questionAttempt = await db.quizQuestionAttempt.create({
        data: {
          quizAttemptId: attempt.id,
          questionId: question.id,
          selectedOptionId: selectedOption?.id || null,
          isCorrect,
          pointsEarned: isCorrect ? question.points : 0,
        },
      });

      questionAttempts.push(questionAttempt);
    }

    // Calculate score percentage
    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const isPassed = score >= attempt.quiz.requiredScore;

    console.log('[QUIZ_SUBMIT] Score calculation:', {
      totalQuestions,
      correctAnswers,
      totalPoints,
      earnedPoints,
      score,
      requiredScore: attempt.quiz.requiredScore,
      isPassed
    });

    // Update the quiz attempt
    const updatedAttempt = await db.quizAttempt.update({
      where: {
        id: attempt.id,
      },
      data: {
        completedAt: new Date(),
        score,
        isPassed,
      },
      include: {
        quiz: true,
        questionAttempts: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
            selectedOption: true,
          },
        },
      },
    });

    // If quiz is passed, update chapter progress
    if (isPassed) {
      console.log('[QUIZ_SUBMIT] Updating chapter progress for passed quiz');
      await db.userProgress.upsert({
        where: {
          userId_chapterId: {
            userId: user.id,
            chapterId: params.chapterId,
          },
        },
        update: {
          isCompleted: true,
        },
        create: {
          userId: user.id,
          chapterId: params.chapterId,
          isCompleted: true,
        },
      });
    }

    console.log('[QUIZ_SUBMIT] Quiz submission successful');

    return NextResponse.json({
      attempt: updatedAttempt,
      score,
      isPassed,
      correctAnswers,
      totalQuestions,
      earnedPoints,
      totalPoints,
    });
  } catch (error) { 
    console.error('[QUIZ_SUBMIT] Error details:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : String(error),
      params,
      userId: user?.id
    });
    return new NextResponse('Internal Error', { status: 500 });
  }
}
