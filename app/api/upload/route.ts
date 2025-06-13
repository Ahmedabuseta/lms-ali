import { getAuthenticatedUser } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { uploadToSpaces } from '@/lib/digitalocean-spaces';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return new NextResponse('Unauthorized - Please sign in', { status: 401 });
    }

    // Allow both teachers and students to upload files
    // Teachers can upload course content, students can upload profiles, assignments, etc.
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';

    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    // Validate file size (max 100MB for teachers, 10MB for students)
    const maxFileSize = user.role === 'TEACHER' ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxFileSize) {
      const maxSizeMB = user.role === 'TEACHER' ? '100MB' : '10MB';
      return new NextResponse(`File size exceeds ${maxSizeMB} limit`, { status: 413 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to DigitalOcean Spaces with user-specific folder structure
    const userFolder = `${folder}/${user.role.toLowerCase()}/${user.id}`;
    const fileUrl = await uploadToSpaces(buffer, file.name, file.type, userFolder);

    return NextResponse.json({ 
      url: fileUrl,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('[UPLOAD_ERROR]', error);
    
    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('credentials')) {
        return new NextResponse('Storage configuration error', { status: 500 });
      }
      if (error.message.includes('bucket')) {
        return new NextResponse('Storage bucket error', { status: 500 });
      }
      return new NextResponse(error.message, { status: 500 });
    }
    
    return new NextResponse('Internal upload error', { status: 500 });
  }
}
