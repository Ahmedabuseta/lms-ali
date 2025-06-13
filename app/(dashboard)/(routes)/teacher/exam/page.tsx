import { requireTeacher } from '@/lib/auth-helpers';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus,
  Clock,
  File,
  FileQuestion,
  MoreHorizontal,
  Pencil,
  ChevronRight,
  BookOpen,
  Users,
  BarChart3, } from 'lucide-react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { IconBadge } from '@/components/icon-badge';
import { cn } from '@/lib/utils';

export default async function TeacherExamPage() { const user = await requireTeacher();

  // Get all courses created by this teacher
  const courses = await db.course.findMany({
    include: {
      exams: {
        include: {
          _count: {
            select: { examQuestions: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc', },
  });

  // Group exams by course
  const coursesWithExams = courses.map((course) => ({ ...course,
    examCount: course.exams.length, }));

  const totalExams = courses.reduce((acc, course) => acc + course.exams.length, 0);
  const publishedExams = courses.reduce(
    (acc, course) => acc + course.exams.filter((exam) => exam.isPublished).length,
    0,
  );

  return (
    <div className="min-h-screen space-y-8 bg-gradient-to-br from-background via-muted/30 to-background p-6" dir="rtl">
      {/* Enhanced decorative elements for both themes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-10 top-20 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 blur-3xl" />
        <div
          className="absolute bottom-1/4 left-20 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-accent/10 to-primary/10 blur-3xl"
          style={ { animationDelay: '2s' }}
         />
        <div
          className="absolute right-1/3 top-1/2 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-secondary/10 to-accent/10 blur-3xl"
          style={ { animationDelay: '4s' }}
         />
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 p-3 backdrop-blur-sm border border-orange-500/20">
            <FileQuestion className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground font-arabic bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              إدارة الاختبارات
            </h1>
            <p className="text-muted-foreground font-arabic">إنشاء وإدارة اختبارات دوراتك التعليمية</p>
          </div>
        </div>
        <Button asChild size="lg" className="shadow-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary backdrop-blur-sm border border-primary/20">
          <Link href="/teacher/exam/create" className="font-arabic">
            <Plus className="ml-2 h-4 w-4" />
            إنشاء اختبار جديد
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="relative z-10 grid gap-6 md:grid-cols-3">
        <Card className="group relative overflow-hidden border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-card/80 to-indigo-500/5 backdrop-blur-xl dark:from-blue-400/10 dark:to-indigo-400/5 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 dark:from-blue-400/5 dark:to-indigo-400/5" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground font-arabic">إجمالي الاختبارات</CardTitle>
            <div className="rounded-lg bg-blue-500/20 p-2 backdrop-blur-sm">
              <FileQuestion className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-foreground font-arabic">{totalExams}</div>
            <p className="mt-1 text-xs text-muted-foreground font-arabic">عبر {courses.length} دورة</p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border border-green-500/20 bg-gradient-to-br from-green-500/10 via-card/80 to-emerald-500/5 backdrop-blur-xl dark:from-green-400/10 dark:to-emerald-400/5 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 dark:from-green-400/5 dark:to-emerald-400/5" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground font-arabic">الاختبارات المنشورة</CardTitle>
            <div className="rounded-lg bg-green-500/20 p-2 backdrop-blur-sm">
              <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-foreground font-arabic">{publishedExams}</div>
            <p className="mt-1 text-xs text-muted-foreground font-arabic">
              { totalExams > 0 ? Math.round((publishedExams / totalExams) * 100) : 0 }% معدل النشر
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-card/80 to-violet-500/5 backdrop-blur-xl dark:from-purple-400/10 dark:to-violet-400/5 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-violet-500/5 dark:from-purple-400/5 dark:to-violet-400/5" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground font-arabic">الدورات النشطة</CardTitle>
            <div className="rounded-lg bg-purple-500/20 p-2 backdrop-blur-sm">
              <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-foreground font-arabic">
              {coursesWithExams.filter((course) => course.examCount > 0).length}
            </div>
            <p className="mt-1 text-xs text-muted-foreground font-arabic">تحتوي على اختبارات</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative z-10 space-y-8">
        { coursesWithExams.length === 0 && (
          <Card className="group border-dashed border-primary/20 bg-gradient-to-br from-card/60 via-card/40 to-muted/20 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5">
            <CardContent className="flex h-60 flex-col items-center justify-center p-8 text-center">
              <div className="rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 p-8 backdrop-blur-sm border border-primary/10">
                <FileQuestion className="h-12 w-12 text-primary" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground font-arabic">لا توجد دورات بعد</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground font-arabic">
                تحتاج إلى إنشاء دورة تعليمية أولاً قبل أن تتمكن من إنشاء اختبارات.
              </p>
              <Button className="mt-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-xl" asChild size="lg">
                <Link href="/teacher/courses/create" className="font-arabic">
                  <BookOpen className="ml-2 h-4 w-4" />
                  إنشاء دورة جديدة
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) }

        {coursesWithExams.map((course) => (
          <div key={course.id} className="space-y-6">
            <Card className="group relative overflow-hidden border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-card/60 to-transparent backdrop-blur-xl dark:from-blue-400/10 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-transparent dark:from-blue-400/5" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-blue-500/20 p-3 backdrop-blur-sm border border-blue-500/20">
                      <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground font-arabic">{course.title}</h2>
                      <p className="text-sm text-muted-foreground font-arabic">
                        {course.examCount} اختبار • { course.isPublished ? 'منشورة' : 'مسودة' }
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10 backdrop-blur-sm font-arabic">
                    <Link href={`/teacher/exam/course/${course.id}`}>
                      عرض جميع الاختبارات
                      <ChevronRight className="mr-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>

            { course.examCount === 0 ? (
              <Card className="group border-dashed border-muted/40 bg-gradient-to-br from-muted/20 via-card/30 to-transparent backdrop-blur-xl transition-all duration-300 hover:shadow-xl">
                <CardContent className="flex h-32 flex-col items-center justify-center p-6 text-center">
                  <FileQuestion className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="mb-3 text-sm text-muted-foreground font-arabic">لم يتم إنشاء أي اختبارات لهذه الدورة بعد.</p>
                  <Button variant="outline" size="sm" asChild className="hover:bg-primary/10 backdrop-blur-sm border-primary/20 font-arabic">
                    <Link href={`/teacher/exam/create?courseId=${course.id }`}>
                      <Plus className="ml-2 h-4 w-4" />
                      إنشاء اختبار
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                { course.exams.slice(0, 6).map((exam) => (
                  <Card
                    key={exam.id }
                    className="group relative overflow-hidden bg-gradient-to-br from-card/80 via-card/60 to-muted/20 backdrop-blur-xl border border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <CardHeader className="relative overflow-hidden p-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-muted/10 to-transparent" />
                      <div className="relative flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base leading-tight transition-colors group-hover:text-primary font-arabic">
                            {exam.title}
                          </CardTitle>
                          <CardDescription className="mt-1 line-clamp-2 text-xs font-arabic">
                            {exam.description || 'لا يوجد وصف متاح'}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted/50 backdrop-blur-sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 backdrop-blur-xl bg-card/90 border-border/50">
                            <DropdownMenuItem asChild>
                              <Link href={`/teacher/exam/${exam.id}`} className="flex items-center font-arabic">
                                <Pencil className="ml-2 h-4 w-4" />
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
                          <span className="font-arabic">{exam.timeLimit || 0} دقيقة</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileQuestion className="h-3 w-3" />
                          <span className="font-arabic">{exam._count.examQuestions} سؤال</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant={ exam.isPublished ? 'default' : 'secondary' } className="text-xs font-arabic backdrop-blur-sm">
                          { exam.isPublished ? 'منشور' : 'مسودة' }
                        </Badge>
                        <Button size="sm" variant="outline" asChild className="backdrop-blur-sm border-primary/20 hover:bg-primary/10 font-arabic">
                          <Link href={`/teacher/exam/${exam.id}`}>عرض</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                { course.exams.length > 6 && (
                  <Card className="group flex items-center justify-center border-dashed border-border/40 bg-gradient-to-br from-card/30 via-card/20 to-transparent backdrop-blur-xl transition-all duration-300 hover:bg-muted/30 hover:shadow-xl">
                    <CardContent className="p-8 text-center">
                      <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground backdrop-blur-sm font-arabic">
                        <Link href={`/teacher/exam/course/${course.id }`}>
                          <Plus className="ml-2 h-4 w-4" />
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
