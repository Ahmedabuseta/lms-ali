import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) { try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get course with chapters and their question banks
    const course = await db.course.findUnique({ where: {
        id: params.courseId,
        isPublished: true, },
      include: { chapters: {
          where: {
            isPublished: true, },
          include: { questionBanks: {
              include: {
                _count: {
                  select: {
                    questions: true, },
                },
              },
            },
          },
          orderBy: { position: 'asc', },
        },
      },
    });

    if (!course) { return new NextResponse('Course not found', { status: 404 });
    }

    // Get user's practice stats for each chapter
    const practiceStats = await db.practiceAttempt.groupBy({ by: ['questionId'],
      where: {
        userId: user.id,
        question: {
          questionBank: {
            courseId: params.courseId, },
        },
      },
      _count: { questionId: true, },
    });

    // Format response with practice availability
    const chaptersWithPractice = course.chapters.map(chapter => { const totalQuestions = chapter.questionBanks.reduce(
        (sum, qb) => sum + qb._count.questions,
        0
      );

      // Set practice attempts to 0 for now (can be calculated properly later if needed)
      const practiceAttempts = 0;

      return {
        id: chapter.id,
        title: chapter.title,
        description: chapter.description,
        position: chapter.position,
        totalQuestions,
        practiceAttempts,
        hasPractice: totalQuestions > 0, };
    });

    return NextResponse.json({ course: {
        id: course.id,
        title: course.title,
        description: course.description, },
      chapters: chaptersWithPractice,
    });
  } catch (error) { console.error('[PRACTICE_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
