import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

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
    const timeframe = searchParams.get('timeframe') || 'all';
    const chapterIds = searchParams.get('chapterIds')?.split(',').filter(Boolean) || [];

    // Verify course exists
    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        isPublished: true,
      },
      include: {
        chapters: {
          where: {
            isPublished: true,
          },
          include: {
            questionBanks: {
              where: {
                isActive: true,
              },
              include: {
                _count: {
                  select: {
                    questions: true,
                  },
                },
              },
            },
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    if (!course) {
      return new NextResponse('Course not found', { status: 404 });
    }

    // Calculate time filters
    const now = new Date();
    let timeFilter: Date | undefined;
    
    switch (timeframe) {
      case 'week':
        timeFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        timeFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        timeFilter = undefined;
    }

    // Get comprehensive practice attempts
    const practiceAttempts = await db.practiceAttempt.findMany({
      where: {
        userId: user.id,
        question: {
          questionBank: {
            courseId: params.courseId,
            ...(chapterIds.length > 0 && { chapterId: { in: chapterIds } }),
          },
        },
        ...(timeFilter && { createdAt: { gte: timeFilter } }),
      },
      include: {
        question: {
          include: {
            questionBank: {
              select: {
                id: true,
                title: true,
                chapterId: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate comprehensive analytics
    const totalAttempts = practiceAttempts.length;
    const correctAttempts = practiceAttempts.filter(a => a.isCorrect).length;
    const totalTimeSpent = practiceAttempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / 60;

    const analytics = {
      totalAttempts,
      correctAttempts,
      averageScore: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
      totalPointsEarned: practiceAttempts.reduce((sum, a) => sum + (a.pointsEarned || 0), 0),
      totalTimeSpent: Math.round(totalTimeSpent),
      averageTimePerQuestion: totalAttempts > 0 ? Math.round((totalTimeSpent / totalAttempts) * 100) / 100 : 0,
      uniqueQuestionsAttempted: new Set(practiceAttempts.map(a => a.questionId)).size,
      
      chapterAnalytics: course.chapters.map(chapter => {
        const chapterAttempts = practiceAttempts.filter(a => 
          a.question.questionBank.chapterId === chapter.id
        );
        
        const totalQuestions = chapter.questionBanks.reduce((sum, qb) => sum + qb._count.questions, 0);
        const uniqueQuestionsAttempted = new Set(chapterAttempts.map(a => a.questionId)).size;
        const correctAttempts = chapterAttempts.filter(a => a.isCorrect).length;
        const timeSpent = Math.round(chapterAttempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / 60);
        
        return {
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          totalQuestions,
          totalAttempts: chapterAttempts.length,
          uniqueQuestionsAttempted,
          correctAttempts,
          averageScore: chapterAttempts.length > 0 ? Math.round((correctAttempts / chapterAttempts.length) * 100) : 0,
          completionPercentage: totalQuestions > 0 ? Math.round((uniqueQuestionsAttempted / totalQuestions) * 100) : 0,
          timeSpent,
          pointsEarned: chapterAttempts.reduce((sum, a) => sum + (a.pointsEarned || 0), 0),
        };
      }),
      
      lastUpdated: new Date().toISOString(),
      courseId: params.courseId,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('[PRACTICE_ANALYTICS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 