'use client';

import axios from 'axios';
import MuxPlayer from '@mux/mux-player-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, ExternalLink, Play } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useConfettiStore } from '@/hooks/use-confetti';
import { Button } from '@/components/ui/button';
import { HlsPlayer } from './hls-player';

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

const isHlsUrl = (url: string): boolean => {
  return url.includes('.m3u8') || url.includes('application/vnd.apple.mpegurl');
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [muxUserIdPosition, setMuxUserIdPosition] = useState({ x: 20, y: 20 });
  const router = useRouter();
  const confetti = useConfettiStore();

  // Get current user for security watermark
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          const user = await response.json();
          setCurrentUserId(user?.id || null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  // Animate Mux player user ID position
  useEffect(() => {
    if (!currentUserId) return;

    const animateMuxUserId = () => {
      const newX = 20 + Math.random() * 200; // Random position within reasonable bounds
      const newY = 20 + Math.random() * 100;
      setMuxUserIdPosition({ x: newX, y: newY });
    };

    // Initial position
    animateMuxUserId();

    // Set up random movement every 8-15 seconds
    const interval = setInterval(() => {
      animateMuxUserId();
    }, 8000 + Math.random() * 7000);

    return () => clearInterval(interval);
  }, [currentUserId]);

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

  const handleVideoLoad = () => {
    setIsReady(true);
    setHasError(false);
  };

  const handleVideoError = () => {
    setHasError(true);
    setIsReady(false);
    toast.error('فشل تحميل الفيديو');
  };

  // Determine what type of video we're dealing with
  const isExternalVideo = videoUrl && isExternalVideoUrl(videoUrl);
  const isHlsVideo = videoUrl && isHlsUrl(videoUrl);
  const hasVideoContent = playbackId || isExternalVideo || isHlsVideo;

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

  if (hasError) {
    return (
      <div className="relative aspect-video">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-y-2 bg-red-50 dark:bg-red-900/20 border-2 border-dashed border-red-300 dark:border-red-600 rounded-md">
          <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full">
            <Play className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-sm text-red-600 dark:text-red-400 font-arabic">فشل تحميل الفيديو</p>
          <p className="text-xs text-red-500 dark:text-red-400 font-arabic text-center">
            يرجى المحاولة مرة أخرى أو التواصل مع الدعم
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
          >
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  // Handle HLS videos
  if (isHlsVideo) {
    return (
      <div className="relative aspect-video">
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-secondary mx-auto mb-2" />
              <p className="text-sm text-secondary font-arabic">جاري تحميل الفيديو...</p>
            </div>
          </div>
        )}
        <HlsPlayer
          src="https://vz-b03aa0d4-ecc.b-cdn.net/6cec8f1c-1c7a-4bde-85ca-379b6a9ba097/playlist.m3u8"
          onCanPlay={handleVideoLoad}
          onError={handleVideoError}
          onEnded={onEnd}
          title={title}
          userId={currentUserId || undefined}
        />
      </div>
    );
  }

  // Handle Mux videos (uploaded files)
  if (playbackId) {
    return (
      <div className="relative aspect-video">
        {!isReady && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-secondary mx-auto mb-2" />
              <p className="text-sm text-secondary font-arabic">جاري تحميل الفيديو...</p>
            </div>
          </div>
        )}
                 <div className="relative">
           <MuxPlayer
             className={cn(!isReady && 'hidden')}
             playbackId={playbackId}
             onCanPlay={() => setIsReady(true)}
             onEnded={onEnd}
             autoPlay={false}
             onError={handleVideoError}
           />
           {/* Floating User ID for Security - Mux Player */}
           {currentUserId && (
             <div
               className="absolute pointer-events-none select-none z-20 transition-all duration-[8000ms] ease-in-out"
               style={{
                 left: `${muxUserIdPosition.x}px`,
                 top: `${muxUserIdPosition.y}px`,
                 opacity: 0.7,
               }}
             >
               <div className="bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                 <span className="text-white text-sm font-mono font-medium">
                   ID: {currentUserId}
                 </span>
               </div>
             </div>
           )}
         </div>
      </div>
    );
  }

  // Handle external videos (iframe)
  if (isExternalVideo) {
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

        <div style={{ paddingTop: '56.25%' }}>
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
            onLoad={() => setIsReady(true)}
          />
        </div>
      </div>
    );
  }

  return null;
};
