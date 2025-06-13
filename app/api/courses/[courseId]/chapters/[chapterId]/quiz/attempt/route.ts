import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string; chapterId: string } }
) { try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get latest quiz attempt for this user
    const attempt = await db.quizAttempt.findFirst({ where: {
        userId: user.id,
        quiz: {
          chapterId: params.chapterId, },
      },
      orderBy: { createdAt: 'desc', },
      include: { quiz: true,
        questionAttempts: {
          include: {
            question: {
              include: {
                options: true, },
            },
            selectedOption: true,
          },
        },
      },
    });

    return NextResponse.json(attempt);
  } catch (error) { console.error('[QUIZ_ATTEMPT_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string; chapterId: string } }
) { try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the quiz for this chapter
    const quiz = await db.quiz.findFirst({ where: {
        chapterId: params.chapterId, },
      include: { quizQuestions: {
          include: {
            question: {
              include: {
                options: true, },
            },
          },
          orderBy: { position: 'asc', },
        },
        attempts: { where: {
            userId: user.id, },
        },
      },
    });

    if (!quiz) { return new NextResponse('Quiz not found', { status: 404 });
    }

    if (!quiz.isPublished) { return new NextResponse('Quiz is not published', { status: 400 });
    }

    // Check if user has attempts remaining
    const userAttempts = quiz.attempts.length;
    if (quiz.freeAttempts !== -1 && userAttempts >= quiz.freeAttempts) { return new NextResponse('No attempts remaining', { status: 400 });
    }

    // Check if user has already passed
    const passedAttempt = quiz.attempts.find(attempt => attempt.isPassed);
    if (passedAttempt) { return new NextResponse('Quiz already passed', { status: 400 });
    }

    // Create new attempt
    const attempt = await db.quizAttempt.create({ data: {
        userId: user.id,
        quizId: quiz.id,
        isFreeAttempt: userAttempts < (quiz.freeAttempts === -1 ? 999999 : quiz.freeAttempts), },
      include: { quiz: {
          include: {
            quizQuestions: {
              include: {
                question: {
                  include: {
                    options: true, },
                },
              },
              orderBy: { position: 'asc', },
            },
          },
        },
      },
    });

    return NextResponse.json(attempt);
  } catch (error) { console.error('[QUIZ_ATTEMPT_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
