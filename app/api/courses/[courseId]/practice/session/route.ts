import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) { try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { chapterIds, questionCount = 10, mode = 'free' } = await req.json();

    if (!chapterIds || !Array.isArray(chapterIds) || chapterIds.length === 0) { return new NextResponse('Chapter IDs are required', { status: 400 });
    }

    // Validate chapters belong to the course
    const chapters = await db.chapter.findMany({ where: {
        id: { in: chapterIds },
        courseId: params.courseId,
        isPublished: true,
      },
    });

    if (chapters.length !== chapterIds.length) { return new NextResponse('Invalid chapter selection', { status: 400 });
    }

    // Get questions from selected chapters' question banks
    const questions = await db.question.findMany({ where: {
        questionBank: {
          chapterId: { in: chapterIds },
          courseId: params.courseId,
        },
      },
      include: { options: true,
        questionBank: {
          select: {
            title: true,
            chapterId: true, },
        },
      },
      take: mode === 'exam' ? 20 : questionCount,
      orderBy: { createdAt: 'desc', // You can randomize this later },
    });

    if (questions.length === 0) { return new NextResponse('No questions found for selected chapters', { status: 404 });
    }

    // Get user's previous attempts for these questions
    const previousAttempts = await db.practiceAttempt.findMany({ where: {
        userId: user.id,
        questionId: { in: questions.map(q => q.id) },
      },
      include: { selectedOption: true, },
    });

    // Add attempt history to questions
    const questionsWithHistory = questions.map(question => { const attempts = previousAttempts.filter(attempt => attempt.questionId === question.id);
      const lastAttempt = attempts.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      return {
        ...question,
        attemptCount: attempts.length,
        lastAttempt: lastAttempt ? {
          selectedOptionId: lastAttempt.selectedOptionId,
          isCorrect: lastAttempt.isCorrect,
          createdAt: lastAttempt.createdAt, } : null,
      };
    });

    return NextResponse.json({ sessionId: `practice_${mode }_${Date.now()}_${user.id}`,
      courseId: params.courseId,
      mode: mode,
      selectedChapters: chapters.map(c => ({ id: c.id, title: c.title })),
      questions: questionsWithHistory,
      totalQuestions: questionsWithHistory.length,
      timeLimit: mode === 'exam' ? 45 : null, // 45 minutes for exam mode
    });
  } catch (error) { console.error('[PRACTICE_SESSION_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
