import { NextResponse } from 'next/server';
import { completeExam } from '@/actions/exam-actions';
import { requireAuth } from '@/lib/api-auth';

export async function POST(req: Request, { params }: { params: { examId: string; attemptId: string } }) {
  try {
const {id} = await requireAuth()

    const examAttempt = await completeExam({
      userId:id,
      attemptId: params.attemptId,
    });

    return NextResponse.json(examAttempt);
  } catch (error) {
    console.error('[COMPLETE_EXAM_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
