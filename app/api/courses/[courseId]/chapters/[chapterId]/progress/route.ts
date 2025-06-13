import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

import { requireAuth } from '@/lib/api-auth';
export async function PUT(req: NextRequest, { params }: { params: { courseId: string; chapterId: string } }) {
  try {
     const user = await requireAuth()
    const { isCompleted } = await req.json();

    const userProgress = await db.userProgress.upsert({ where: { userId_chapterId: { userId: user.id, chapterId: params.chapterId } },
      update: { isCompleted },
      create: { userId: user.id, chapterId: params.chapterId, isCompleted },
    });

    return NextResponse.json(userProgress);
  } catch { return new NextResponse('Internal server error', { status: 500 });
  }
}
