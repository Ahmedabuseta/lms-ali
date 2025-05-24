import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { submitAnswer } from '@/actions/exam-actions';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const { attemptId, questionId, optionId } = await req.json();

    if (!userId || !attemptId || !questionId || !optionId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const questionAttempt = await submitAnswer({
      userId,
      attemptId,
      questionId,
      optionId,
    });

    return NextResponse.json(questionAttempt);
  } catch (error) {
    console.error('[SUBMIT_ANSWER_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
