import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    const { searchParams } = new URL(req.url);

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return new NextResponse('Course ID required', { status: 400 });
    }

    const flashcards = await db.flashcard.findMany({
      where: {
        chapter: {
          courseId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(flashcards);
  } catch (error) {
    console.log('[FLASHCARDS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
