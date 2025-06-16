import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

interface SessionTrackingData {
  sessionId: string;
  courseId: string;
  chapterIds: string[];
  startTime: string;
  currentQuestionIndex: number;
  questionsAnswered: number;
  correctAnswers: number;
  totalTimeSpent: number; // in seconds
  questionTimeSpent: number; // in seconds
  mode: 'exam' | 'free';
}

// POST - Start or update session tracking
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const trackingData: SessionTrackingData = await req.json();

    // Validate required fields
    if (!trackingData.sessionId || !trackingData.courseId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Store session tracking data in cache/database
    // For now, we'll return the tracking data with real-time calculations
    const sessionStats = {
      sessionId: trackingData.sessionId,
      userId: user.id,
      courseId: trackingData.courseId,
      chapterIds: trackingData.chapterIds,
      startTime: trackingData.startTime,
      currentQuestionIndex: trackingData.currentQuestionIndex,
      questionsAnswered: trackingData.questionsAnswered,
      correctAnswers: trackingData.correctAnswers,
      totalTimeSpent: trackingData.totalTimeSpent,
      questionTimeSpent: trackingData.questionTimeSpent,
      mode: trackingData.mode,
      
      // Real-time calculations
      accuracy: trackingData.questionsAnswered > 0 
        ? Math.round((trackingData.correctAnswers / trackingData.questionsAnswered) * 100)
        : 0,
      averageTimePerQuestion: trackingData.questionsAnswered > 0
        ? Math.round((trackingData.totalTimeSpent / trackingData.questionsAnswered) * 100) / 100
        : 0,
      sessionDuration: Math.floor(trackingData.totalTimeSpent / 60), // in minutes
      
      // Timestamps
      lastUpdated: new Date().toISOString(),
    };

    console.log(`Session tracking updated for ${trackingData.sessionId}: ${trackingData.questionsAnswered} questions answered`);

    return NextResponse.json(sessionStats);
  } catch (error) {
    console.error('[SESSION_TRACKING_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// GET - Retrieve session tracking data
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const courseId = searchParams.get('courseId');

    if (!sessionId || !courseId) {
      return new NextResponse('Missing sessionId or courseId', { status: 400 });
    }

    // Get real-time practice statistics for the session
    const practiceAttempts = await db.practiceAttempt.findMany({
      where: {
        userId: user.id,
        question: {
          questionBank: {
            courseId: courseId,
          },
        },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      include: {
        question: {
          select: {
            id: true,
            text: true,
            difficulty: true,
            points: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate real-time session statistics
    const sessionStats = {
      sessionId,
      userId: user.id,
      courseId,
      totalAttempts: practiceAttempts.length,
      correctAttempts: practiceAttempts.filter(a => a.isCorrect).length,
      totalTimeSpent: Math.round(practiceAttempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / 60), // in minutes
      totalPointsEarned: practiceAttempts.reduce((sum, a) => sum + (a.pointsEarned || 0), 0),
      
      // Real-time calculations
      accuracy: practiceAttempts.length > 0 
        ? Math.round((practiceAttempts.filter(a => a.isCorrect).length / practiceAttempts.length) * 100)
        : 0,
      averageTimePerQuestion: practiceAttempts.length > 0
        ? Math.round((practiceAttempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / practiceAttempts.length / 60) * 100) / 100
        : 0,
      
      // Recent attempts (last 10)
      recentAttempts: practiceAttempts.slice(0, 10).map(attempt => ({
        questionId: attempt.questionId,
        questionText: attempt.question.text.substring(0, 50) + '...',
        difficulty: attempt.question.difficulty,
        isCorrect: attempt.isCorrect,
        pointsEarned: attempt.pointsEarned,
        timeSpent: Math.round((attempt.timeSpent || 0) / 60 * 100) / 100, // in minutes
        createdAt: attempt.createdAt,
      })),
      
      // Performance by difficulty
      performanceByDifficulty: ['EASY', 'MEDIUM', 'HARD'].map(difficulty => {
        const difficultyAttempts = practiceAttempts.filter(a => a.question.difficulty === difficulty);
        return {
          difficulty,
          attempts: difficultyAttempts.length,
          correctAttempts: difficultyAttempts.filter(a => a.isCorrect).length,
          accuracy: difficultyAttempts.length > 0 
            ? Math.round((difficultyAttempts.filter(a => a.isCorrect).length / difficultyAttempts.length) * 100)
            : 0,
        };
      }),
      
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(sessionStats);
  } catch (error) {
    console.error('[SESSION_TRACKING_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 