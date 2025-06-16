import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { canAccessChapterServices } from '@/lib/user';

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { selectedChapters, questionCount = 10, mode = 'free' } = await req.json();

    // Accept both selectedChapters and chapterIds for backward compatibility
    const chapterIds = selectedChapters || [];

    if (!chapterIds || chapterIds.length === 0) {
      return new NextResponse('At least one chapter must be selected', { status: 400 });
    }

    // Verify course exists and is published
    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (!course) {
      return new NextResponse('Course not found', { status: 404 });
    }

    // Check chapter access for each selected chapter
    for (const chapterId of chapterIds) {
      const hasAccess = await canAccessChapterServices(user, chapterId);
      if (!hasAccess) {
        return new NextResponse(`Access denied for chapter ${chapterId}`, { status: 403 });
      }
    }

    // Get chapters with their titles
    const selectedChapterObjects = await db.chapter.findMany({
      where: {
        id: { in: chapterIds },
        courseId: params.courseId,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (selectedChapterObjects.length !== chapterIds.length) {
      return new NextResponse('Some chapters not found or not accessible', { status: 404 });
    }

    // Get questions from selected chapters with attempt history
    const questions = await db.question.findMany({
      where: {
        questionBank: {
          chapterId: { in: chapterIds },
          courseId: params.courseId,
          isActive: true,
        },
        isActive: true,
      },
      include: {
        options: {
          select: {
            id: true,
            text: true,
            isCorrect: true,
            explanation: true,
          },
        },
        questionBank: {
          select: {
            title: true,
            chapterId: true,
          },
        },
        passage: {
          select: {
            id: true,
            title: true,
            content: true,
          },
        },
        practiceAttempts: {
          where: {
            userId: user.id,
          },
          select: {
            id: true,
            selectedOptionId: true,
            isCorrect: true,
            pointsEarned: true,
            timeSpent: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Get only the latest attempt
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (questions.length === 0) {
      return new NextResponse('No questions found for selected chapters', { status: 404 });
    }

    // Shuffle and limit questions
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
    const limitedQuestions = mode === 'exam' 
      ? shuffledQuestions.slice(0, 20) // Fixed 20 for exam mode
      : shuffledQuestions.slice(0, questionCount);

    // Generate session ID
    const sessionId = `practice_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    // Transform questions for response with attempt history
    const transformedQuestions = limitedQuestions.map(question => {
      const attemptCount = question.practiceAttempts.length;
      const lastAttempt = question.practiceAttempts[0] || null;

      return {
      id: question.id,
      text: question.text,
      type: question.type,
      difficulty: question.difficulty,
        points: question.points || 1,
      explanation: question.explanation,
      passage: question.passage,
      options: question.options,
      questionBank: {
        title: question.questionBank.title || 'Unknown',
        chapterId: question.questionBank.chapterId,
      },
        attemptCount,
        lastAttempt: lastAttempt ? {
          selectedOptionId: lastAttempt.selectedOptionId,
          isCorrect: lastAttempt.isCorrect,
          pointsEarned: lastAttempt.pointsEarned,
          timeSpent: lastAttempt.timeSpent,
          createdAt: lastAttempt.createdAt.toISOString(),
        } : null,
      };
    });

    const sessionData = {
      sessionId,
      courseId: params.courseId,
      selectedChapters: selectedChapterObjects,
      questions: transformedQuestions,
      totalQuestions: transformedQuestions.length,
      mode,
      settings: {
        questionCount: mode === 'exam' ? 20 : questionCount,
        timeLimit: mode === 'exam' ? 45 : null, // 45 minutes for exam mode
      },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };

    console.log(`Created practice session ${sessionId} for course ${params.courseId} with ${transformedQuestions.length} questions`);

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error('[PRACTICE_SESSION_CREATE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// GET route for retrieving practice statistics
export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const chapterIds = searchParams.get('chapterIds')?.split(',') || [];

    // Verify course exists
    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (!course) {
      return new NextResponse('Course not found', { status: 404 });
    }

    // Get comprehensive practice statistics
    const practiceAttempts = await db.practiceAttempt.findMany({
      where: {
        userId: user.id,
        question: {
          questionBank: {
            courseId: params.courseId,
            ...(chapterIds.length > 0 && { chapterId: { in: chapterIds } }),
          },
        },
      },
      include: {
        question: {
          include: {
            questionBank: {
              select: {
                chapterId: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate time-based statistics
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentAttempts = practiceAttempts.filter(attempt => 
      new Date(attempt.createdAt) >= oneWeekAgo
    );

    const monthlyAttempts = practiceAttempts.filter(attempt => 
      new Date(attempt.createdAt) >= oneMonthAgo
    );

    // Calculate total time spent (in minutes)
    const totalTimeSpent = practiceAttempts.reduce(
      (sum, attempt) => sum + (attempt.timeSpent || 0), 
      0
    ) / 60;

    // Calculate practice sessions (group by date)
    const practiceSessionsByDate = practiceAttempts.reduce((acc, attempt) => {
      const date = new Date(attempt.createdAt).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(attempt);
      return acc;
    }, {} as Record<string, typeof practiceAttempts>);

    const totalPracticeSessions = Object.keys(practiceSessionsByDate).length;

    // Calculate streak
    const sortedDates = Object.keys(practiceSessionsByDate).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
    
    let currentStreak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    if (sortedDates.includes(today) || sortedDates.includes(yesterday)) {
      let checkDate = new Date();
      if (!sortedDates.includes(today)) {
        checkDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      }
      
      while (sortedDates.includes(checkDate.toDateString())) {
        currentStreak++;
        checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
      }
    }

    // Calculate overall statistics
    const totalAttempts = practiceAttempts.length;
    const totalCorrectAttempts = practiceAttempts.filter(attempt => attempt.isCorrect).length;
    const overallAverageScore = totalAttempts > 0 
      ? (totalCorrectAttempts / totalAttempts) * 100 
      : 0;

    const statistics = {
      totalAttempts,
      correctAttempts: totalCorrectAttempts,
      averageScore: Math.round(overallAverageScore),
      totalPointsEarned: practiceAttempts.reduce((sum, attempt) => sum + (attempt.pointsEarned || 0), 0),
      uniqueQuestionsAttempted: new Set(practiceAttempts.map(attempt => attempt.questionId)).size,
      totalTimeSpent: Math.round(totalTimeSpent),
      averageTimePerQuestion: totalAttempts > 0 ? Math.round((totalTimeSpent / totalAttempts) * 100) / 100 : 0,
      totalPracticeSessions,
      recentAttempts: recentAttempts.length,
      monthlyAttempts: monthlyAttempts.length,
      currentStreak,
      lastPracticeDate: practiceAttempts.length > 0 ? practiceAttempts[0].createdAt : null,
    };

    return NextResponse.json({
      courseId: params.courseId,
      statistics,
      sessionId,
    });
  } catch (error) {
    console.error('[PRACTICE_STATISTICS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 