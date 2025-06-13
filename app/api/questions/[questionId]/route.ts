import { NextRequest, NextResponse } from 'next/server';
import { requireTeacher } from '@/lib/api-auth';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { questionId: string } }
) { try {
    await requireTeacher();

    const question = await db.question.findUnique({
      where: {
        id: params.questionId, },
      include: { options: true,
        questionBank: {
          include: {
            course: true,
            chapter: true, },
        },
        passage: true,
      },
    });

    if (!question) { return new NextResponse('Question not found', { status: 404 });
    }

    return NextResponse.json(question);
  } catch (error) { console.error('[QUESTION_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { questionId: string } }
) { try {
    await requireTeacher();

    const { text, type, difficulty, points, options } = await req.json();

    if (!text || !type || !difficulty || !options || options.length === 0) { return new NextResponse('Missing required fields', { status: 400 });
    }

    // Update question
    const question = await db.question.update({ where: {
        id: params.questionId, },
      data: { text,
        type,
        difficulty,
        points: points || 1, },
    });

    // Delete existing options
    await db.option.deleteMany({ where: {
        questionId: params.questionId, },
    });

    // Create new options
    for (let i = 0; i < options.length; i++) { const option = options[i];
      await db.option.create({
        data: {
          text: option.text,
          isCorrect: option.isCorrect,
          questionId: question.id, },
      });
    }

    const updatedQuestion = await db.question.findUnique({ where: {
        id: params.questionId, },
      include: { options: true,
        questionBank: {
          include: {
            course: true,
            chapter: true, },
        },
        passage: true,
      },
    });

    return NextResponse.json(updatedQuestion);
  } catch (error) { console.error('[QUESTION_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { questionId: string } }
) { try {
    await requireTeacher();

    // Check if question exists
    const question = await db.question.findUnique({
      where: {
        id: params.questionId, },
    });

    if (!question) { return new NextResponse('Question not found', { status: 404 });
    }

    // Delete the question (options will be deleted automatically due to cascade)
    await db.question.delete({ where: {
        id: params.questionId, },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) { console.error('[QUESTION_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
