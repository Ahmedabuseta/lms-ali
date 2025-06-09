import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(req: Request, { params }: { params: { examId: string } }) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify ownership through the course
    const examWithCourse = await db.exam.findUnique({
      where: {
        id: params.examId,
      },
      include: {
        course: true,
      },
    });

    if (!examWithCourse) {
      return new NextResponse('Exam not found', { status: 404 });
    }

    /* if (examWithCourse.course.createdById !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    } */

    // Delete the exam - cascade will handle deleting questions and options
    const deletedExam = await db.exam.delete({
      where: {
        id: params.examId,
      },
    });

    return NextResponse.json(deletedExam);
  } catch (error) {
    console.error('[EXAM_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { examId: string } }) {
  try {
    const { userId } = auth();
    const { title, description, chapterId, timeLimit } = await req.json();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify ownership through the course
    const examWithCourse = await db.exam.findUnique({
      where: {
        id: params.examId,
      },
      include: {
        course: true,
      },
    });

    if (!examWithCourse) {
      return new NextResponse('Exam not found', { status: 404 });
    }

    /* if (examWithCourse.course.createdById !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    } */

    // Update the exam's basic details
    const updatedExam = await db.exam.update({
      where: {
        id: params.examId,
      },
      data: {
        title,
        description,
        chapterId: chapterId || null,
        timeLimit: timeLimit || null,
      },
    });

    return NextResponse.json(updatedExam);
  } catch (error) {
    console.error('[EXAM_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
