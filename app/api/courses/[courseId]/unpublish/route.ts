import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireTeacher } from '@/lib/api-auth';

export async function PATCH(req: NextRequest, { params }: { params: { courseId: string } }) { try {
requireTeacher()

    const course = await db.course.findUnique({
      where: { id: params.courseId },
      include: { chapters: { include: { muxData: true } } },
    });

    if (!course) { return new NextResponse('Not Found', { status: 404 });
    }

    const unpublishedCourse = await db.course.update({ where: { id: params.courseId }, data: { isPublished: false } });

    return NextResponse.json(unpublishedCourse);
  } catch { return new NextResponse('Internal server error', { status: 500 });
  }
}
