import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/mux-node';
import { requireTeacher } from '@/lib/api-auth';
import { db } from '@/lib/db';

const { Video } = new Mux(process.env.MUX_TOKEN_ID!, process.env.MUX_TOKEN_SECRET!);

export async function PATCH(req: Request, { params }: { params: { courseId: string } }) {
  try {
    const user = await requireTeacher();
    const { courseId } = params;
    const values = await req.json();

    const course = await db.course.update({ where: {
        id: courseId, },
      data: { title: values?.title,
        description: values?.description,
        imageUrl: values?.imageUrl,
        categoryId: values?.categoryId,
        price: values?.price,
        attachments: values?.attachments, },
    });

    return NextResponse.json(course);
  } catch (error) { return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { courseId: string } }) { try {
    const user = await requireTeacher();

    const course = await db.course.findUnique({
      where: { id: params.courseId },
      include: { chapters: { include: { muxData: true } },
      },
    });

    if (!course) { return new NextResponse('Not found', { status: 404 });
    }

    /** Removing mux data for all chapters */
    for (const chapter of course.chapters) {
      if (chapter.muxData) {
        await Video.Assets.del(chapter.muxData.assetId);
      }
    }

    const deletedCourse = await db.course.delete({ where: { id: params.courseId } });

    return NextResponse.json(deletedCourse);
  } catch { return new NextResponse('Internal server exception', { status: 500 });
  }
}
