import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { canAccessChapterServices } from '@/lib/user';

export const dynamic = 'force-dynamic';

interface CreateSessionRequest { courseId: string;
  chapterIds?: string[];
  batchSize?: number;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | 'ALL';
  includePassages?: boolean; }

export async function POST(req: NextRequest) { try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { courseId,
      chapterIds = [],
      batchSize = 10,
      difficulty = 'ALL',
      includePassages = true }: CreateSessionRequest = await req.json();

    if (!courseId) { return new NextResponse('Course ID required', { status: 400 });
    }

    // Verify course access
    const course = await db.course.findUnique({ where: { id: courseId },
      select: { id: true, title: true }
    });

    if (!course) { return new NextResponse('Course not found', { status: 404 });
    }

    // Check chapter access if specific chapters requested
    if (chapterIds.length > 0) { for (const chapterId of chapterIds) {
        const hasAccess = await canAccessChapterServices(user, chapterId);
        if (!hasAccess) {
          return new NextResponse(`Access denied for chapter ${chapterId }`, { status: 403 });
        }
      }
    }

    // Build question bank filter conditions
    const questionBankWhere: any = { courseId: courseId, };

    // If specific chapters requested, filter by them
    if (chapterIds.length > 0) { questionBankWhere.chapterId = {
        in: chapterIds, };
    } else { // For trial users without specific chapters, only show questions from free chapters
      if (user.accessType === 'FREE_TRIAL') {
        questionBankWhere.chapter = {
          OR: [
            { position: 1 },
            { isFree: true }
          ]
        };
      }
    }

    // Build question filter
    const questionWhere: any = { questionBank: questionBankWhere };

    // Add difficulty filter if specified
    if (difficulty !== 'ALL') {
      questionWhere.difficulty = difficulty;
    }

    // Get total count for pagination info
    const totalQuestions = await db.question.count({ where: questionWhere, });

    if (totalQuestions === 0) { return new NextResponse('No questions found', { status: 404 });
    }

    // Get first batch of questions (randomized)
    const questions = await db.question.findMany({ where: questionWhere,
      include: {
        options: {
          orderBy: {
            createdAt: 'asc' }
        },
        passage: true,
        questionBank: { include: {
            chapter: {
              select: {
                id: true,
                title: true,
                position: true,
                isFree: true }
            }
          }
        }
      },
      take: batchSize,
      skip: 0,
      // Use random ordering by using a random field or sorting by created date with offset
      orderBy: { createdAt: 'desc', },
    });

    // Shuffle the questions for randomness
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);

    // Get selected chapters info
    const selectedChapters = chapterIds.length > 0
      ? await db.chapter.findMany({ where: {
            id: { in: chapterIds },
            courseId: courseId
          },
          select: { id: true, title: true }
        })
      : [];

    // Create session ID
    const sessionId = `session_${user.id}_${Date.now()}_${ Math.random().toString(36).substr(2, 9) }`;

    // Transform questions to match expected format
    const transformedQuestions = shuffledQuestions.map(question => { // Get user's previous attempts for this question
      const attemptCount = 0; // TODO: Count from practice attempts
      const lastAttempt = null; // TODO: Get last attempt

      return {
        id: question.id,
        text: question.text,
        type: question.type,
        difficulty: question.difficulty,
        points: question.points,
        explanation: question.explanation,
        passage: question.passage,
        options: question.options.map(option => ({
          id: option.id,
          text: option.text,
          isCorrect: option.isCorrect, })),
        questionBank: { title: question.questionBank.title || 'Unknown',
          chapterId: question.questionBank.chapterId, },
        attemptCount,
        lastAttempt,
      };
    });

    const sessionData = { sessionId,
      courseId,
      selectedChapters,
      questions: transformedQuestions,
      totalQuestions,
      currentBatch: 1,
      batchSize,
      hasMoreQuestions: totalQuestions > batchSize,
      settings: {
        difficulty,
        includePassages, }
    };

    console.log(`Created practice session ${sessionId} with ${transformedQuestions.length} questions`);

    return NextResponse.json(sessionData);
  } catch (error) { console.log('[PRACTICE_SESSION_CREATE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function GET(req: NextRequest) { try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const courseId = searchParams.get('courseId');
    const chapterIdsParam = searchParams.get('chapterIds');
    const batch = parseInt(searchParams.get('batch') || '1');
    const batchSize = parseInt(searchParams.get('batchSize') || '10');
    const difficulty = searchParams.get('difficulty') || 'ALL';

    if (!sessionId || !courseId) { return new NextResponse('Session ID and Course ID required', { status: 400 });
    }

    const chapterIds = chapterIdsParam ? chapterIdsParam.split(',').filter(Boolean) : [];

    // Build question bank filter conditions (same as POST)
    const questionBankWhere: any = { courseId: courseId, };

    if (chapterIds.length > 0) { questionBankWhere.chapterId = {
        in: chapterIds, };
    } else { if (user.accessType === 'FREE_TRIAL') {
        questionBankWhere.chapter = {
          OR: [
            { position: 1 },
            { isFree: true }
          ]
        };
      }
    }

    const questionWhere: any = { questionBank: questionBankWhere };

    if (difficulty !== 'ALL') {
      questionWhere.difficulty = difficulty;
    }

    // Get total count
    const totalQuestions = await db.question.count({ where: questionWhere, });

    // Calculate pagination
    const skip = (batch - 1) * batchSize;

    // Get questions for the requested batch
    const questions = await db.question.findMany({ where: questionWhere,
      include: {
        options: {
          orderBy: {
            createdAt: 'asc' }
        },
        passage: true,
        questionBank: { include: {
            chapter: {
              select: {
                id: true,
                title: true,
                position: true,
                isFree: true }
            }
          }
        }
      },
      take: batchSize,
      skip: skip,
      orderBy: { createdAt: 'desc', },
    });

    // Shuffle for randomness
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);

    // Get selected chapters info
    const selectedChapters = chapterIds.length > 0
      ? await db.chapter.findMany({ where: {
            id: { in: chapterIds },
            courseId: courseId
          },
          select: { id: true, title: true }
        })
      : [];

    // Transform questions
    const transformedQuestions = shuffledQuestions.map(question => ({ id: question.id,
      text: question.text,
      type: question.type,
      difficulty: question.difficulty,
      points: question.points,
      explanation: question.explanation,
      passage: question.passage,
      options: question.options.map(option => ({
        id: option.id,
        text: option.text,
        isCorrect: option.isCorrect, })),
      questionBank: { title: question.questionBank.title || 'Unknown',
        chapterId: question.questionBank.chapterId, },
      attemptCount: 0,
      lastAttempt: null,
    }));

    const sessionData = { sessionId,
      courseId,
      selectedChapters,
      questions: transformedQuestions,
      totalQuestions,
      currentBatch: batch,
      batchSize,
      hasMoreQuestions: (batch * batchSize) < totalQuestions,
      settings: {
        difficulty,
        includePassages: true, }
    };

    return NextResponse.json(sessionData);
  } catch (error) { console.log('[PRACTICE_SESSION_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
