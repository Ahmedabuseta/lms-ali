import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { attemptId, answers } = await req.json();

    if (!attemptId || !answers || !Array.isArray(answers)) {
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
              orderBy: {
                position: 'asc',
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      return new NextResponse('Quiz attempt not found', { status: 404 });
    }

    if (attempt.userId !== user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (attempt.completedAt) {
      return new NextResponse('Quiz already submitted', { status: 400 });
    }

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

      if (!quizQuestion) continue;

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

      // Create question attempt record
      const questionAttempt = await db.quizQuestionAttempt.create({
        data: {
          quizAttemptId: attempt.id,
          questionId: question.id,
          selectedOptionId: selectedOption?.id || null,
          isCorrect,
          points: isCorrect ? question.points : 0,
        },
      });

      questionAttempts.push(questionAttempt);
    }

    // Calculate score percentage
    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const isPassed = score >= attempt.quiz.requiredScore;

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
    console.error('[QUIZ_SUBMIT]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 