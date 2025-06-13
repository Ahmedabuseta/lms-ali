import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireTeacher } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
   requireTeacher();
    const { title } = await request.json();

    const course = await db.course.create({ data: {
        title, },
    });

    return NextResponse.json(course);
  } catch (error) { return new NextResponse('Internal Server Error', { status: 500 });
  }
}
