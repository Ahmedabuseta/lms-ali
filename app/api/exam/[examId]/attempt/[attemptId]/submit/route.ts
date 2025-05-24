import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { completeExam } from '@/actions/exam-actions';

export async function POST(req: Request, { params }: { params: { examId: string; attemptId: string } }) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const result = await completeExam({
      userId,
      attemptId: params.attemptId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[COMPLETE_EXAM_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
