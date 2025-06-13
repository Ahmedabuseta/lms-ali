import { getAuthenticatedUser } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { uploadToSpaces } from '@/lib/digitalocean-spaces';

export async function POST(req: NextRequest) { try {
    const user = await getAuthenticatedUser();

    if (!user || user.role !== 'TEACHER') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';

    if (!file) { return new NextResponse('No file provided', { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to DigitalOcean Spaces
    const fileUrl = await uploadToSpaces(buffer, file.name, file.type, folder);

    return NextResponse.json({ url: fileUrl });
  } catch (error) { console.error('[UPLOAD_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
