import { NextResponse } from 'next/server';
import { startExamAttempt } from '@/actions/exam-actions';
import { requireAuth } from '@/lib/api-auth';

export async function POST(req: Request) { try {
    const { id:userId } = await requireAuth();
    const { examId } = await req.json();

    if (!userId || !examId) { return new NextResponse('Unauthorized or missing exam ID', { status: 401 });
    }

    const attempt = await startExamAttempt({ userId, examId });

    return NextResponse.json(attempt);
  } catch (error) { console.error('[EXAM_ATTEMPT_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
