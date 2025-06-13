import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

type Params = { chapterId: string; courseId: string };

export async function PATCH(req: NextRequest, { params }: { params: Params }) { try {
requireAuth()

    const ownCourse = await db.course.findUnique({ where: { id: params.courseId } });
    if (!ownCourse) { return new NextResponse('Unauthorized', { status: 401 });
    }

    const unpublishedChapter = await db.chapter.update({ where: { id: params.chapterId, courseId: params.courseId },
      data: { isPublished: false },
    });

    const publishedChapters = await db.chapter.count({ where: { courseId: params.courseId, isPublished: true } });
    if (!publishedChapters) { await db.course.update({ where: { id: params.courseId }, data: { isPublished: false } });
    }

    return NextResponse.json(unpublishedChapter);
  } catch { return new NextResponse('Internal server error', { status: 500 });
  }
}
