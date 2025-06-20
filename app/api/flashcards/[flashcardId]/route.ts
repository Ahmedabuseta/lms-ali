import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireTeacherAPI } from '@/lib/auth-helpers';

export async function PATCH(req: Request, { params }: { params: { flashcardId: string } }) {
  try {
    await requireTeacherAPI();
    const { question, answer, chapterId } = await req.json();

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
    await requireTeacherAPI();

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
