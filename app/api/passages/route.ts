import { NextRequest, NextResponse } from 'next/server';
import { requireTeacher } from '@/lib/api-auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) { try {
    const user = await requireTeacher();

    const { courseId, chapterId, title, content, questions } = await req.json();

    if (!courseId || !title || !content || !questions || questions.length === 0) { return new NextResponse('Missing required fields', { status: 400 });
    }

    // Create the passage
    const passage = await db.passage.create({ data: {
        title,
        content, },
    });

    // Find or create question bank for the course/chapter
    let questionBank = await db.questionBank.findFirst({ where: {
        courseId,
        chapterId: chapterId || null }
    });

    if (!questionBank) { questionBank = await db.questionBank.create({
        data: {
          title: chapterId ? `Chapter Questions - ${title }` : `Course Questions - ${title}`,
          description: `Questions for passage: ${title}`,
          courseId,
          chapterId: chapterId || null,
        }
      });
    }

    // Create questions for the passage
    for (const questionData of questions) { const question = await db.question.create({
        data: {
          text: questionData.text,
          type: 'PASSAGE',
          difficulty: questionData.difficulty,
          questionBankId: questionBank.id,
          passageId: passage.id,
          points: questionData.points || 1, },
      });

      // Create options for the question
      for (const optionData of questionData.options) { await db.option.create({
          data: {
            text: optionData.text,
            isCorrect: optionData.isCorrect,
            questionId: question.id, },
        });
      }
    }

    return NextResponse.json(passage);
  } catch (error) { console.error('[PASSAGES_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
