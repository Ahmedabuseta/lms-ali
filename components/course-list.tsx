'use client';

import { useEffect, useState } from 'react';
import CourseCard from '@/components/course-card';
import { CourseCardSkeleton } from '@/components/course-card-skeleton';

type CourseWithProgressWithCategory = { id: string;
  title: string;
  imageUrl: string | null;
  chaptersLength: number;
  price: number | null;
  progress: number | null;
  category: {
    name: string; } | null;
};

interface CoursesListProps { items: CourseWithProgressWithCategory[]; }

const CoursesList = ({ items }: CoursesListProps) => { const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timeout = setTimeout(() => {
      setIsLoading(false); }, 500); // Simulate loading for a short time for better UX

    return () => clearTimeout(timeout);
  }, []);

  // Show skeleton if not mounted or still loading
  if (!mounted || isLoading) { return (
      <div data-tour="course-cards">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <CourseCardSkeleton key={i } />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div data-tour="course-cards">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
        {items.map((item) => (
          <CourseCard
            key={item.id}
            id={item.id}
            title={item.title}
            imageUrl={item.imageUrl}
            chaptersLength={item.chaptersLength}
            price={item.price}
            progress={item.progress}
            category={item?.category?.name || null}
          />
        ))}
      </div>
      {items.length === 0 && <div className="mt-10 text-center text-sm text-muted-foreground">لا توجد دورات متاحة</div>}
    </div>
  );
};

export default CoursesList;
