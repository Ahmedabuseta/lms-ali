import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireTeacher } from '@/lib/api-auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { courseId: string; chapterId: string } }
) { try {
    const user = await requireTeacher();

    const quiz = await db.quiz.findFirst({
      where: {
        chapterId: params.chapterId, },
    });

    if (!quiz) { return new NextResponse('Quiz not found', { status: 404 });
    }

    const updatedQuiz = await db.quiz.update({ where: {
        id: quiz.id, },
      data: { isPublished: false, },
    });

    return NextResponse.json(updatedQuiz);
  } catch (error) { console.error('[QUIZ_UNPUBLISH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
