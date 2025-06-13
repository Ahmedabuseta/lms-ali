import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireTeacher } from '@/lib/api-auth';
import * as z from 'zod';

// Validation schemas
const addQuestionSchema = z.object({ questionBankId: z.string().min(1, 'معرف بنك الأسئلة مطلوب'),
  questionIds: z.array(z.string()).min(1, 'يجب اختيار سؤال واحد على الأقل'),
  points: z.number().int().min(1, 'النقاط يجب أن تكون رقم موجب').optional(), });

const createQuestionSchema = z.object({ text: z.string().min(1, 'نص السؤال مطلوب'),
  type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'PASSAGE'], {
    errorMap: () => ({ message: 'نوع السؤال غير صحيح' }),
  }),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  explanation: z.string().optional(),
  passageId: z.string().optional(),
  options: z.array(z.object({ text: z.string().min(1, 'نص الخيار مطلوب'),
    isCorrect: z.boolean(),
    explanation: z.string().optional(), })).min(2, 'يجب أن يكون هناك خياران على الأقل'),
});

export async function GET(req: Request, { params }: { params: { examId: string } }) { try {
    await requireTeacher();

    const exam = await db.exam.findUnique({
      where: {
        id: params.examId, },
      include: { examQuestions: {
          include: {
            question: {
              include: {
                options: true,
                passage: {
                  select: {
                    id: true,
                    title: true,
                    content: true, },
                },
                questionBank: { select: {
                    id: true,
                    title: true, },
                },
              },
            },
          },
          orderBy: { position: 'asc', },
        },
        course: { select: {
            id: true,
            title: true, },
        },
      },
    });

    if (!exam) { return NextResponse.json(
        { message: 'الامتحان غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ exam,
      questions: exam.examQuestions,
      totalQuestions: exam.examQuestions.length,
      totalPoints: exam.examQuestions.reduce((sum, eq) => sum + eq.points, 0), });

  } catch (error) { console.error('[GET_EXAM_QUESTIONS_ERROR]', error);
    return NextResponse.json(
      { message: 'حدث خطأ أثناء جلب الأسئلة' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, { params }: { params: { examId: string } }) { try {
    await requireTeacher();

    const body = await req.json();
    const action = body.action || 'add_existing'; // 'add_existing' or 'create_new'

    // Verify exam exists and is not published
    const exam = await db.exam.findUnique({
      where: {
        id: params.examId, },
      include: { course: {
          select: {
            id: true,
            title: true, },
        },
        examQuestions: { orderBy: {
            position: 'asc', },
        },
      },
    });

    if (!exam) { return NextResponse.json(
        { message: 'الامتحان غير موجود' },
        { status: 404 }
      );
    }

    if (exam.isPublished) { return NextResponse.json(
        { message: 'لا يمكن تعديل أسئلة امتحان منشور' },
        { status: 400 }
      );
    }

    if (action === 'add_existing') { // Add existing questions from question bank
      const validationResult = addQuestionSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          {
            message: 'بيانات غير صحيحة',
            errors: validationResult.error.errors },
          { status: 400 }
        );
      }

      const { questionBankId, questionIds, points = 1 } = validationResult.data;

      // Verify question bank belongs to the same course
      const questionBank = await db.questionBank.findFirst({ where: {
          id: questionBankId,
          courseId: exam.courseId,
          isActive: true, },
      });

      if (!questionBank) { return NextResponse.json(
          { message: 'بنك الأسئلة غير موجود أو غير نشط' },
          { status: 404 }
        );
      }

      // Verify all questions exist and belong to the question bank
      const questions = await db.question.findMany({ where: {
          id: { in: questionIds },
          questionBankId,
          isActive: true,
        },
        include: { options: true, },
      });

      if (questions.length !== questionIds.length) { return NextResponse.json(
          { message: 'بعض الأسئلة غير موجودة أو غير نشطة' },
          { status: 400 }
        );
      }

      // Check for duplicate questions
      const existingQuestionIds = exam.examQuestions.map(eq => eq.questionId);
      const duplicates = questionIds.filter(id => existingQuestionIds.includes(id));

      if (duplicates.length > 0) { return NextResponse.json(
          { message: 'بعض الأسئلة موجودة بالفعل في الامتحان' },
          { status: 400 }
        );
      }

      // Add questions to exam
      const nextPosition = exam.examQuestions.length + 1;
      const examQuestions = [];

      for (let i = 0; i < questions.length; i++) { const examQuestion = await db.examQuestion.create({
          data: {
            examId: params.examId,
            questionId: questions[i].id,
            position: nextPosition + i,
            points, },
          include: { question: {
              include: {
                options: true,
                passage: {
                  select: {
                    id: true,
                    title: true,
                    content: true, },
                },
              },
            },
          },
        });
        examQuestions.push(examQuestion);
      }

      return NextResponse.json({ message: `تم إضافة ${questions.length } سؤال بنجاح`,
        examQuestions,
        totalQuestions: exam.examQuestions.length + questions.length,
      });

    } else if (action === 'create_new') { // Create new question and add to exam
      const validationResult = createQuestionSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          {
            message: 'بيانات غير صحيحة',
            errors: validationResult.error.errors },
          { status: 400 }
        );
      }

      const { text, type, difficulty, explanation, passageId, options } = validationResult.data;

      // Validate options
      const correctOptions = options.filter(opt => opt.isCorrect);
      if (correctOptions.length === 0) { return NextResponse.json(
          { message: 'يجب أن يكون هناك خيار صحيح واحد على الأقل' },
          { status: 400 }
        );
      }

      if (type === 'TRUE_FALSE' && options.length !== 2) { return NextResponse.json(
          { message: 'أسئلة صح/خطأ يجب أن تحتوي على خيارين فقط' },
          { status: 400 }
        );
      }

      // Find or create question bank for this course
      let questionBank = await db.questionBank.findFirst({ where: {
          courseId: exam.courseId,
          chapterId: exam.chapterId, },
      });

      if (!questionBank) { questionBank = await db.questionBank.create({
      data: {
            title: `أسئلة ${exam.title }`,
            description: `بنك أسئلة للامتحان: ${exam.title}`,
            courseId: exam.courseId,
            chapterId: exam.chapterId,
          },
        });
      }

      // Create the question
      const question = await db.question.create({ data: {
        text,
        type,
          difficulty,
          explanation,
          questionBankId: questionBank.id,
          passageId,
        options: {
            create: options.map(option => ({
              text: option.text,
              isCorrect: option.isCorrect,
              explanation: option.explanation, })),
        },
      },
      include: { options: true,
          passage: {
            select: {
              id: true,
              title: true,
              content: true, },
          },
      },
    });

      // Add question to exam
      const nextPosition = exam.examQuestions.length + 1;
      const examQuestion = await db.examQuestion.create({ data: {
        examId: params.examId,
          questionId: question.id,
        position: nextPosition,
          points: 1, },
        include: { question: {
            include: {
              options: true,
              passage: {
                select: {
                  id: true,
                  title: true,
                  content: true, },
              },
            },
          },
      },
    });

      return NextResponse.json({ message: 'تم إنشاء السؤال وإضافته بنجاح',
        examQuestion,
        question, });

    } else { return NextResponse.json(
        { message: 'نوع العملية غير صحيح' },
        { status: 400 }
      );
    }

  } catch (error) { console.error('[ADD_EXAM_QUESTION_ERROR]', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: 'بيانات غير صحيحة',
          errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'حدث خطأ أثناء إضافة السؤال' },
      { status: 500 }
    );
  }
}
