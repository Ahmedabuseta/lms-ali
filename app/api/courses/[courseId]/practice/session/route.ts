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

    const { chapterIds, questionCount = 10, mode = 'free' } = await req.json();

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
    const selectedChapters = await db.chapter.findMany({
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

    if (selectedChapters.length !== chapterIds.length) {
      return new NextResponse('Some chapters not found or not accessible', { status: 404 });
    }

    // Get questions from selected chapters
    const questions = await db.question.findMany({
      where: {
        questionBank: {
          chapterId: { in: chapterIds },
          courseId: params.courseId,
        },
      },
      include: {
        options: {
          select: {
            id: true,
            text: true,
            isCorrect: true,
          },
        },
        questionBank: {
          select: {
            title: true,
            chapterId: true,
          },
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

    // Transform questions for response
    const transformedQuestions = limitedQuestions.map(question => ({
      id: question.id,
      text: question.text,
      type: question.type,
      difficulty: question.difficulty,
      points: question.points,
      explanation: question.explanation,
      passage: question.passage,
      options: question.options,
      questionBank: {
        title: question.questionBank.title || 'Unknown',
        chapterId: question.questionBank.chapterId,
      },
    }));

    const sessionData = {
      sessionId,
      courseId: params.courseId,
      selectedChapters,
      questions: transformedQuestions,
      totalQuestions: transformedQuestions.length,
      mode,
      settings: {
        questionCount: mode === 'exam' ? 20 : questionCount,
        timeLimit: mode === 'exam' ? 45 : null, // 45 minutes for exam mode
      },
      createdAt: new Date().toISOString(),
    };

    console.log(`Created practice session ${sessionId} for course ${params.courseId} with ${transformedQuestions.length} questions`);

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error('[PRACTICE_SESSION_CREATE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 