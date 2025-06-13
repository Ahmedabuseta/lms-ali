'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BookOpen, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseCardsProps {
  courses: any[];
  currentCourseId?: string;
}

export function CourseCards({ courses, currentCourseId }: CourseCardsProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true once component mounts to avoid hydration mismatches
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCourseClick = (courseId?: string) => {
    if (courseId) {
      router.push(`/exam?courseId=${courseId}`);
    } else {
      router.push('/exam');
    }
  };

  // Show skeleton during SSR to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {/* All courses skeleton */}
        <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-4 text-center transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/5 via-transparent to-muted/10" />
          <div className="relative flex h-16 w-full items-center justify-center mb-3">
            <div className="rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 p-3 backdrop-blur-sm border border-blue-500/20">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h3 className="font-medium text-foreground font-arabic">جميع الكورسات</h3>
        </div>

        {/* Course skeletons */}
        {courses.map((course) => (
          <div
            key={course.id}
            className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-4 text-center transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-muted/5 via-transparent to-muted/10" />
            <div className="relative flex h-16 w-full items-center justify-center mb-3">
              <div className="rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-3 backdrop-blur-sm border border-green-500/20">
                <GraduationCap className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-foreground font-arabic line-clamp-2">{course.title}</h3>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {/* All courses card */}
      <div
        onClick={() => handleCourseClick()}
        className={cn(
          'group relative overflow-hidden rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-4 text-center transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-lg',
          !currentCourseId && 'border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 shadow-lg shadow-blue-500/10',
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-muted/5 via-transparent to-muted/10" />
        {!currentCourseId && (
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        )}
        <div className="relative flex h-16 w-full items-center justify-center mb-3">
          <div className={cn(
            'rounded-full p-3 backdrop-blur-sm border transition-all duration-300',
            !currentCourseId 
              ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-500/30' 
              : 'bg-gradient-to-br from-muted/30 to-muted/20 border-border/30 group-hover:from-blue-500/20 group-hover:to-indigo-500/20 group-hover:border-blue-500/30'
          )}>
            <BookOpen className={cn(
              'h-6 w-6 transition-colors duration-300',
              !currentCourseId 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400'
            )} />
          </div>
        </div>
        <h3 className={cn(
          'font-medium font-arabic transition-colors duration-300',
          !currentCourseId 
            ? 'text-blue-700 dark:text-blue-300' 
            : 'text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-300'
        )}>
          جميع الكورسات
        </h3>
      </div>

      {/* Course cards */}
      {courses.map((course) => (
        <div
          key={course.id}
          onClick={() => handleCourseClick(course.id)}
          className={cn(
            'group relative overflow-hidden rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-4 text-center transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-lg',
            currentCourseId === course.id && 'border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5 shadow-lg shadow-green-500/10',
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-muted/5 via-transparent to-muted/10" />
          {currentCourseId === course.id && (
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
          )}
          <div className="relative flex h-16 w-full items-center justify-center mb-3">
            <div className={cn(
              'rounded-full p-3 backdrop-blur-sm border transition-all duration-300',
              currentCourseId === course.id 
                ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30' 
                : 'bg-gradient-to-br from-muted/30 to-muted/20 border-border/30 group-hover:from-green-500/20 group-hover:to-emerald-500/20 group-hover:border-green-500/30'
            )}>
              <GraduationCap className={cn(
                'h-6 w-6 transition-colors duration-300',
                currentCourseId === course.id 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-muted-foreground group-hover:text-green-600 dark:group-hover:text-green-400'
              )} />
            </div>
          </div>
          <h3 className={cn(
            'text-sm font-medium font-arabic line-clamp-2 transition-colors duration-300',
            currentCourseId === course.id 
              ? 'text-green-700 dark:text-green-300' 
              : 'text-foreground group-hover:text-green-700 dark:group-hover:text-green-300'
          )}>
            {course.title}
          </h3>
        </div>
      ))}
    </div>
  );
}
