import { Prisma } from '@prisma/client';
import { BookOpen, Award, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { NavbarRoutes } from '@/components/navbar-routes';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

type CourseNavbarProps = { course: Prisma.CourseGetPayload<{ include: { chapters: { include: { userProgress: true } } } }>;
  progressCount: number;
};

export default function CourseNavbar({ course, progressCount }: CourseNavbarProps) {
  const completedChapters = course.chapters.filter(chapter =>
    chapter.userProgress?.[0]?.isCompleted
  ).length;

  const totalChapters = course.chapters.length;

  return (
    <div className="flex h-full items-center justify-between border-b border-border/50 bg-background/95 backdrop-blur-sm px-4 shadow-sm">
      {/* Left side - Course info and back button */}
      <div className="flex items-center gap-4">
        {/* Back to Dashboard */}
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2 font-arabic">
            <ArrowLeft className="h-4 w-4 rotate-180" />
            العودة للوحة التحكم
          </Button>
        </Link>

        {/* Course info */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <div className="hidden sm:flex flex-col">
            <h2 className="text-sm font-semibold text-foreground font-arabic truncate max-w-[200px]">
              {course.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-arabic">{completedChapters} من {totalChapters} فصل</span>
              {progressCount === 100 && (
                <div className="flex items-center gap-1 text-green-600">
                  <Award className="h-3 w-3" />
                  <span className="font-arabic">مكتمل</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Center - Progress indicator */}
      <div className="hidden lg:flex items-center gap-3 flex-1 max-w-md mx-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground font-arabic">التقدم</span>
            <span className="text-xs font-medium text-foreground">{progressCount}%</span>
          </div>
          <Progress value={progressCount} className="h-2" />
        </div>
      </div>

      {/* Right side - Navigation routes */}
      <div className="flex items-center gap-2">
        {/* Mobile back button */}
        <Link href="/dashboard" className="md:hidden">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Button>
        </Link>
        <NavbarRoutes />
      </div>
    </div>
  );
}
