import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-helpers';
import { headers } from 'next/headers';
import { BookOpen,
  Clock,
  Users,
  Award,
  PlayCircle,
  CheckCircle,
  Lock,
  Star,
  Calendar,
  Target } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getProgress } from '@/actions/get-progress';
import { Preview } from '@/components/preview';
import { CourseProgress } from '@/components/course-progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { canAccessChapterContent } from '@/lib/user';
import { getChapterAccessInfo } from '@/actions/can-access-next-chapter';

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  // Use the updated auth system
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    return redirect('/sign-in');
  }

  const userId = currentUser.id;

  console.log('Fetching course with ID:', params.courseId);

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        include: {
          userProgress: {
            where: {
              userId,
            },
          },
        },
        orderBy: {
          position: 'asc',
        },
      },
      category: true,
    },
  });

  if (!course) {
    console.log('Course not found for ID:', params.courseId);
    console.log('Available courses:', await db.course.findMany({ select: { id: true, title: true, isPublished: true } }));
    
    // Instead of redirecting to home, redirect to courses list with error
    return redirect('/dashboard?error=course-not-found');
  }

  console.log('Course found:', course.title, 'Published:', course.isPublished);

  // Check if course is published
  if (!course.isPublished) {
    console.log('Course is not published:', course.title);
    return redirect('/dashboard?error=course-not-published');
  }

  const progressCount = await getProgress(userId, course.id);

  const completedChapters = course.chapters.filter(chapter =>
    chapter.userProgress?.[0]?.isCompleted
  ).length;

  const totalChapters = course.chapters.length;
  const firstChapter = course.chapters[0];

  // Pre-calculate chapter access for all chapters
  const chapterAccess = currentUser ? await Promise.all(
    course.chapters.map(chapter => canAccessChapterContent(currentUser, chapter.id))
  ) : course.chapters.map(() => false);

  // Get chapter progression access (based on quiz completion)
  const chapterProgressionAccess = await getChapterAccessInfo(userId, course.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950" dir="rtl">
      {/* Removed heavy decorative elements for performance */}

      <div className="relative z-10 mx-auto max-w-7xl p-6 space-y-8">
        {/* Course Header */}
        <div className="rounded-2xl border border-border/50 bg-gradient-to-r from-card/80 to-card/60 p-8 shadow-lg backdrop-blur-sm">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Course Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                {course.category && (
                  <Badge variant="secondary" className="mb-3 font-arabic">
                    {course.category.name}
                  </Badge>
                )}
                <h1 className="text-4xl font-bold text-foreground font-arabic leading-relaxed mb-4">
                  {course.title}
                </h1>
                {course.description && (
                  <div className="prose dark:prose-invert max-w-none font-arabic">
                    <Preview value={course.description} />
                  </div>
                )}
              </div>

              {/* Course Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-background/60 border border-border/30">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  <div>
                    <div className="text-lg font-bold text-foreground">{totalChapters}</div>
                    <div className="text-sm text-muted-foreground font-arabic">فصل</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-background/60 border border-border/30">
                  <Award className="h-6 w-6 text-green-600" />
                  <div>
                    <div className="text-lg font-bold text-foreground">{completedChapters}</div>
                    <div className="text-sm text-muted-foreground font-arabic">مكتمل</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-background/60 border border-border/30">
                  <Target className="h-6 w-6 text-purple-600" />
                  <div>
                    <div className="text-lg font-bold text-foreground">{progressCount}%</div>
                    <div className="text-sm text-muted-foreground font-arabic">التقدم</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-background/60 border border-border/30">
                  <Star className="h-6 w-6 text-yellow-600" />
                  <div>
                    <div className="text-lg font-bold text-foreground">4.8</div>
                    <div className="text-sm text-muted-foreground font-arabic">تقييم</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Card */}
            <div className="space-y-6">
              <Card className="border-border/50 bg-background/60">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold font-arabic">تقدمك في الدورة</h3>
                      <span className="text-2xl font-bold text-primary">{progressCount}%</span>
                    </div>
                    <CourseProgress variant="success" value={progressCount} />
                    <div className="text-sm text-muted-foreground font-arabic">
                      أكملت {completedChapters} من {totalChapters} فصل
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                {firstChapter && (
                  <Link href={`