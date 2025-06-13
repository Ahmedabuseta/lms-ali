import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface AttemptRequest {
  sessionId: string;
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  timeSpent?: number;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { 
      sessionId,
      questionId,
      selectedOptionId,
      isCorrect,
      timeSpent = 0
    }: AttemptRequest = await req.json();

    if (!sessionId || !questionId || !selectedOptionId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Verify question exists
    const question = await db.question.findUnique({
      where: { id: questionId },
      include: {
        options: true,
        questionBank: {
          include: {
            course: true
          }
        }
      }
    });

    if (!question) {
      return new NextResponse('Question not found', { status: 404 });
    }

    // Verify selected option belongs to this question
    const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
    if (!selectedOption) {
      return new NextResponse('Invalid option selected', { status: 400 });
    }

    // Verify correctness matches the option
    const actualIsCorrect = selectedOption.isCorrect;
    if (isCorrect !== actualIsCorrect) {
      return new NextResponse('Correctness mismatch', { status: 400 });
    }

    // Record the practice attempt
    const practiceAttempt = await db.practiceAttempt.create({
      data: {
        userId: user.id,
        questionId: questionId,
        selectedOptionId: selectedOptionId,
        isCorrect: actualIsCorrect,
        score: actualIsCorrect ? (question.points || 1) : 0,
      }
    });

    // Calculate statistics for response
    const totalAttempts = await db.practiceAttempt.count({
      where: {
        userId: user.id,
        questionId: questionId
      }
    });

    const correctAttempts = await db.practiceAttempt.count({
      where: {
        userId: user.id,
        questionId: questionId,
        isCorrect: true
      }
    });

    const result = {
      id: practiceAttempt.id,
      isCorrect: actualIsCorrect,
      score: practiceAttempt.score,
      selectedOption: {
        id: selectedOption.id,
        text: selectedOption.text,
        isCorrect: selectedOption.isCorrect
      },
      correctOption: question.options.find(opt => opt.isCorrect),
      question: {
        id: question.id,
        text: question.text,
        explanation: question.explanation
      },
      stats: {
        totalAttempts,
        correctAttempts,
        accuracy: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0
      },
      sessionId
    };

    console.log(`User ${user.id} attempted question ${questionId}: ${actualIsCorrect ? 'correct' : 'incorrect'}`);

    return NextResponse.json(result);
  } catch (error) {
    console.log('[PRACTICE_ATTEMPT_CREATE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// Get attempt history for a question
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get('questionId');

    if (!questionId) {
      return new NextResponse('Question ID required', { status: 400 });
    }

    const attempts = await db.practiceAttempt.findMany({
      where: {
        userId: user.id,
        questionId: questionId
      },
      include: {
        selectedOption: true,
        question: {
          include: {
            options: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const stats = {
      totalAttempts: attempts.length,
      correctAttempts: attempts.filter(a => a.isCorrect).length,
      lastAttempt: attempts[0] || null,
      accuracy: attempts.length > 0 ? Math.round((attempts.filter(a => a.isCorrect).length / attempts.length) * 100) : 0
    };

    return NextResponse.json({
      attempts,
      stats
    });
  } catch (error) {
    console.log('[PRACTICE_ATTEMPT_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 