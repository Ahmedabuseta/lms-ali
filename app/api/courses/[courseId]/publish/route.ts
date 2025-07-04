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

    /** Should have a published chapter */
    const hasPublishedChapter = course.chapters.some((chapter) => chapter.isPublished);

    if (!course.title || !course.description || !course.imageUrl || !course.categoryId || !hasPublishedChapter) { return new NextResponse('Missing required fields', { status: 400 });
    }

    const publishedCourse = await db.course.update({ where: { id: params.courseId }, data: { isPublished: true } });

    return NextResponse.json(publishedCourse);
  } catch { return new NextResponse('Internal server error', { status: 500 });
  }
}
