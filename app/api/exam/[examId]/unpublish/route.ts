import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export async function PATCH(req: Request, { params }: { params: { examId: string } }) { try {
    await requireAuth()

    // Find the exam with its course to check ownership
    const examWithCourse = await db.exam.findUnique({
      where: {
        id: params.examId, },
      include: { course: true, },
    });

    if (!examWithCourse) { return new NextResponse('Exam not found', { status: 404 });
    }

    // Check if the exam has any active attempts (incomplete attempts)
    const activeAttempts = await db.examAttempt.count({ where: {
        examId: params.examId,
        completedAt: null, // Incomplete attempts },
    }});

    if (activeAttempts > 0) { return new NextResponse('Cannot unpublish an exam with active attempts', { status: 400 });
    }

    // Unpublish the exam
    const unpublishedExam = await db.exam.update({ where: {
        id: params.examId, },
      data: { isPublished: false, },
    });

    return NextResponse.json(unpublishedExam);
  } catch (error) { console.error('[EXAM_UNPUBLISH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
