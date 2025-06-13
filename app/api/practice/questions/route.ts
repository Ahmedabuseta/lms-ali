import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { canAccessChapterServices } from '@/lib/user';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const chapterIdsParam = searchParams.get('chapterIds');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    if (!courseId) {
      return new NextResponse('Course ID required', { status: 400 });
    }

    // Parse chapter IDs if provided
    const chapterIds = chapterIdsParam ? chapterIdsParam.split(',').filter(Boolean) : [];

    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Build question bank filter conditions
    const questionBankWhere: any = {
      courseId: courseId,
    };

    // If specific chapters requested, filter by them
    if (chapterIds.length > 0) {
      // Check access for each chapter
      for (const chapterId of chapterIds) {
        const hasAccess = await canAccessChapterServices(user, chapterId);
        if (!hasAccess) {
          return new NextResponse(`Access denied for chapter ${chapterId}`, { status: 403 });
        }
      }
      questionBankWhere.chapterId = {
        in: chapterIds,
      };
    } else {
      // For trial users without specific chapters, only show questions from free chapters
      if (user.accessType === 'FREE_TRIAL') {
        questionBankWhere.chapter = {
          OR: [
            { position: 1 },
            { isFree: true }
          ]
        };
      }
    }

    // Get total count for pagination
    const totalQuestions = await db.question.count({
      where: {
        questionBank: questionBankWhere
      },
    });

    // Get questions with pagination
    const questions = await db.question.findMany({
      where: {
        questionBank: questionBankWhere
      },
      include: {
        options: true,
        questionBank: {
          include: {
            chapter: {
              select: {
                id: true,
                title: true,
                position: true,
                isFree: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: pageSize,
      skip: skip,
    });

    // Transform questions to match expected format
    const transformedQuestions = questions.map(question => ({
      id: question.id,
      text: question.text,
      type: question.type,
      difficulty: question.difficulty,
      chapter: question.questionBank.chapter ? {
        id: question.questionBank.chapter.id,
        title: question.questionBank.chapter.title,
      } : undefined,
      options: question.options.map(option => ({
        id: option.id,
        text: option.text,
        isCorrect: option.isCorrect,
      })),
    }));

    console.log(`Found ${questions.length} practice questions for course ${courseId}, page ${page}`);

    return NextResponse.json({
      questions: transformedQuestions,
      totalQuestions,
      pageCount: Math.ceil(totalQuestions / pageSize),
      currentPage: page,
    });
  } catch (error) {
    console.log('[PRACTICE_QUESTIONS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
