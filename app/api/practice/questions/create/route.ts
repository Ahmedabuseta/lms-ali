import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export async function POST(req: NextRequest) { try {
    await requireAuth();

    const { text, type, options, courseId, chapterId, difficulty } = await req.json();

    // Find or create question bank
    let questionBank = await db.questionBank.findFirst({ where: { courseId, chapterId: chapterId || null }
    });

    if (!questionBank) { questionBank = await db.questionBank.create({
        data: {
          title: `Practice Questions - ${chapterId ? 'Chapter' : 'Course' }`,
          courseId,
          chapterId: chapterId || null,
        }
      });
    }

    // Create the question
    const question = await db.question.create({ data: {
        text,
        type,
        difficulty: difficulty || 'MEDIUM',
        questionBankId: questionBank.id,
        options: {
          createMany: {
            data: options.map((option: { text: any; isCorrect: any }) => ({ text: option.text,
              isCorrect: option.isCorrect, })),
          },
        },
      },
      include: { options: true, },
    });

    return NextResponse.json(question);
  } catch (error) { console.error('[PRACTICE_QUESTION_CREATE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
