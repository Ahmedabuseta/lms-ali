import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser, requireTeacher } from '@/lib/api-auth';

type Params = { chapterId: string; courseId: string };

export async function GET(req: NextRequest, { params }: { params: Params }) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get chapter quiz with questions
    const quiz = await db.quiz.findFirst({
      where: {
        chapterId: params.chapterId,
        chapter: {
          courseId: params.courseId,
        },
      },
      include: {
        quizQuestions: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
          orderBy: {
            position: 'asc',
          },
        },
        attempts: {
          where: {
            userId: user.id,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('[CHAPTER_QUIZ_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Params }) {
  try {
    const user = await requireTeacher();
    const values = await req.json();
    // Verify course ownership
    const course = await db.course.findUnique({
      where: { id: params.courseId },
    });

    if (!course) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify chapter exists and belongs to course
    const chapter = await db.chapter.findUnique({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      },
    });

    if (!chapter) {
      return new NextResponse('Chapter not found', { status: 404 });
    }

    // Check if quiz already exists for this chapter
    const existingQuiz = await db.quiz.findFirst({
      where: { chapterId: params.chapterId },
    });

    if (existingQuiz) {
      return new NextResponse('Quiz already exists for this chapter', { status: 400 });
    }

    // Create new quiz
    const quiz = await db.quiz.create({
      data: {
        title: values.title || `${chapter.title} Quiz`,
        description: values.description,
        timeLimit: values.timeLimit,
        requiredScore: values.requiredScore || 100,
        freeAttempts: values.freeAttempts || -1,
        chapterId: params.chapterId,
      },
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('[CHAPTER_QUIZ_CREATE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  try {
    const user = await requireTeacher();
    const values = await req.json();


    // Verify course ownership
    const course = await db.course.findUnique({
      where: { id: params.courseId },
    });

    if (!course) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Find existing quiz
    const existingQuiz = await db.quiz.findFirst({
      where: {
        chapterId: params.chapterId,
        chapter: {
          courseId: params.courseId,
        },
      },
    });

    if (!existingQuiz) {
      return new NextResponse('Quiz not found', { status: 404 });
    }

    // Update quiz
    const quiz = await db.quiz.update({
      where: { id: existingQuiz.id },
      data: values,
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('[CHAPTER_QUIZ_UPDATE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  try {
    const user = await requireTeacher();

    // Verify course ownership
    const course = await db.course.findUnique({
      where: { id: params.courseId },
    });

    if (!course) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Find and delete quiz
    const quiz = await db.quiz.findFirst({
      where: {
        chapterId: params.chapterId,
        chapter: {
          courseId: params.courseId,
        },
      },
    });

    if (!quiz) {
      return new NextResponse('Quiz not found', { status: 404 });
    }

    await db.quiz.delete({
      where: { id: quiz.id },
    });

    return new NextResponse('Quiz deleted', { status: 200 });
  } catch (error) {
    console.error('[CHAPTER_QUIZ_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 