'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
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
  className = "",
  title = "عرض توضيحي للمنصة",
  description = "اكتشف جميع الميزات والوظائف"
}: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
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
    if (video && src) {
      setIsLoading(true);
      setHasError(false);

      // Check if HLS is supported natively (Safari)
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        setIsLoading(false);
        setCurrentQuality('Auto (Safari)');
      } else if (typeof window !== 'undefined') {
        // Use hls.js for other browsers
        import('hls.js').then((Hls) => {
          if (Hls.default.isSupported()) {
            if (hlsRef.current) {
              hlsRef.current.destroy();
            }

            const hls = new Hls.default({
              enableWorker: true,
              lowLatencyMode: false,
              backBufferLength: 90,
              // Configure to prefer stable quality over highest quality
              abrEwmaDefaultEstimate: 500000, // Start with lower estimate
              abrEwmaSlowVoD: 3,
              abrEwmaFastVoD: 3,
              abrMaxWithRealBitrate: false,
              maxLoadingDelay: 4,
              maxBufferLength: 30,
              maxBufferSize: 60 * 1000 * 1000, // 60MB
              // Force quality selection based on complete segments
              startLevel: -1, // Let HLS.js choose initially
              capLevelToPlayerSize: false,
              debug: false
            });
            
            hlsRef.current = hls;
            hls.loadSource(src);
            hls.attachMedia(video);

            hls.on(Hls.default.Events.MANIFEST_PARSED, (event: any, data: any) => {
              setIsLoading(false);
              console.log('HLS manifest loaded successfully');
              console.log('Available levels:', data.levels);
              
              // Find the level with most segments (likely 480p with complete video)
              let bestLevel = -1;
              let maxSegments = 0;
              
              data.levels.forEach((level: any, index: number) => {
                console.log(`Level ${index}: ${level.width}x${level.height}, bitrate: ${level.bitrate}`);
                if (level.details && level.details.segments && level.details.segments.length > maxSegments) {
                  maxSegments = level.details.segments.length;
                  bestLevel = index;
                }
              });
              
              // If we found a complete level, prefer it
              if (bestLevel >= 0) {
                console.log(`Setting preferred level to ${bestLevel} with ${maxSegments} segments`);
                hls.currentLevel = bestLevel;
                const level = data.levels[bestLevel];
                setCurrentQuality(`${level.height}p (${Math.round(level.bitrate/1000)}k)`);
              }
            });

            hls.on(Hls.default.Events.LEVEL_SWITCHED, (event: any, data: any) => {
              const level = hls.levels[data.level];
              setCurrentQuality(`${level.height}p (${Math.round(level.bitrate/1000)}k)`);
              console.log(`Switched to quality: ${level.height}p`);
            });

            hls.on(Hls.default.Events.ERROR, (event: any, data: any) => {
              console.error('HLS error:', data);
              if (data.fatal) {
                switch (data.type) {
                  case Hls.default.ErrorTypes.NETWORK_ERROR:
                    console.log('Network error, trying to recover...');
                    hls.startLoad();
                    break;
                  case Hls.default.ErrorTypes.MEDIA_ERROR:
                    console.log('Media error, trying to recover...');
                    hls.recoverMediaError();
                    break;
                  default:
                    setIsLoading(false);
                    setHasError(true);
                    hls.destroy();
                    break;
                }
              }
            });

            // Monitor buffer and quality
            hls.on(Hls.default.Events.FRAG_LOADED, (event: any, data: any) => {
              console.log(`Loaded fragment: ${data.frag.url}`);
            });

          } else {
            setIsLoading(false);
            setHasError(true);
          }
        }).catch(() => {
          setIsLoading(false);
          setHasError(true);
        });
      }

      if (video) {
        const handleLoadedData = () => {
          setIsLoading(false);
          setDuration(video.duration);
        };
        
        const handleError = () => {
          setIsLoading(false);
          setHasError(true);
        };

        const handleTimeUpdate = () => {
          if (video.duration) {
            setProgress((video.currentTime / video.duration) * 100);
          }
        };

        const handleLoadedMetadata = () => {
          setDuration(video.duration);
        };

        video.addEventListener('loadeddata', handleLoadedData);
        video.addEventListener('error', handleError);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);

        return () => {
          video.removeEventListener('loadeddata', handleLoadedData);
          video.removeEventListener('error', handleError);
          video.removeEventListener('timeupdate', handleTimeUpdate);
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((error) => {
          console.error('Error playing video:', error);
          setHasError(true);
        });
      }
      setIsPlaying(!isPlaying);
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
        videoRef.current.requestFullscreen().catch((error) => {
          console.error('Error entering fullscreen:', error);
        });
      }
    }
  };

  const handleVideoClick = () => {
    togglePlay();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Force 480p quality (which has complete video)
  const force480p = () => {
    if (hlsRef.current && hlsRef.current.levels) {
      // Find 480p level
      const level480p = hlsRef.current.levels.findIndex((level: any) => level.height === 480);
      if (level480p >= 0) {
        hlsRef.current.currentLevel = level480p;
        setCurrentQuality('480p (Forced)');
        console.log('Forced 480p quality');
      }
    }
  };

  if (hasError) {
    return (
      <div className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-1 shadow-2xl max-w-4xl max-h-[600px] mx-auto ${className}`}>
        <div className="overflow-hidden rounded-xl bg-black">
          <div className="relative flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 min-h-[200px] max-h-[600px]">
            <div className="text-center">
              <div className="mb-4 h-16 w-16 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <Play className="h-8 w-8 text-white ml-1" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-arabic font-medium">
                عذراً، لا يمكن تحميل الفيديو
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-arabic mt-2">
                يرجى المحاولة مرة أخرى لاحقاً
              </p>
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
      onMouseLeave={() => setShowControls(isPlaying ? false : true)}
    >
      <div className="overflow-hidden rounded-xl bg-black">
        <div className="relative">
          <video
            ref={videoRef}
            poster={poster}
            className="w-full h-auto cursor-pointer max-w-4xl max-h-[600px] mx-auto"
            onClick={handleVideoClick}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            preload="metadata"
            playsInline
            muted
            controls={false}
          />
          
          {/* Video Controls Overlay */}
          <div 
            className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Center Play Button */}
            {!isPlaying && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  size="lg"
                  onClick={togglePlay}
                  className="h-20 w-20 rounded-full bg-white/90 text-blue-600 shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white dark:bg-gray-800/90"
                >
                  <Play className="h-10 w-10 ml-1" />
                </Button>
              </div>
            )}

            {/* Bottom Controls */}
            {!isLoading && (
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
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
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
                        className="h-8 px-2 rounded bg-black/50 text-white hover:bg-black/70 text-xs"
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
            )}

            {/* Video Title Overlay */}
            {!isLoading && (
              <div className="absolute top-4 left-4 right-4">
                <div className="rounded-lg bg-black/50 p-3 backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-white font-arabic">{title}</h3>
                  <p className="text-sm text-gray-200 font-arabic">{description}</p>
                  {currentQuality && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-xs text-gray-300">جودة: {currentQuality}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 min-h-[200px] max-h-[600px]">
              <div className="text-center">
                <div className="mb-4 h-16 w-16 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center animate-pulse">
                  <Play className="h-8 w-8 text-white ml-1" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-arabic font-medium">
                  جاري تحميل الفيديو...
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-arabic mt-1">
                  تحضير جميع مستويات الجودة
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};