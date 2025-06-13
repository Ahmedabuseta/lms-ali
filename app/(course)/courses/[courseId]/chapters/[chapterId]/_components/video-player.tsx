'use client';

import axios from 'axios';
import MuxPlayer from '@mux/mux-player-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, ExternalLink, Play } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useConfettiStore } from '@/hooks/use-confetti';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  playbackId: string;
  courseId: string;
  chapterId: string;
  nextChapterId?: string;
  isLocked: boolean;
  completeOnEnd: boolean;
  title: string;
  videoUrl?: string; // Add videoUrl prop to handle external links
}



const isExternalVideoUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return (
      hostname.includes('youtube.com') ||
      hostname.includes('youtu.be') ||
      hostname.includes('iframe.mediadelivery.net')
    );
  } catch {
    return false;
  }
};



export const VideoPlayer = ({
  playbackId,
  courseId,
  chapterId,
  nextChapterId,
  isLocked,
  completeOnEnd,
  title,
  videoUrl,
}: VideoPlayerProps) => {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const router = useRouter();
  const confetti = useConfettiStore();

  const onEnd = async () => {
    try {
      if (completeOnEnd) {
        await axios.put(`/api/courses/${courseId}/chapters/${chapterId}/progress`, {
          isCompleted: true,
        });

        if (!nextChapterId) {
          confetti.onOpen();
        }

        toast.success('تم تحديث التقدم');
        router.refresh();

        if (nextChapterId) {
          router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
        }
      }
    } catch {
      toast.error('حدث خطأ ما');
    }
  };

  // Determine what type of video we're dealing with
  const isExternalVideo = videoUrl && isExternalVideoUrl(videoUrl);
  const hasVideoContent = playbackId || isExternalVideo;


  if (isLocked) {
    return (
      <div className="relative aspect-video">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-y-2 bg-slate-800 text-secondary">
          <Lock className="h-8 w-8" />
          <p className="text-sm font-arabic">هذا الفصل مقفل</p>
          <p className="text-xs text-center text-slate-400 font-arabic">
            يجب شراء الدورة للوصول إلى هذا المحتوى
          </p>
        </div>
      </div>
    );
  }

  if (!hasVideoContent) {
    return (
      <div className="relative aspect-video">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-y-2 bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-md">
          <Play className="h-8 w-8 text-slate-500" />
          <p className="text-sm text-slate-500 font-arabic">لا يوجد فيديو لهذا الفصل</p>
          <p className="text-xs text-slate-400 font-arabic">سيتم إضافة المحتوى قريباً</p>
        </div>
      </div>
    );
  }





  // Handle Mux videos (uploaded files)
  return (
    <div className="relative aspect-video">
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-secondary mx-auto mb-2" />
            <p className="text-sm text-secondary font-arabic">جاري تحميل الفيديو...</p>
        </div>
        </div>
      )}

      <div style={{  paddingTop: '56.25%' }}>
                <iframe 
                  src={`${videoUrl}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`}
                  loading="lazy"
                  style={{ 
                    border: 0,
                    position: 'absolute',
                    top: 0,
                    height: '100%',
                    width: '100%'
                  }}
                  allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture"
                  allowFullScreen={true}
                />
                </div>
    </div>
  );
};
