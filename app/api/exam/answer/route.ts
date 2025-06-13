import { NextResponse } from 'next/server';
import { submitAnswer, validateExamAttempt } from '@/actions/exam-actions';
import { requireAuth } from '@/lib/api-auth';
import * as z from 'zod';

const submitAnswerSchema = z.object({
  attemptId: z.string().min(1, 'معرف المحاولة مطلوب'),
  questionId: z.string().min(1, 'معرف السؤال مطلوب'),
  optionId: z.string().min(1, 'معرف الخيار مطلوب'),
});

export async function POST(req: Request) {
  try {
    const { id: userId } = await requireAuth();
    
    const body = await req.json();
    
    // Validate request body
    const validationResult = submitAnswerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: 'بيانات غير صحيحة',
          errors: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { attemptId, questionId, optionId } = validationResult.data;

    // Validate the exam attempt before submitting answer
    const validation = await validateExamAttempt(userId, attemptId);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          message: validation.reason,
          attemptInvalid: true,
        },
        { status: 400 }
      );
    }

    // Submit the answer
    const questionAttempt = await submitAnswer({
      userId,
      attemptId,
      questionId,
      optionId,
    });

    return NextResponse.json({
      questionAttempt,
      message: 'تم حفظ الإجابة بنجاح',
      success: true,
    });

  } catch (error) {
    console.error('[SUBMIT_ANSWER_ERROR]', error);
    
    // Handle specific error messages
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { 
            message: 'المحاولة أو السؤال غير موجود',
            notFound: true,
          },
          { status: 404 }
        );
      }
      
      if (error.message.includes('already completed')) {
        return NextResponse.json(
          { 
            message: 'تم إنهاء الامتحان بالفعل',
            alreadyCompleted: true,
          },
          { status: 410 } // Gone
        );
      }
      
      if (error.message.includes('time has expired') || error.message.includes('Time limit exceeded')) {
        return NextResponse.json(
          { 
            message: 'انتهت مدة الامتحان',
            timeExpired: true,
          },
          { status: 410 } // Gone
        );
      }
      
      if (error.message.includes('Invalid option')) {
        return NextResponse.json(
          { 
            message: 'الخيار المحدد غير صحيح',
            invalidOption: true,
          },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        message: 'حدث خطأ أثناء حفظ الإجابة',
        success: false,
      },
      { status: 500 }
    );
  }
}
