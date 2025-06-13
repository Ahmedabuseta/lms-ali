import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import {
  BookOpen,
  Clock,
  Users,
  Award,
  PlayCircle,
  CheckCircle,
  Lock,
  Star,
  Calendar,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getProgress } from '@/actions/get-progress';
import { Preview } from '@/components/preview';
import { CourseProgress } from '@/components/course-progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser, canAccessChapterContent } from '@/lib/user';
import { getChapterAccessInfo } from '@/actions/can-access-next-chapter';

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  const session = await auth.api.getSession({
    headers: headers(),
  });

  if (!session) {
    return redirect('/sign-in');
  }

  const userId = session.user.id;

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
    return redirect('/');
  }

  const progressCount = await getProgress(userId, course.id);



  const completedChapters = course.chapters.filter(chapter =>
    chapter.userProgress?.[0]?.isCompleted
  ).length;

  const totalChapters = course.chapters.length;
  const firstChapter = course.chapters[0];

  // Get current user for access checking
  const currentUser = await getCurrentUser();

  // Pre-calculate chapter access for all chapters
  const chapterAccess = currentUser ? await Promise.all(
    course.chapters.map(chapter => canAccessChapterContent(currentUser, chapter.id))
  ) : course.chapters.map(() => false);

  // Get chapter progression access (based on quiz completion)
  const chapterProgressionAccess = await getChapterAccessInfo(userId, course.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background" dir="rtl">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-10 top-20 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-blue-500/8 to-indigo-500/4 dark:from-blue-400/8 dark:to-indigo-400/4 blur-3xl" />
        <div className="absolute bottom-1/4 left-20 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-purple-500/8 to-pink-500/4 dark:from-purple-400/8 dark:to-pink-400/4 blur-3xl" />
      </div>

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
                  <Link href={`/courses/${course.id}/chapters/${firstChapter.id}`}>
                    <Button size="lg" className="w-full font-arabic">
                      <PlayCircle className="h-5 w-5 ml-2" />
                      {progressCount > 0 ? 'متابعة التعلم' : 'بدء الدورة'}
                    </Button>
                  </Link>
                )}
                <Link href={`/courses/${course.id}/practice`}>
                  <Button variant="outline" size="lg" className="w-full font-arabic">
                    <Target className="h-5 w-5 ml-2" />
                    تدرب على الأسئلة
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full font-arabic">
                  <Calendar className="h-5 w-5 ml-2" />
                  إضافة إلى التقويم
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters List */}
        <div className="rounded-2xl border border-border/50 bg-card/60 p-8 shadow-lg backdrop-blur-sm">
          <div className="mb-6 flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-foreground font-arabic">فصول الدورة</h2>
          </div>

          <div className="space-y-3">
            {course.chapters.map((chapter, index) => {
              const isCompleted = !!chapter.userProgress?.[0]?.isCompleted;
              // Use pre-calculated access
              const hasAccess = chapterAccess[index];
              const canProgressToChapter = chapterProgressionAccess[chapter.id] !== false;
              const isLocked = !hasAccess || !canProgressToChapter;

              return (
                <Card key={chapter.id} className="border-border/50 bg-background/40 hover:bg-background/60 transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      {/* Chapter Number */}
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                        isCompleted
                          ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200'
                          : isLocked
                          ? 'bg-gray-200 text-gray-500'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
                      }`}>
                        {index + 1}
                      </div>

                      {/* Chapter Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : isLocked ? (
                            <Lock className="h-5 w-5 text-gray-400" />
                          ) : (
                            <PlayCircle className="h-5 w-5 text-blue-600" />
                          )}
                          <h3 className="font-semibold text-foreground font-arabic truncate">
                            {chapter.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="font-arabic">
                            {isCompleted ? 'مكتمل' : isLocked ? 'مقفل' : 'متاح'}
                          </span>
                          {isLocked && hasAccess && !canProgressToChapter && (
                            <Badge variant="destructive" className="text-xs font-arabic">
                              يتطلب إكمال الفصل السابق
                            </Badge>
                          )}
                          {chapter.videoUrl && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span className="font-arabic">فيديو</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div>
                        {!isLocked ? (
                          <Link href={`/courses/${course.id}/chapters/${chapter.id}`}>
                            <Button variant="ghost" size="sm" className="font-arabic">
                              {isCompleted ? 'مراجعة' : 'بدء'}
                            </Button>
                          </Link>
                        ) : (
                          <Button variant="ghost" size="sm" disabled className="font-arabic">
                            مقفل
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseIdPage;
