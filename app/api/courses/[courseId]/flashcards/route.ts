import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireTeacher } from '@/lib/api-auth';

export async function POST(req: Request, { params }: { params: { courseId: string } }) {
  try {
      requireTeacher()
    const { question, answer, chapterId } = await req.json();


    // Verify course ownership
    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        //  ,
      },
    });

    if (!course) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify the chapter belongs to this course
    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        courseId: params.courseId,
      },
    });

    if (!chapter) {
      return new NextResponse('Chapter not found', { status: 404 });
    }

    // Create the flashcard with just the chapterId field
    const flashcard = await db.flashcard.create({
      data: {
        question,
        answer,
        chapterId,
      },
    });

    return NextResponse.json(flashcard);
  } catch (error) {
    console.error('[FLASHCARDS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: { courseId: string } }) {
  try {
requireAuth()

    // Verify course ownership
    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        //  ,
      },
    });

    if (!course) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get all flashcards for this course's chapters
    const flashcards = await db.flashcard.findMany({
      where: {
        chapter: {
          courseId: params.courseId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(flashcards);
  } catch (error) {
    console.error('[FLASHCARDS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
