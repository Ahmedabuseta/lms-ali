import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export async function PUT(req: Request, { params }: { params: { examId: string } }) {
  try {
    await requireAuth();
    const { list } = await req.json();

    // Verify ownership through the course
    const examWithCourse = await db.exam.findUnique({ where: {
        id: params.examId, },
      include: { course: true, },
    });

    if (!examWithCourse) { return new NextResponse('Exam not found', { status: 404 });
    }

    // TODO: Add course ownership check when createdById field is available
    // if (examWithCourse.course.createdById !== userId) { //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    // Don't allow reordering questions for published exams
    if (examWithCourse.isPublished) { return new NextResponse('Cannot reorder questions for published exams', {
        status: 400, });
    }

    // Update the reordering strategy since position field doesn't exist
    // We will use createdAt timestamps instead
    for (const item of list) { // Create a timestamp based on the position to maintain order
      const newDate = new Date();
      // Add position as milliseconds to ensure proper ordering
      newDate.setMilliseconds(item.position);

      await db.question.update({
        where: {
          id: item.id, },
        data: { createdAt: newDate, },
      });
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) { console.error('[QUESTIONS_REORDER]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
