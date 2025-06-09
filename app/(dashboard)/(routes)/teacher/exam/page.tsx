import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Clock,
  File,
  FileQuestion,
  MoreHorizontal,
  Pencil,
  ChevronRight,
  BookOpen,
  Users,
  BarChart3,
} from 'lucide-react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { IconBadge } from '@/components/icon-badge';
import { cn } from '@/lib/utils';

export default async function TeacherExamPage() {
  const { userId } = auth();

  if (!userId) {
    return redirect('/');
  }

  // Get all courses created by this teacher
  const courses = await db.course.findMany({
    include: {
      exams: {
        include: {
          _count: {
            select: { questions: true },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Group exams by course
  const coursesWithExams = courses.map((course) => ({
    ...course,
    examCount: course.exams.length,
  }));

  const totalExams = courses.reduce((acc, course) => acc + course.exams.length, 0);
  const publishedExams = courses.reduce(
    (acc, course) => acc + course.exams.filter((exam) => exam.isPublished).length,
    0,
  );

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
        <div className="flex items-center gap-3">
          <IconBadge icon={FileQuestion} variant="warning" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">إدارة الاختبارات</h1>
            <p className="text-muted-foreground">إنشاء وإدارة اختبارات دوراتك التعليمية</p>
          </div>
        </div>
        <Button asChild size="lg" className="shadow-lg">
          <Link href="/teacher/exam/create">
            <Plus className="mr-2 h-4 w-4" />
            إنشاء اختبار جديد
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="relative z-10 grid gap-6 md:grid-cols-3">
        <Card className="relative overflow-hidden border-l-4 border-l-blue-500 bg-card/60 backdrop-blur-sm dark:border-l-blue-400">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/5 dark:from-blue-400/10 dark:to-indigo-400/5" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">إجمالي الاختبارات</CardTitle>
            <IconBadge icon={FileQuestion} variant="info" size="sm" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-foreground">{totalExams}</div>
            <p className="mt-1 text-xs text-muted-foreground">عبر {courses.length} دورة</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-green-500 bg-card/60 backdrop-blur-sm dark:border-l-green-400">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/5 dark:from-green-400/10 dark:to-emerald-400/5" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">الاختبارات المنشورة</CardTitle>
            <IconBadge icon={BarChart3} variant="success" size="sm" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-foreground">{publishedExams}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {totalExams > 0 ? Math.round((publishedExams / totalExams) * 100) : 0}% معدل النشر
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-purple-500 bg-card/60 backdrop-blur-sm dark:border-l-purple-400">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-violet-500/5 dark:from-purple-400/10 dark:to-violet-400/5" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">الدورات النشطة</CardTitle>
            <IconBadge icon={BookOpen} variant="default" size="sm" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-foreground">
              {coursesWithExams.filter((course) => course.examCount > 0).length}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">تحتوي على اختبارات</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative z-10 space-y-8">
        {coursesWithExams.length === 0 && (
          <Card className="border-dashed bg-card/60 backdrop-blur-sm">
            <CardContent className="flex h-60 flex-col items-center justify-center p-8 text-center">
              <div className="rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 p-6">
                <FileQuestion className="h-12 w-12 text-primary" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">لا توجد دورات بعد</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                تحتاج إلى إنشاء دورة تعليمية أولاً قبل أن تتمكن من إنشاء اختبارات.
              </p>
              <Button className="mt-6" asChild size="lg">
                <Link href="/teacher/courses/create">
                  <BookOpen className="mr-2 h-4 w-4" />
                  إنشاء دورة جديدة
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {coursesWithExams.map((course) => (
          <div key={course.id} className="space-y-6">
            <Card className="relative overflow-hidden border-l-4 border-l-blue-500 bg-card/60 backdrop-blur-sm dark:border-l-blue-400">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-transparent dark:from-blue-400/5" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <IconBadge icon={BookOpen} variant="info" />
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">{course.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        {course.examCount} اختبار • {course.isPublished ? 'منشورة' : 'مسودة'}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10">
                    <Link href={`/teacher/exam/course/${course.id}`}>
                      عرض جميع الاختبارات
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {course.examCount === 0 ? (
              <Card className="border-dashed bg-muted/30 backdrop-blur-sm">
                <CardContent className="flex h-32 flex-col items-center justify-center p-6 text-center">
                  <FileQuestion className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="mb-3 text-sm text-muted-foreground">لم يتم إنشاء أي اختبارات لهذه الدورة بعد.</p>
                  <Button variant="outline" size="sm" asChild className="hover:bg-primary/10">
                    <Link href={`/teacher/exam/create?courseId=${course.id}`}>
                      <Plus className="mr-2 h-4 w-4" />
                      إنشاء اختبار
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {course.exams.slice(0, 6).map((exam) => (
                  <Card
                    key={exam.id}
                    className="group overflow-hidden bg-card/60 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                  >
                    <CardHeader className="relative overflow-hidden p-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-muted/10" />
                      <div className="relative flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base leading-tight transition-colors group-hover:text-primary">
                            {exam.title}
                          </CardTitle>
                          <CardDescription className="mt-1 line-clamp-2 text-xs">
                            {exam.description || 'لا يوجد وصف متاح'}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                              <Link href={`/teacher/exam/${exam.id}`} className="flex items-center">
                                <Pencil className="mr-2 h-4 w-4" />
                                تحرير
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{exam.timeLimit || 0} دقيقة</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileQuestion className="h-3 w-3" />
                          <span>{exam._count.questions} سؤال</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant={exam.isPublished ? 'default' : 'secondary'} className="text-xs">
                          {exam.isPublished ? 'منشور' : 'مسودة'}
                        </Badge>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/teacher/exam/${exam.id}`}>عرض</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {course.exams.length > 6 && (
                  <Card className="flex items-center justify-center border-dashed bg-card/30 backdrop-blur-sm transition-colors hover:bg-muted/50">
                    <CardContent className="p-8 text-center">
                      <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
                        <Link href={`/teacher/exam/course/${course.id}`}>
                          <Plus className="mr-2 h-4 w-4" />
                          عرض المزيد ({course.exams.length - 6})
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
