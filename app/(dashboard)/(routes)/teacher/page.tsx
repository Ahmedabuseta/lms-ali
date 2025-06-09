import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Users,
  FileQuestion,
  MemoryStick,
  TrendingUp,
  Eye,
  Plus,
  Settings,
  BarChart3,
  DollarSign,
  CheckCircle,
  Clock,
  Activity,
} from 'lucide-react';
import { db } from '@/lib/db';
import { getAnalytics } from '@/actions/get-analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconBadge } from '@/components/icon-badge';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

const TeacherDashboard = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect('/');
  }

  // Get analytics data
  const { data, totalRevenue, totalSales } = await getAnalytics(userId);

  // Get dashboard stats
  const [courses, users, recentActivity] = await Promise.all([
    db.course.findMany({
      include: {
        chapters: {
          include: {
            _count: {
              select: { userProgress: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    db.user.findMany({
      where: { role: 'STUDENT' },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    db.course.findMany({
      include: {
        chapters: {
          include: {
            userProgress: {
              orderBy: { updatedAt: 'desc' },
              take: 5,
            },
          },
        },
      },
      take: 3,
    }),
  ]);

  const publishedCourses = courses.filter((course) => course.isPublished).length;
  const totalStudents = users.length;
  const totalCourses = courses.length;

  return (
    <div className="min-h-screen space-y-8 bg-gradient-to-br from-background via-muted/30 to-background p-6">
      {/* Enhanced decorative elements for both themes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-10 top-20 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-primary/5 to-secondary/5 blur-3xl" />
        <div
          className="absolute bottom-1/4 left-20 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-accent/5 to-primary/5 blur-3xl"
          style={{ animationDelay: '2s' }}
         />
        <div
          className="absolute right-1/3 top-1/2 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-secondary/5 to-accent/5 blur-3xl"
          style={{ animationDelay: '4s' }}
         />
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">لوحة تحكم المدرس</h1>
          <p className="text-muted-foreground">مرحباً بك في لوحة تحكم المدرس - تابع أداء طلابك وإدارة دوراتك</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/teacher/analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              التحليلات المفصلة
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/teacher/create">
              <Plus className="mr-2 h-4 w-4" />
              دورة جديدة
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="relative z-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Card */}
        <Card className="relative overflow-hidden border-l-4 border-l-green-500 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:border-l-green-400">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/5 dark:from-green-400/10 dark:to-emerald-400/5" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">إجمالي الإيرادات</CardTitle>
            <IconBadge icon={DollarSign} variant="success" size="sm" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-foreground">{formatPrice(totalRevenue)}</div>
            <p className="mt-1 text-xs text-muted-foreground">من {totalSales} عملية بيع</p>
          </CardContent>
        </Card>

        {/* Courses Card */}
        <Card className="relative overflow-hidden border-l-4 border-l-blue-500 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:border-l-blue-400">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/5 dark:from-blue-400/10 dark:to-indigo-400/5" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">الدورات</CardTitle>
            <IconBadge icon={BookOpen} variant="info" size="sm" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-foreground">{totalCourses}</div>
            <p className="mt-1 text-xs text-muted-foreground">{publishedCourses} منشورة</p>
          </CardContent>
        </Card>

        {/* Students Card */}
        <Card className="relative overflow-hidden border-l-4 border-l-purple-500 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:border-l-purple-400">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-violet-500/5 dark:from-purple-400/10 dark:to-violet-400/5" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">الطلاب</CardTitle>
            <IconBadge icon={Users} variant="default" size="sm" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-foreground">{totalStudents}</div>
            <p className="mt-1 text-xs text-muted-foreground">إجمالي المسجلين</p>
          </CardContent>
        </Card>

        {/* Active Learning Card */}
        <Card className="relative overflow-hidden border-l-4 border-l-orange-500 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:border-l-orange-400">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/5 dark:from-orange-400/10 dark:to-amber-400/5" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">النشاط الأسبوعي</CardTitle>
            <IconBadge icon={Activity} variant="warning" size="sm" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-foreground">
              {recentActivity.reduce(
                (acc, course) =>
                  acc + course.chapters.reduce((chAcc: number, chapter: any) => chAcc + chapter.userProgress.length, 0),
                0,
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">تفاعل جديد</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="relative z-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group relative overflow-hidden border border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/5" />
          <CardContent className="relative p-6">
            <div className="mb-4 flex items-center space-x-4 rtl:space-x-reverse">
              <div className="rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 p-3 transition-all duration-300 group-hover:from-blue-500/30 group-hover:to-indigo-500/30">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  إدارة الدورات
                </h3>
                <p className="text-sm text-muted-foreground">إنشاء وتحرير الدورات</p>
              </div>
            </div>
            <Button
              asChild
              className="w-full border-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
            >
              <Link href="/teacher/courses">
                <Settings className="mr-2 h-4 w-4" />
                إدارة الدورات
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/5" />
          <CardContent className="relative p-6">
            <div className="mb-4 flex items-center space-x-4 rtl:space-x-reverse">
              <div className="rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 p-3 transition-all duration-300 group-hover:from-orange-500/30 group-hover:to-amber-500/30">
                <FileQuestion className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground transition-colors group-hover:text-orange-600 dark:group-hover:text-orange-400">
                  الاختبارات
                </h3>
                <p className="text-sm text-muted-foreground">إنشاء وإدارة الاختبارات</p>
              </div>
            </div>
            <Button
              asChild
              className="w-full border-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
            >
              <Link href="/teacher/exam">
                <FileQuestion className="mr-2 h-4 w-4" />
                إدارة الاختبارات
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/5" />
          <CardContent className="relative p-6">
            <div className="mb-4 flex items-center space-x-4 rtl:space-x-reverse">
              <div className="rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-3 transition-all duration-300 group-hover:from-green-500/30 group-hover:to-emerald-500/30">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground transition-colors group-hover:text-green-600 dark:group-hover:text-green-400">
                  المستخدمين
                </h3>
                <p className="text-sm text-muted-foreground">إدارة الطلاب والصلاحيات</p>
              </div>
            </div>
            <Button
              asChild
              className="w-full border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
            >
              <Link href="/teacher/users">
                <Users className="mr-2 h-4 w-4" />
                إدارة المستخدمين
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-violet-500/5" />
          <CardContent className="relative p-6">
            <div className="mb-4 flex items-center space-x-4 rtl:space-x-reverse">
              <div className="rounded-lg bg-gradient-to-br from-purple-500/20 to-violet-500/20 p-3 transition-all duration-300 group-hover:from-purple-500/30 group-hover:to-violet-500/30">
                <MemoryStick className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground transition-colors group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  البطاقات التعليمية
                </h3>
                <p className="text-sm text-muted-foreground">إدارة البطاقات التعليمية</p>
              </div>
            </div>
            <Button
              asChild
              className="w-full border-0 bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:from-purple-600 hover:to-violet-600"
            >
              <Link href="/teacher/flashcards">
                <MemoryStick className="mr-2 h-4 w-4" />
                إدارة البطاقات
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Courses & Activity */}
      <div className="relative z-10 grid gap-6 lg:grid-cols-2">
        {/* Recent Courses */}
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <IconBadge icon={BookOpen} variant="info" size="sm" />
                أحدث الدورات
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/teacher/courses">عرض الكل</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {courses.slice(0, 4).map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full',
                      course.isPublished ? 'bg-green-500 dark:bg-green-400' : 'bg-yellow-500 dark:bg-yellow-400',
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{course.title}</p>
                    <p className="text-xs text-muted-foreground">{course.chapters.length} فصل</p>
                  </div>
                </div>
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/teacher/courses/${course.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
            {courses.length === 0 && (
              <div className="py-8 text-center">
                <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">لا توجد دورات بعد</p>
                <Button asChild className="mt-4" size="sm">
                  <Link href="/teacher/create">إنشاء دورة جديدة</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <IconBadge icon={Activity} variant="warning" size="sm" />
              النشاط الأخير
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity
              .slice(0, 4)
              .map((course) =>
                course.chapters.map((chapter: any) =>
                  chapter.userProgress.slice(0, 2).map((progress: any) => (
                    <div
                      key={`${chapter.id}-${progress.userId}`}
                      className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'h-2 w-2 rounded-full',
                            progress.isCompleted ? 'bg-green-500 dark:bg-green-400' : 'bg-blue-500 dark:bg-blue-400',
                          )}
                        />
                        <div>
                          <p className="text-sm font-medium text-foreground">طالب</p>
                          <p className="text-xs text-muted-foreground">
                            {progress.isCompleted ? 'أكمل' : 'بدأ'} {chapter.title}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(progress.updatedAt).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                  )),
                ),
              )
              .flat()
              .slice(0, 5)}
            {recentActivity.every((course) =>
              course.chapters.every((chapter: any) => chapter.userProgress.length === 0),
            ) && (
              <div className="py-8 text-center">
                <Activity className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">لا يوجد نشاط حديث</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
