import { requireTeacher } from '@/lib/auth-helpers';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BarChart, Clock, LayoutDashboard, ListChecks, Settings, FileQuestion, Eye } from 'lucide-react';
import { ExamActions } from './_components/exam-actions';
import { db } from '@/lib/db';
import { IconBadge } from '@/components/icon-badge';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import { Banner } from '@/components/banner';
import { Separator } from '@/components/ui/separator';

interface PageProps { params: {
    examId: string; };
}

export default async function ExamDetailPage({ params }: PageProps) { const user = await requireTeacher();

  const exam = await db.exam.findUnique({
    where: {
      id: params.examId, },
    include: { course: true,
      chapter: true,
      _count: {
        select: { examQuestions: true },
      },
    },
  });

  if (!exam) {
    return redirect('/teacher/exam');
  }

  // Get count of past attempts for this exam
  const attemptCount = await db.examAttempt.count({ where: {
      examId: params.examId,
      completedAt: {
        not: null, },
    },
  });

  const requiredFields = [exam.title, exam._count.examQuestions > 0];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `${completedFields}/${totalFields}`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!exam.isPublished && (
        <Banner variant="warning" label="هذا الاختبار غير منشور. لن يكون مرئياً للطلاب." />
      )}
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-6" dir="rtl">
        {/* Background Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute right-20 top-32 h-40 w-40 animate-pulse rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 blur-3xl" />
          <div className="absolute bottom-20 left-32 h-52 w-52 animate-pulse rounded-full bg-gradient-to-br from-accent/8 to-primary/8 blur-3xl" style={ { animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="w-full">
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col gap-y-2">
                <Link href="/teacher/exam" className="mb-6 flex items-center text-sm transition hover:opacity-75 font-arabic group">
                  <ArrowLeft className="ml-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  العودة إلى الاختبارات
                </Link>
                <div className="flex items-center gap-x-3">
                  <h1 className="text-3xl font-bold font-arabic bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{exam.title}</h1>
                  <Badge variant={ exam.isPublished ? 'default' : 'outline' } className="backdrop-blur-sm">
                    { exam.isPublished ? 'منشور' : 'مسودة' }
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground font-arabic">
                  {exam.course.title}
                  {exam.chapter && ` • ${exam.chapter.title}`}
                </p>
              </div>
              <ExamActions examId={params.examId} isPublished={exam.isPublished} disabled={!isComplete} />
            </div>
          </div>
        </div>
        <div className="relative z-10 mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <div className="flex items-center gap-x-3">
              <div className="rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 p-3 backdrop-blur-sm border border-primary/20">
                <LayoutDashboard className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-arabic font-semibold">تخصيص الاختبار</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Link href={`/teacher/exam/${exam.id}/basic`} className="group">
                <div className="flex h-full flex-col rounded-xl border border-border/50 bg-gradient-to-br from-card/80 via-card/60 to-muted/20 backdrop-blur-xl p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                  <div className="relative mb-3 flex items-center gap-x-2">
                    <div className="rounded-lg bg-primary/20 p-2 backdrop-blur-sm">
                      <Settings className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-medium font-arabic">الإعدادات الأساسية</h3>
                  </div>
                  <p className="relative text-xs text-muted-foreground font-arabic">تحرير العنوان والوصف والحد الزمني للاختبار.</p>
                </div>
              </Link>
              <Link href={`/teacher/exam/${exam.id}/questions`} className="group">
                <div className="flex h-full flex-col rounded-xl border border-border/50 bg-gradient-to-br from-card/80 via-card/60 to-muted/20 backdrop-blur-xl p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                  <div className="relative mb-3 flex items-center gap-x-2">
                    <div className="rounded-lg bg-green-500/20 p-2 backdrop-blur-sm">
                      <ListChecks className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-medium font-arabic">الأسئلة</h3>
                  </div>
                  <p className="relative text-xs text-muted-foreground font-arabic">
                    إضافة وتحرير أسئلة هذا الاختبار. {exam._count.examQuestions} سؤال حتى الآن.
                  </p>
                </div>
              </Link>
              <Link href={`/teacher/exam/${exam.id}/statistics`} className="group">
                <div className="flex h-full flex-col rounded-xl border border-border/50 bg-gradient-to-br from-card/80 via-card/60 to-muted/20 backdrop-blur-xl p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                  <div className="relative mb-3 flex items-center gap-x-2">
                    <div className="rounded-lg bg-purple-500/20 p-2 backdrop-blur-sm">
                      <BarChart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-medium font-arabic">الإحصائيات</h3>
                    {attemptCount > 0 && (
                      <Badge className="ml-auto backdrop-blur-sm" variant="secondary">
                        {attemptCount}
                      </Badge>
                    )}
                  </div>
                  <p className="relative text-xs text-muted-foreground font-arabic">عرض تحليلات الأداء ونتائج الطلاب.</p>
                </div>
              </Link>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-x-3">
              <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 p-3 backdrop-blur-sm border border-blue-500/20">
                <FileQuestion className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-arabic font-semibold">حالة الاختبار</h2>
            </div>
            <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card/80 via-card/60 to-muted/20 backdrop-blur-xl">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium font-arabic">اكتمال الإعداد</p>
                  <div className="text-sm text-muted-foreground">{completionText}</div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted/40 backdrop-blur-sm">
                  <div
                    className={ `h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-amber-500 to-yellow-400' }`}
                    style={ { width: `${(completedFields / totalFields) * 100 }%` }}
                  />
                </div>
              </div>
              <Separator className="bg-border/50" />
              <div className="space-y-4 p-4">
                <div className="flex items-center gap-x-3">
                  <div className="rounded-full border border-green-500/50 p-1 backdrop-blur-sm bg-green-500/10">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  </div>
                  <div className="text-sm font-medium font-arabic">العنوان { exam.title ? '✓' : '✗' }</div>
                </div>
                <div className="flex items-center gap-x-3">
                  <div
                    className={ `rounded-full border p-1 backdrop-blur-sm ${
                      exam._count.examQuestions > 0 ? 'border-green-500/50 bg-green-500/10' : 'border-muted bg-muted/20' }`}
                  >
                    <div
                      className={ `h-2 w-2 rounded-full ${exam._count.examQuestions > 0 ? 'bg-green-500' : 'bg-muted-foreground' }`}
                    />
                  </div>
                  <div className={ `text-sm font-medium font-arabic ${exam._count.examQuestions > 0 ? '' : 'text-muted-foreground' }`}>
                    الأسئلة { exam._count.examQuestions > 0 ? '✓' : '✗' }
                  </div>
                </div>
              </div>
              <Separator className="bg-border/50" />
              <div className="p-4">
                <div className="flex items-center gap-4">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!isComplete || !exam.isPublished}
                    className="w-full backdrop-blur-sm border-primary/20 hover:bg-primary/10 font-arabic"
                    asChild
                  >
                    <Link href={`/exam/${exam.id}`} target="_blank">
                      <Eye className="ml-2 h-4 w-4" />
                      معاينة
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-card/60 to-transparent backdrop-blur-xl p-5">
              <div className="flex items-center gap-x-3">
                <div className="rounded-full bg-blue-500/20 p-2 backdrop-blur-sm">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-blue-700 dark:text-blue-300 font-arabic">الحد الزمني</h3>
              </div>
              <p className="mt-3 text-sm text-blue-700 dark:text-blue-300 font-arabic">
                {exam.timeLimit
                  ? `هذا الاختبار له حد زمني قدره ${exam.timeLimit} دقيقة.`
                  : 'هذا الاختبار ليس له حد زمني.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
