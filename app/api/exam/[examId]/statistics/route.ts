import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { getExamStatistics } from '@/actions/exam-actions';
import { requireAuth } from '@/lib/api-auth';

export async function GET(req: Request, { params }: { params: { examId: string } }) {
  try {
    const { id: userId } = await requireAuth()

    const statistics = await getExamStatistics({
      userId,
      examId: params.examId,
    });

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('[GET_EXAM_STATISTICS_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
