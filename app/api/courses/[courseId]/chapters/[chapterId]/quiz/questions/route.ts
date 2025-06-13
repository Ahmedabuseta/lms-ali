import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireTeacher } from '@/lib/api-auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const user = await requireTeacher();

    const { questions } = await req.json();

    if (!Array.isArray(questions) || questions.length === 0) { return new NextResponse('Questions array is required', { status: 400 });
    }

    // Get the quiz for this chapter
    const quiz = await db.quiz.findFirst({ where: {
        chapterId: params.chapterId, },
    });

    if (!quiz) { return new NextResponse('Quiz not found', { status: 404 });
    }

    // Create question bank if it doesn't exist
    let questionBank = await db.questionBank.findFirst({ where: {
        courseId: params.courseId,
        chapterId: params.chapterId, },
    });

    if (!questionBank) { questionBank = await db.questionBank.create({
        data: {
          title: `Chapter Questions`,
          description: `Questions for chapter quiz`,
          courseId: params.courseId,
          chapterId: params.chapterId, },
      });
    }

    // Get the current max position for questions in this quiz
    const maxPosition = await db.quizQuestion.findFirst({ where: {
        quizId: quiz.id, },
      orderBy: { position: 'desc', },
      select: { position: true, },
    });

    const startPosition = (maxPosition?.position || 0) + 1;

    const createdQuestions = [];

    for (let i = 0; i < questions.length; i++) { const questionData = questions[i];

      // Create the question
      const question = await db.question.create({
        data: {
          text: questionData.text,
          type: questionData.type,
          difficulty: questionData.difficulty || 'MEDIUM',
          points: questionData.points || 1,
          explanation: questionData.explanation,
          questionBankId: questionBank.id,
          options: {
            create: questionData.options.map((option: any) => ({
              text: option.text,
              isCorrect: option.isCorrect, })),
          },
        },
        include: { options: true, },
      });

      // Add question to quiz
      await db.quizQuestion.create({ data: {
          quizId: quiz.id,
          questionId: question.id,
          position: startPosition + i, },
      });

      createdQuestions.push(question);
    }

    return NextResponse.json({ questions: createdQuestions });
  } catch (error) { console.error('[QUIZ_QUESTIONS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
