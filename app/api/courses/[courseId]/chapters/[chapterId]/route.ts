import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/mux-node';
import { db } from '@/lib/db';
import { requireTeacherAPI } from '@/lib/auth-helpers';

type Params = { chapterId: string; courseId: string };

const { Video } = new Mux(process.env.MUX_TOKEN_ID!, process.env.MUX_TOKEN_SECRET!);

// Helper function to check if URL is an external video link
const isExternalVideoUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return (
      hostname.includes('youtube.com') ||
      hostname.includes('iframe.mediadelivery.net')
    );
  } catch {
    return false;
  }
};

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  try {
    await requireTeacherAPI();
    // eslint-disable-next-line
    const { isPublished, ...values } = await req.json();

    const ownCourse = await db.course.findUnique({
      where: { id: params.courseId }
    });
    
    if (!ownCourse) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const chapter = await db.chapter.update({
      where: { id: params.chapterId },
      data: { ...values }
    });

    if (values.videoUrl) {
      // Clean up existing Mux data
      const existingMuxData = await db.muxData.findFirst({
        where: { chapterId: params.chapterId }
      });
      
      if (existingMuxData) {
        try {
          await Video.Assets.del(existingMuxData.assetId);
        } catch (error) {
          console.warn('Failed to delete Mux asset:', error);
        }
        
        await db.muxData.delete({
          where: { id: existingMuxData.id }
        });
      }

      // Only process through Mux if it's an uploaded file (not external URL)
      if (!isExternalVideoUrl(values.videoUrl)) {
        try {
          const asset = await Video.Assets.create({
            input: values.videoUrl,
            playback_policy: 'public',
            test: false,
          });

          await db.muxData.create({
            data: {
              chapterId: params.chapterId,
              assetId: asset.id,
              playbackId: asset.playback_ids?.[0]?.id,
            },
          });
        } catch (error) {
          console.error('Mux processing error:', error);
          // Don't fail the entire request if Mux processing fails
          // The video URL is still saved in the chapter
        }
      }
      // For external URLs (YouTube, Vimeo, etc.), we just save the URL without Mux processing
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.error('Chapter update error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  try {
    await requireTeacherAPI();

    const ownCourse = await db.course.findUnique({
      where: { id: params.courseId }
    });
    
    if (!ownCourse) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const chapter = await db.chapter.findUnique({
      where: { id: params.chapterId, courseId: params.courseId },
    });
    
    if (!chapter) {
      return new NextResponse('Chapter not found', { status: 404 });
    }

    if (chapter.videoUrl) {
      const existingMuxData = await db.muxData.findFirst({
        where: { chapterId: params.chapterId }
      });

      if (existingMuxData) {
        try {
          await Video.Assets.del(existingMuxData.assetId);
        } catch (error) {
          console.warn('Failed to delete Mux asset:', error);
        }
        
        await db.muxData.delete({
          where: { id: existingMuxData.id }
        });
      }
    }

    const deletedChapter = await db.chapter.delete({
      where: { id: params.chapterId }
    });

    const publishedChaptersInCourse = await db.chapter.count({
      where: { courseId: params.courseId, isPublished: true },
    });

    if (!publishedChaptersInCourse) {
      await db.course.update({
        where: { id: params.courseId },
        data: { isPublished: false }
      });
    }

    return NextResponse.json(deletedChapter);
  } catch (error) {
    console.error('Chapter deletion error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
