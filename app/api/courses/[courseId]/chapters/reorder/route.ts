import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export async function PUT(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
requireAuth()

    const { list } = await req.json();

    for (const item of list) { await db.chapter.update({
        where: { id: item.id },
        data: { position: item.position },
      });
    }

    return new NextResponse('Success', { status: 200 });
  } catch { return new NextResponse('Internal server error', { status: 500 });
  }
}
