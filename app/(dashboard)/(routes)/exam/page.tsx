import { redirect } from 'next/navigation';
import { Clock, File, FileQuestion, BookOpen, Target, TrendingUp, Users } from 'lucide-react';

import { ExamCard } from './_components/exam-card';
import { CourseCards } from './_components/course-cards';
import { getExams } from '@/actions/get-exams';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getCourses } from '@/actions/get-courses';
import { PageProtection } from '@/components/page-protection';
import { getCurrentUser } from '@/lib/auth-helpers';
import { IconBadge } from '@/components/icon-badge';

interface PageProps {
  searchParams: {
    courseId?: string;
    chapterId?: string;
  };
}

export default async function ExamPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  const result = await getExams({
    userId: user.id,
    courseId: searchParams.courseId,
    chapterId: searchParams.chapterId,
  });
  const exams = result?.exams ? result.exams : [];

  const courses = await getCourses({
    userId: user.id,
    ...searchParams,
  });

  // Calculate statistics
  const totalQuestions = exams.reduce((total, exam) => total + (exam._count?.questions || 0), 0);
  const availableExams = exams.length;
  const activeCourses = courses.length;

  return (
    <PageProtection requiredPermission="canAccessExams">
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background" dir="rtl">
        {/* Glassy decorative elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute right-10 top-20 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/5 blur-3xl" />
          <div
            className="absolute bottom-1/4 left-20 h-80 w-80 animate-pulse rounded-full bg-gradient-to-br from-purple-500/8 to-pink-500/4 blur-3xl"
            style={{ animationDelay: '2s' }}
          />
          <div
            className="absolute right-1/3 top-1/2 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-green-500/8 to-emerald-500/4 blur-3xl"
            style={{ animationDelay: '4s' }}
          />
        </div>

        <div className="relative z-10 space-y-8 p-6">
          {/* Header Section */}
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 p-4 backdrop-blur-sm border border-blue-500/20 shadow-lg">
              <FileQuestion className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
        <div>
              <h1 className="text-4xl font-bold text-foreground font-arabic bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text">
                الامتحانات
              </h1>
              <p className="text-lg text-muted-foreground font-arabic mt-1">
            اختبر معلوماتك مع امتحانات المقررات بتاعتك
          </p>
        </div>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="group relative overflow-hidden border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-card/80 to-indigo-500/5 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-foreground font-arabic">الامتحانات المتاحة</CardTitle>
                <div className="rounded-lg bg-blue-500/20 p-2.5 backdrop-blur-sm border border-blue-500/30">
                  <FileQuestion className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold text-foreground font-arabic">{availableExams}</div>
                <p className="mt-1 text-sm text-muted-foreground font-arabic">
                  {availableExams === 0 ? 'لا توجد امتحانات' : 'امتحان متاح للحل'}
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border border-green-500/20 bg-gradient-to-br from-green-500/10 via-card/80 to-emerald-500/5 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-foreground font-arabic">الكورسات النشطة</CardTitle>
                <div className="rounded-lg bg-green-500/20 p-2.5 backdrop-blur-sm border border-green-500/30">
                  <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold text-foreground font-arabic">{activeCourses}</div>
                <p className="mt-1 text-sm text-muted-foreground font-arabic">
                  {activeCourses === 0 ? 'لا توجد كورسات' : 'كورس مسجل'}
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-card/80 to-pink-500/5 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-foreground font-arabic">إجمالي الأسئلة</CardTitle>
                <div className="rounded-lg bg-purple-500/20 p-2.5 backdrop-blur-sm border border-purple-500/30">
                  <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold text-foreground font-arabic">{totalQuestions}</div>
                <p className="mt-1 text-sm text-muted-foreground font-arabic">
                  {totalQuestions === 0 ? 'لا توجد أسئلة' : 'سؤال للممارسة'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Course Filter Section */}
          <Card className="group relative overflow-hidden border border-border/50 bg-card/60 backdrop-blur-xl shadow-lg transition-all duration-300 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-muted/5 via-transparent to-muted/10" />
            <CardHeader className="relative border-b border-border/50 bg-muted/20 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <IconBadge icon={BookOpen} variant="info" size="sm" />
                <div>
                  <CardTitle className="text-xl font-semibold text-foreground font-arabic">تصفية حسب الكورس</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground font-arabic mt-1">
                    اختر الكورس لعرض امتحاناته المتاحة
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative p-6">
              <CourseCards courses={courses} currentCourseId={searchParams.courseId} />
            </CardContent>
          </Card>

          {/* Exams Display Section */}
          <Card className="group relative overflow-hidden border border-border/50 bg-card/60 backdrop-blur-xl shadow-lg transition-all duration-300 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-muted/5 via-transparent to-muted/10" />
            <CardHeader className="relative border-b border-border/50 bg-muted/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <IconBadge icon={FileQuestion} variant="success" size="sm" />
                  <div>
                    <CardTitle className="text-xl font-semibold text-foreground font-arabic">الامتحانات المتاحة</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground font-arabic mt-1">
                      {exams.length > 0 
                        ? `${exams.length} امتحان متاح للحل` 
                        : 'لا توجد امتحانات متاحة حالياً'
                      }
                    </CardDescription>
                  </div>
                </div>
                {searchParams.courseId && (
                  <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary font-arabic">
                    مفلتر حسب الكورس
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="relative p-6">
              {exams.length === 0 ? (
                <div className="flex h-64 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-gradient-to-br from-muted/20 to-muted/10 backdrop-blur-sm text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm border border-border/30 mb-4">
                    <FileQuestion className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground font-arabic mb-2">مفيش امتحانات متاحة</h3>
                  <p className="text-sm text-muted-foreground font-arabic max-w-md">
                    {searchParams.courseId 
                      ? 'لا توجد امتحانات متاحة للكورس المحدد حالياً'
                      : 'حالياً مفيش امتحانات متاحة للكورسات بتاعتك'
                    }
                  </p>
                  {searchParams.courseId && (
                    <Button 
                      variant="outline" 
                      className="mt-4 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-muted/50 font-arabic"
                      onClick={() => window.location.href = '/exam'}
                    >
                      عرض جميع الامتحانات
                    </Button>
                  )}
              </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {exams.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} />
                ))}
              </div>
            )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageProtection>
  );
}
