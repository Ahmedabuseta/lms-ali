import { requireTeacher } from '@/lib/api-auth';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const user = await requireTeacher();

    const { title, description, courseId, chapterId, timeLimit, isPublished } = await req.json();

    // Validate that the course belongs to the teacher

    // Create the exam
    const exam = await db.exam.create({
      data: {
        title,
        description,
        courseId,
        chapterId: chapterId || null,
        timeLimit: timeLimit || null,
        isPublished: isPublished || false,
      },
    });

    return NextResponse.json(exam);
  } catch (error) {
    console.error('[EXAM_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
