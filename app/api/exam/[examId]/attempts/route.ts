import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export async function GET(
  req: Request,
  { params }: { params: { examId: string } }
) {
  try {
    const { id } = await requireAuth();

    // Get all attempts for this user and exam
    const attempts = await db.examAttempt.findMany({
      where: {
        userId: id,
        examId: params.examId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(attempts);
  } catch (error) {
    console.error('[GET_EXAM_ATTEMPTS_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
