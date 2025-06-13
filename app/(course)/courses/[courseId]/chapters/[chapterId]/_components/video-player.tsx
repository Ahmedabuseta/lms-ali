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

// Helper functions for video URL handling
const getYouTubeEmbedUrl = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0&modestbranding=1` : null;
};

const getVimeoEmbedUrl = (url: string): string | null => {
  const regex = /vimeo\.com\/(\d+)/;
  const match = url.match(regex);
  return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=0&title=0&byline=0&portrait=0` : null;
};

const getDailymotionEmbedUrl = (url: string): string | null => {
  const regex = /dailymotion\.com\/video\/([a-zA-Z0-9]+)/;
  const match = url.match(regex);
  return match ? `https://www.dailymotion.com/embed/video/${match[1]}?autoplay=0` : null;
};

const isExternalVideoUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return (
      hostname.includes('youtube.com') ||
      hostname.includes('youtu.be') ||
      hostname.includes('vimeo.com') ||
      hostname.includes('dailymotion.com')
    );
  } catch {
    return false;
  }
};

const getVideoType = (url: string): string => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('vimeo.com')) return 'Vimeo';
  if (url.includes('dailymotion.com')) return 'Dailymotion';
  return 'خارجي';
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

  // Get appropriate embed URL for external videos
  const getEmbedUrl = (url: string): string | null => {
    return (
      getYouTubeEmbedUrl(url) ||
      getVimeoEmbedUrl(url) ||
      getDailymotionEmbedUrl(url) ||
      (url.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i) ? url : null)
    );
  };

  const embedUrl = isExternalVideo ? getEmbedUrl(videoUrl!) : null;

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

  // Handle external videos (YouTube, Vimeo, etc.)
  if (isExternalVideo && embedUrl) {
    return (
      <div className="relative aspect-video">
        {/* Video info header */}
        <div className="absolute top-2 left-2 right-2 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-black/70 text-white px-3 py-1 rounded-lg text-xs">
              <ExternalLink className="h-3 w-3" />
              <span className="font-arabic">{getVideoType(videoUrl!)}</span>
            </div>
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black/70 text-white px-3 py-1 rounded-lg text-xs hover:bg-black/90 transition-colors font-arabic"
            >
              فتح في تبويب جديد
            </a>
          </div>
        </div>

        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full rounded-md"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          onLoad={() => setIsReady(true)}
          onError={() => setHasError(true)}
        />

        {!isReady && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-secondary mx-auto mb-2" />
              <p className="text-sm text-secondary font-arabic">جاري تحميل الفيديو...</p>
            </div>
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
            <div className="text-center text-secondary">
              <ExternalLink className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-arabic mb-2">فشل في تحميل الفيديو</p>
              <Button
                onClick={() => window.open(videoUrl, '_blank')}
                variant="secondary"
                size="sm"
                className="font-arabic"
              >
                مشاهدة في الموقع الأصلي
              </Button>
            </div>
          </div>
        )}

        {/* Progress tracking button for external videos */}
        {completeOnEnd && isReady && (
          <div className="absolute bottom-2 right-2">
            <Button
              onClick={onEnd}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white font-arabic"
            >
              وضع علامة كمكتمل
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Handle direct video files
  if (isExternalVideo && videoUrl?.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)) {
    return (
      <div className="relative aspect-video">
        <video
          src={videoUrl}
          title={title}
          className="w-full h-full rounded-md"
          controls
          onLoadedData={() => setIsReady(true)}
          onError={() => setHasError(true)}
          onEnded={onEnd}
        />

        {!isReady && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
            <div className="text-center text-secondary">
              <Play className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-arabic">فشل في تحميل الفيديو</p>
            </div>
          </div>
        )}
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

        <MuxPlayer
          title={title}
          className={cn(!isReady && 'hidden')}
          onCanPlay={() => setIsReady(true)}
          onEnded={onEnd}
          autoPlay
          playbackId={playbackId}
        />
    </div>
  );
};
