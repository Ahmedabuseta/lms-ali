'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  title?: string;
  description?: string;
}

export const VideoPlayer = ({ 
  src, 
  poster, 
  className = '',
  title = 'عرض توضيحي للمنصة',
  description = 'اكتشف جميع الميزات والوظائف'
}: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentQuality, setCurrentQuality] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setIsLoading(true);
    setHasError(false);

    const initializeVideo = async () => {
      try {
        // Check if browser supports HLS natively (Safari)
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          setCurrentQuality('Auto (Safari)');
          setIsLoading(false);
          return;
        }

        // Use HLS.js for other browsers
        const Hls = (await import('hls.js')).default;
        
        if (Hls.isSupported()) {
          // Destroy existing HLS instance
          if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
          }

          // Create new HLS instance with CORS-friendly config
          const hls = new Hls({
            debug: false,
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90,
            maxBufferLength: 30,
            maxBufferSize: 60 * 1000 * 1000, // 60MB
            maxLoadingDelay: 4,
            startLevel: -1, // Auto-select level
            testBandwidth: false,
            abrEwmaDefaultEstimate: 1000000, // 1Mbps default estimate
            fragLoadingTimeOut: 30000, // Increased timeout
            manifestLoadingTimeOut: 20000, // Increased timeout
            // CORS configuration - try to handle cross-origin requests
            xhrSetup: function(xhr: XMLHttpRequest) {
              xhr.withCredentials = false; // Don't send credentials
            }
          });
            
          hlsRef.current = hls;
          
          // Set up event listeners
          hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            // Prefer 480p if available (it has the complete video)
            const level480p = data.levels.findIndex((level: any) => level.height === 480);
            if (level480p >= 0) {
              hls.currentLevel = level480p;
              const level = data.levels[level480p];
              setCurrentQuality(`${level.height}p`);
            } else if (data.levels.length > 0) {
              // Fallback to first available level
              const level = data.levels[0];
              setCurrentQuality(`${level.height}p`);
            }
            
            setIsLoading(false);
          });

          hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
            const level = hls.levels[data.level];
            setCurrentQuality(`${level.height}p`);
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            // Check if it's a CORS error
            if (data.details === 'manifestLoadError' && data.response?.code === 0) {
              setHasError(true);
              setIsLoading(false);
              return;
            }
            
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  if (data.details === 'manifestLoadError') {
                    setHasError(true);
                    setIsLoading(false);
                  } else {
                    hls.startLoad();
                  }
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  hls.recoverMediaError();
                  break;
                default:
                  setHasError(true);
                  setIsLoading(false);
                  hls.destroy();
                  hlsRef.current = null;
                  break;
              }
            }
          });

          // Load the source and attach to video
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          setHasError(true);
          setIsLoading(false);
        }
      } catch (error) {
        setHasError(true);
        setIsLoading(false);
      }
    };

    // Set up video event listeners
    const handleLoadedData = () => {
      setIsLoading(false);
      setDuration(video.duration);
    };
        
    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
    };

    const handleTimeUpdate = () => {
      if (video.duration > 0) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    // Add event listeners
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    // Initialize video
    initializeVideo();

    // Cleanup function
    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {
          setHasError(true);
        });
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen().catch(() => {
          // Handle fullscreen error silently
        });
      }
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const force480p = () => {
    if (hlsRef.current && hlsRef.current.levels) {
      const level480p = hlsRef.current.levels.findIndex((level: any) => level.height === 480);
      if (level480p >= 0) {
        hlsRef.current.currentLevel = level480p;
        setCurrentQuality('480p (Manual)');
      }
    }
  };

  if (hasError) {
    return (
      <div className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-1 shadow-2xl max-w-4xl max-h-[600px] mx-auto ${className}`}>
        <div className="overflow-hidden rounded-xl bg-black">
          <div className="relative flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 min-h-[300px]">
            <div className="text-center">
              <div className="mb-4 h-16 w-16 mx-auto rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                <Play className="h-8 w-8 text-white ml-1" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-arabic font-medium mb-2">
                عذراً، لا يمكن تحميل الفيديو
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-arabic">
                مشكلة في خادم الفيديو (CORS) - يرجى المحاولة لاحقاً
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-arabic mt-1">
                الخادم لا يسمح بتشغيل الفيديو من هذا النطاق
              </p>
              <Button
                onClick={() => {
                  setHasError(false);
                  setIsLoading(true);
                  // Trigger re-initialization
                  if (videoRef.current) {
                    videoRef.current.load();
                  }
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-700 font-arabic"
                size="sm"
              >
                إعادة المحاولة
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-1 shadow-2xl max-w-4xl max-h-[600px] mx-auto ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(!isPlaying)}
    >
      <div className="overflow-hidden rounded-xl bg-black">
        <div className="relative">
          <video
            ref={videoRef}
            poster={poster}
            className="w-full h-auto cursor-pointer max-h-[600px]"
            onClick={togglePlay}
            preload="none"
            playsInline
            muted={isMuted}
            crossOrigin="anonymous"
            controls={false}
          />
          
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50">
              <div className="text-center">
                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-600" />
                <p className="text-gray-600 dark:text-gray-300 font-arabic font-medium">
                  جاري تحميل الفيديو...
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-arabic mt-1">
                  تحضير المحتوى المرئي
                </p>
              </div>
            </div>
          )}
          
          {/* Video Controls Overlay */}
          {!isLoading && (
            <div 
              className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Center Play Button */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    size="lg"
                    onClick={togglePlay}
                    className="h-20 w-20 rounded-full bg-white/90 text-blue-600 shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white"
                  >
                    <Play className="h-10 w-10 ml-1" />
                  </Button>
                </div>
              )}

              {/* Bottom Controls */}
              <div className="absolute bottom-4 left-4 right-4">
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="h-1 bg-black/30 rounded-full">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={togglePlay}
                      className="h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={toggleMute}
                      className="h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    
                    {/* Quality Indicator */}
                    {currentQuality && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={force480p}
                        className="h-8 px-2 rounded bg-black/50 text-white hover:bg-black/70 text-xs font-mono"
                      >
                        {currentQuality}
                      </Button>
                    )}
                    
                    {duration > 0 && (
                      <span className="text-white text-sm font-mono">
                        {formatTime((progress / 100) * duration)} / {formatTime(duration)}
                      </span>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleFullscreen}
                    className="h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Video Title Overlay */}
              <div className="absolute top-4 left-4 right-4">
                <div className="rounded-lg bg-black/50 p-3 backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-white font-arabic">{title}</h3>
                  <p className="text-sm text-gray-200 font-arabic">{description}</p>
                  {currentQuality && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-xs text-gray-300 font-arabic">جودة: {currentQuality}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};