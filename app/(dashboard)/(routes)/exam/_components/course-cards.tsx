'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

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

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {/* All courses card */}
      <div
        onClick={() => handleCourseClick()}
        className={cn(
          'cursor-pointer rounded-lg border bg-card p-3 text-center transition-all hover:shadow-md',
          isClient && !currentCourseId && 'border-primary bg-primary/10',
        )}
      >
        <div className="flex h-16 w-full items-center justify-center">
          <span className="text-3xl">📚</span>
        </div>
        <h3 className="mt-2 font-medium">All Courses</h3>
      </div>

      {/* Course cards */}
      {courses.map((course) => (
        <div
          key={course.id}
          onClick={() => handleCourseClick(course.id)}
          className={cn(
            'cursor-pointer rounded-lg border bg-card p-3 text-center transition-all hover:shadow-md',
            isClient && currentCourseId === course.id && 'border-primary bg-primary/10',
          )}
        >
          <div className="flex h-16 w-full items-center justify-center">
            <span className="text-3xl">{course.icon || '📝'}</span>
          </div>
          <h3 className="mt-2 text-sm font-medium">{course.title}</h3>
        </div>
      ))}
    </div>
  );
}
