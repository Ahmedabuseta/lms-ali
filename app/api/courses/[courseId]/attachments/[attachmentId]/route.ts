import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireTeacher } from '@/lib/api-auth';

export async function DELETE(request: NextRequest, { params }: { params: { courseId: string; attachmentId: string } }) {
  try {
    const { courseId, attachmentId } = params;
    requireTeacher()

    const attachment = await db.attachment.delete({ where: { courseId, id: attachmentId } });

    return NextResponse.json(attachment);
  } catch {
    return new NextResponse('Internal server error', { status: 500 });
  }
}
