import { auth } from '@clerk/nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // TODO: Implement image processing logic
    return NextResponse.json({ message: 'Image processing endpoint' });
  } catch (error) {
    console.log('[IMAGE_PROCESSING]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // TODO: Implement image processing status/results logic
    return NextResponse.json({ message: 'Image processing status endpoint' });
  } catch (error) {
    console.log('[IMAGE_PROCESSING_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
