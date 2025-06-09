'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronDown,
  ChevronUp,
  PlayCircle,
  CheckCircle,
  Lock,
  List,
  Clock,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

type Chapter = {
  id: string;
  title: string;
  position: number;
  isFree: boolean;
  videoUrl: string | null;
  userProgress?: { isCompleted: boolean }[];
};

type CoursePlaylistProps = {
  courseId: string;
  courseTitle: string;
  chapters: Chapter[];
  currentChapterId: string;
  progressCount: number;
  hasPurchase: boolean;
};

export const CoursePlaylist = ({
  courseId,
  courseTitle,
  chapters,
  currentChapterId,
  progressCount,
  hasPurchase
}: CoursePlaylistProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const completedChapters = chapters.filter(chapter =>
    chapter.userProgress?.[0]?.isCompleted
  ).length;

  const currentChapterIndex = chapters.findIndex(ch => ch.id === currentChapterId);

  const handleChapterClick = (chapterId: string, isLocked: boolean) => {
    if (!isLocked) {
      router.push(`/courses/${courseId}/chapters/${chapterId}`);
    }
  };

  return (
    <Card className="w-full border-border/50 bg-card/60 shadow-lg backdrop-blur-sm">
      {/* Playlist Header */}
      <div className="border-b border-border/30 bg-gradient-to-r from-muted/50 to-muted/30">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex-shrink-0">
              <List className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground font-arabic truncate">
                {courseTitle}
              </h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="font-arabic">
                  {currentChapterIndex + 1} من {chapters.length}
                </span>
                <div className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  <span className="font-arabic">{completedChapters} مكتمل</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress and Toggle */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-20">
                <Progress value={progressCount} className="h-2" />
              </div>
              <span className="text-sm font-medium text-foreground min-w-[3rem]">
                {progressCount}%
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Progress Bar */}
        <div className="sm:hidden px-4 pb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground font-arabic">التقدم</span>
            <span className="text-xs font-medium text-foreground">{progressCount}%</span>
          </div>
          <Progress value={progressCount} className="h-2" />
        </div>
      </div>

      {/* Chapters List */}
      {isExpanded && (
        <CardContent className="p-0">
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {chapters.map((chapter, index) => {
              const isCompleted = !!chapter.userProgress?.[0]?.isCompleted;
              const isLocked = !chapter.isFree && !hasPurchase;
              const isActive = chapter.id === currentChapterId;

              return (
                <button
                  key={chapter.id}
                  onClick={() => handleChapterClick(chapter.id, isLocked)}
                  disabled={isLocked}
                  className={cn(
                    'w-full p-4 text-right transition-all duration-200 border-b border-border/20 last:border-b-0',
                    'hover:bg-muted/30 focus:outline-none focus:bg-muted/30',
                    {
                      'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-700/50': isActive && !isCompleted,
                      'bg-green-50/50 dark:bg-green-900/20 border-green-200/50 dark:border-green-700/50': isCompleted,
                      'opacity-60 cursor-not-allowed': isLocked,
                    }
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Chapter Number */}
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold flex-shrink-0',
                      {
                        'bg-muted text-muted-foreground': !isActive && !isCompleted && !isLocked,
                        'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200': isActive && !isCompleted,
                        'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200': isCompleted,
                        'bg-gray-200 text-gray-500': isLocked,
                      }
                    )}>
                      {index + 1}
                    </div>

                    {/* Chapter Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {/* Status Icon */}
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        ) : isLocked ? (
                          <Lock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        ) : (
                          <PlayCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        )}

                        {/* Chapter Title */}
                        <span className={cn(
                          'font-medium font-arabic truncate text-sm',
                          {
                            'text-foreground': !isLocked,
                            'text-muted-foreground': isLocked,
                            'text-blue-700 dark:text-blue-300': isActive && !isCompleted,
                            'text-green-700 dark:text-green-300': isCompleted,
                          }
                        )}>
                          {chapter.title}
                        </span>
                      </div>

                      {/* Chapter Meta */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="font-arabic">
                          {isCompleted ? 'مكتمل' : isLocked ? 'مقفل' : 'متاح'}
                        </span>
                        {chapter.videoUrl && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="font-arabic">فيديو</span>
                          </div>
                        )}
                        {isActive && (
                          <Badge variant="secondary" className="text-xs font-arabic">
                            الحالي
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Active Indicator */}
                    {isActive && (
                      <div className="w-1 h-8 rounded-full bg-blue-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
