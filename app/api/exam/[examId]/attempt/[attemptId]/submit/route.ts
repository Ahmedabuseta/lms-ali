import { NextResponse } from 'next/server';
import { completeExam, validateExamAttempt } from '@/actions/exam-actions';
import { requireAuth } from '@/lib/api-auth';
import { db } from '@/lib/db';

export async function POST(req: Request, { params }: { params: { examId: string; attemptId: string } }) { try {
    const { id: userId } = await requireAuth();

    // Validate that the attempt belongs to the user and exam
    const attempt = await db.examAttempt.findFirst({ where: {
        id: params.attemptId,
        userId,
        examId: params.examId, },
      include: { exam: {
          select: {
            title: true,
            timeLimit: true,
            showResults: true,
            allowReview: true, },
        },
      },
    });

    if (!attempt) { return NextResponse.json(
        {
          message: 'المحاولة غير موجودة أو لا تنتمي لك',
          notFound: true, },
        { status: 404 }
      );
    }

    if (attempt.completedAt) { return NextResponse.json(
        {
          message: 'تم إنهاء هذه المحاولة بالفعل',
          alreadyCompleted: true,
          completedAt: attempt.completedAt, },
        { status: 410 } // Gone
      );
    }

    // Validate the exam attempt
    const validation = await validateExamAttempt(userId, params.attemptId);
    if (!validation.valid && validation.reason !== 'Time limit exceeded') { return NextResponse.json(
        {
          message: validation.reason,
          attemptInvalid: true, },
        { status: 400 }
      );
    }

    // Complete the exam
    const result = await completeExam({ userId,
      attemptId: params.attemptId, });

    // Prepare response based on exam settings
    const response: any = { message: 'تم تسليم الامتحان بنجاح',
      success: true,
      attemptId: params.attemptId,
      examId: params.examId,
      completedAt: result.completedAt,
      score: result.score,
      totalPoints: result.totalPoints,
      maxPoints: result.maxPoints,
      isPassed: result.isPassed,
      timeSpent: result.timeSpent,
      isTimedOut: result.isTimedOut, };

    // Include detailed results if exam allows showing results
    if (attempt.exam.showResults) { response.results = {
        questionAttempts: result.questionAttempts.map(qa => ({
          questionId: qa.questionId,
          questionText: qa.question.text,
          selectedOptionId: qa.selectedOptionId,
          selectedOptionText: qa.selectedOption?.text,
          isCorrect: qa.isCorrect,
          pointsEarned: qa.pointsEarned,
          // Include correct answer if review is allowed
          ...(attempt.exam.allowReview && {
            correctOptions: qa.question.options.filter(opt => opt.isCorrect),
            explanation: qa.question.explanation, }),
        })),
      };
    }

    return NextResponse.json(response);

  } catch (error) { console.error('[COMPLETE_EXAM_ERROR]', error);

    // Handle specific error messages
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          {
            message: 'المحاولة غير موجودة',
            notFound: true, },
          { status: 404 }
        );
      }

      if (error.message.includes('already completed')) { return NextResponse.json(
          {
            message: 'تم إنهاء الامتحان بالفعل',
            alreadyCompleted: true, },
          { status: 410 } // Gone
        );
      }
    }

    return NextResponse.json(
      { message: 'حدث خطأ أثناء تسليم الامتحان',
        success: false, },
      { status: 500 }
    );
  }
}
