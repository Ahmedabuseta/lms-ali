import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isTeacher } from '@/lib/teacher';
import { requireTeacher } from '@/lib/api-auth';

export async function POST(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
requireTeacher()
    const { url } = await request.json();

    const attachment = await db.attachment.create({
      data: {
        url,
        name: url.split('/').pop(),
        courseId: params.courseId,
      },
    });

    return NextResponse.json(attachment);
  } catch (error) {
    return new NextResponse('Internal server error', { status: 500 });
  }
}
