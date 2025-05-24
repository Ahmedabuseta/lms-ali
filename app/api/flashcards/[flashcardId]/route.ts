import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: { flashcardId: string } }) {
  try {
    const { userId } = auth();
    const { question, answer, chapterId } = await req.json();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the flashcard
    const flashcard = await db.flashcard.findUnique({
      where: {
        id: params.flashcardId,
      },
      include: {
        chapter: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!flashcard) {
      return new NextResponse('Flashcard not found', { status: 404 });
    }

    // Verify course ownership
    /*if (flashcard.chapter.course.createdById !== userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }*/

    // If changing the chapter, verify it belongs to the same course
    if (chapterId && chapterId !== flashcard.chapterId) {
      const newChapter = await db.chapter.findUnique({
        where: {
          id: chapterId,
        },
        include: {
          course: true,
        },
      });

      if (!newChapter) {
        return new NextResponse('Chapter not found', { status: 404 });
      }

      /*if (newChapter.course.createdById !== userId) {
        return new NextResponse('Unauthorized', { status: 401 })
      }*/
    }

    // Update the flashcard
    const updatedFlashcard = await db.flashcard.update({
      where: {
        id: params.flashcardId,
      },
      data: {
        question,
        answer,
        chapterId,
      },
    });

    return NextResponse.json(updatedFlashcard);
  } catch (error) {
    console.error('[FLASHCARD_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { flashcardId: string } }) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the flashcard
    const flashcard = await db.flashcard.findUnique({
      where: {
        id: params.flashcardId,
      },
      include: {
        chapter: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!flashcard) {
      return new NextResponse('Flashcard not found', { status: 404 });
    }

    // Verify course ownership
    /*if (flashcard.chapter.course.createdById !== userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }*/

    // Delete the flashcard
    await db.flashcard.delete({
      where: {
        id: params.flashcardId,
      },
    });

    return new NextResponse('Flashcard deleted');
  } catch (error) {
    console.error('[FLASHCARD_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
