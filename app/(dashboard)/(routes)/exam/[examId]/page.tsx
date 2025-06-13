import { redirect } from 'next/navigation';
import { AlertTriangle, CheckCircle, Clock, FileQuestion, BookOpen, Target, Timer } from 'lucide-react';
import { ExamClient } from './_components/exam-client';
import { getExams } from '@/actions/get-exams';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PageProtection } from '@/components/page-protection';
import { getCurrentUser } from '@/lib/auth-helpers';
import { Badge } from '@/components/ui/badge';
import { IconBadge } from '@/components/icon-badge';

interface PageProps { params: {
    examId: string; };
}

export default async function ExamDetailPage({ params }: PageProps) { const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  const result = await getExams({
    userId: user.id,
    examId: params.examId, });

  if (!result?.exam) {
    return redirect('/exam');
  }

  const { exam, activeAttempt, pastAttempts } = result;

  return (
    <PageProtection requiredPermission="canAccessExams">
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background" dir="rtl">
        {/* Enhanced decorative elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute right-10 top-20 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 blur-3xl" />
          <div
            className="absolute bottom-1/4 left-20 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl"
            style={ { animationDelay: '2s' }}
           />
          <div
            className="absolute right-1/3 top-1/2 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-green-500/10 to-emerald-500/10 blur-3xl"
            style={ { animationDelay: '4s' }}
           />
        </div>

        <div className="relative z-10 space-y-8 p-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 p-3 backdrop-blur-sm border border-blue-500/20">
              <FileQuestion className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
        <div>
              <h1 className="text-3xl font-bold text-foreground font-arabic bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                {exam.title}
              </h1>
              <p className="text-muted-foreground font-arabic">
                {exam.course.title}
                {exam.chapter && ` • ${exam.chapter.title}`}
              </p>
              </div>
          </div>

          {/* Exam Info Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="group relative overflow-hidden border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-card/80 to-indigo-500/5 backdrop-blur-xl dark:from-blue-400/10 dark:to-indigo-400/5 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 dark:from-blue-400/5 dark:to-indigo-400/5" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground font-arabic">عدد الأسئلة</CardTitle>
                <div className="rounded-lg bg-blue-500/20 p-2 backdrop-blur-sm">
                  <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-foreground font-arabic">{exam?.examQuestions?.length || 0}</div>
                <p className="mt-1 text-xs text-muted-foreground font-arabic">سؤال للإجابة</p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-card/80 to-amber-500/5 backdrop-blur-xl dark:from-orange-400/10 dark:to-amber-400/5 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5 dark:from-orange-400/5 dark:to-amber-400/5" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground font-arabic">الوقت المحدد</CardTitle>
                <div className="rounded-lg bg-orange-500/20 p-2 backdrop-blur-sm">
                  <Timer className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-foreground font-arabic">
                  {exam?.timeLimit ? `${exam.timeLimit}` : 'غير محدود'}
                        </div>
                <p className="mt-1 text-xs text-muted-foreground font-arabic">
                  { exam?.timeLimit ? 'دقيقة' : 'بدون حد زمني' }
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border border-green-500/20 bg-gradient-to-br from-green-500/10 via-card/80 to-emerald-500/5 backdrop-blur-xl dark:from-green-400/10 dark:to-emerald-400/5 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 dark:from-green-400/5 dark:to-emerald-400/5" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground font-arabic">المحاولات السابقة</CardTitle>
                <div className="rounded-lg bg-green-500/20 p-2 backdrop-blur-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-foreground font-arabic">{pastAttempts.length}</div>
                <p className="mt-1 text-xs text-muted-foreground font-arabic">محاولة مكتملة</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Exam Start Card */}
            <Card className="overflow-hidden border border-border/50 bg-card/60 shadow-lg backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-muted/5 via-transparent to-muted/10" />
              <CardHeader className="relative border-b border-border/50 bg-muted/20">
                <div className="flex items-center gap-3">
                  <IconBadge icon={ activeAttempt ? CheckCircle : FileQuestion } variant={ activeAttempt ? "warning" : "success" } size="sm" />
                  <div>
                    <CardTitle className="text-xl font-semibold text-foreground font-arabic">
                { activeAttempt ? 'استكمال الامتحان' : 'بدء محاولة جديدة' }
              </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground font-arabic">
                { activeAttempt
                  ? 'عندك محاولة نشطة. ممكن تستكمل من حيث توقفت.'
                        : `الامتحان ده فيه ${exam?.examQuestions?.length || 0 } سؤال للإجابة.`}
              </CardDescription>
                  </div>
                </div>
            </CardHeader>
              <CardContent className="relative p-6">
              {exam?.description && (
                  <div className="mb-6 p-4 rounded-lg bg-muted/30 backdrop-blur-sm border border-border/30">
                    <h4 className="text-sm font-medium text-foreground font-arabic mb-2">وصف الامتحان</h4>
                    <p className="text-right text-sm text-muted-foreground font-arabic">{exam?.description}</p>
                  </div>
                )}

                <div className="rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/5 p-4 border border-blue-500/20 backdrop-blur-sm">
                  <h3 className="text-right font-medium text-foreground font-arabic mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    تعليمات الامتحان
                  </h3>
                  <ul className="space-y-2 text-right text-sm text-muted-foreground font-arabic">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      اقرأ كل سؤال بعناية قبل الإجابة
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      تقدر تتنقل بين الأسئلة باستخدام أزرار التنقل
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      إجاباتك بتتحفظ تلقائياً أثناء تقدمك
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      بعد تسليم الامتحان، مش هتقدر تغير إجاباتك
                    </li>
                    {exam?.timeLimit && (
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                        عندك {exam?.timeLimit} دقيقة لإنهاء الامتحان
                      </li>
                    )}
                </ul>
              </div>
            </CardContent>
              <CardFooter className="relative border-t border-border/50 bg-muted/20 p-6">
              <ExamClient
                  examId={params.examId}
                activeAttemptId={activeAttempt?.id}
                timeLimit={exam?.timeLimit}
                  userId={user.id}
                  title={exam?.title}
                totalQuestions={exam?.examQuestions?.length || 0}
                maxAttempts={exam?.maxAttempts || 1}
                passingScore={exam?.passingScore || 70}
              />
            </CardFooter>
          </Card>

            {/* Past Attempts */}
            <Card className="overflow-hidden border border-border/50 bg-card/60 shadow-lg backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-muted/5 via-transparent to-muted/10" />
              <CardHeader className="relative border-b border-border/50 bg-muted/20">
                <div className="flex items-center gap-3">
                  <IconBadge icon={BookOpen} variant="info" size="sm" />
                  <div>
                    <CardTitle className="text-xl font-semibold text-foreground font-arabic">المحاولات السابقة</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground font-arabic">
                      {pastAttempts.length > 0 ? `${pastAttempts.length} محاولة مكتملة` : 'لم تقم بأي محاولات بعد'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative p-6">
                { pastAttempts.length === 0 ? (
                  <div className="flex h-32 w-full flex-col items-center justify-center rounded-lg border border-dashed border-border/50 bg-muted/20 text-center backdrop-blur-sm">
                    <BookOpen className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground font-arabic">لم تقم بأي محاولات بعد</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pastAttempts.slice(0, 3).map((attempt, index) => (
                      <div
                        key={attempt.id }
                        className="flex items-center justify-between rounded-lg border border-border/30 bg-muted/20 p-3 backdrop-blur-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className={ `rounded-full p-2 ${
                            (attempt.score || 0) >= 70
                              ? 'bg-green-500/20 text-green-600'
                              : 'bg-red-500/20 text-red-600' }`}>
                            { (attempt.score || 0) >= 70 ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <AlertTriangle className="h-4 w-4" />
                            ) }
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground font-arabic">
                              المحاولة {pastAttempts.length - index}
                            </p>
                            <p className="text-xs text-muted-foreground font-arabic">
                              {new Date(attempt.completedAt!).toLocaleDateString('ar-EG')}
                            </p>
                          </div>
                        </div>
                        <Badge variant={ (attempt.score || 0) >= 70 ? 'default' : 'destructive' } className="font-arabic">
                          {attempt.score || 0}%
                        </Badge>
                      </div>
                    ))}
                    {pastAttempts.length > 3 && (
                      <p className="text-center text-xs text-muted-foreground font-arabic">
                        و {pastAttempts.length - 3} محاولة أخرى
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageProtection>
  );
}
