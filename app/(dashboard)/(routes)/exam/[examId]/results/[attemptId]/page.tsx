import { redirect } from 'next/navigation';
import { CheckCircle, XCircle, Clock, Trophy, BookOpen, Target, Award, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-helpers';
import { PageProtection } from '@/components/page-protection';
import { QuestionReview } from './_components/question-review';
import { IconBadge } from '@/components/icon-badge';

interface PageProps {
  params: {
    examId: string;
    attemptId: string;
  };
}

export default async function ExamResultsPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  // Get the completed attempt with all details
  const attempt = await db.examAttempt.findUnique({
    where: {
      id: params.attemptId,
      userId: user.id,
      examId: params.examId,
    },
    include: {
      exam: {
        include: {
          examQuestions: {
            include: {
              question: {
            include: {
              options: true,
                },
              },
            },
            orderBy: {
              position: 'asc',
            },
          },
        },
      },
      questionAttempts: {
        include: {
          question: true,
          selectedOption: true,
        },
      },
    },
  });

  if (!attempt) {
    return redirect(`/exam/${params.examId}`);
  }

  // Make sure the attempt is completed
  if (!attempt.completedAt) {
    return redirect(`/exam/${params.examId}/attempt/${params.attemptId}`);
  }

  // Calculate statistics
  const totalQuestions = attempt.exam.examQuestions.length;
  const correctAnswers = attempt.questionAttempts.filter((qa) => qa.isCorrect).length;
  const incorrectAnswers = attempt.questionAttempts.filter((qa) => qa.isCorrect === false).length;
  const unansweredQuestions = totalQuestions - attempt.questionAttempts.length;

  // Format exam duration
  const startTime = new Date(attempt.startedAt).getTime();
  const endTime = new Date(attempt.completedAt).getTime();
  const durationMs = endTime - startTime;
  const durationMinutes = Math.floor(durationMs / (1000 * 60));
  const durationSeconds = Math.floor((durationMs % (1000 * 60)) / 1000);

  // Get score status
  const score = attempt.score || 0;
  const isPass = score >= 70;

  return (
    <PageProtection requiredPermission="canAccessExams">
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background" dir="rtl">
        {/* Enhanced decorative elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute right-10 top-20 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-green-500/10 to-emerald-500/10 blur-3xl" />
          <div
            className="absolute bottom-1/4 left-20 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 blur-3xl"
            style={{ animationDelay: '2s' }}
           />
          <div
            className="absolute right-1/3 top-1/2 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl"
            style={{ animationDelay: '4s' }}
           />
      </div>

        <div className="relative z-10 mx-auto max-w-6xl space-y-8 p-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className={`rounded-xl p-3 backdrop-blur-sm border ${
              isPass 
                ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/20' 
                : 'bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/20'
            }`}>
              {isPass ? (
                <Trophy className="h-6 w-6 text-green-600 dark:text-green-400" />
              ) : (
                <Target className="h-6 w-6 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-arabic bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                نتائج الامتحان
              </h1>
              <p className="text-muted-foreground font-arabic">
                {attempt.exam.title}
              </p>
            </div>
          </div>

          {/* Results Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Score Card */}
            <Card className={`group relative overflow-hidden backdrop-blur-xl transition-all duration-300 hover:shadow-2xl ${
              isPass 
                ? 'border border-green-500/20 bg-gradient-to-br from-green-500/10 via-card/80 to-emerald-500/5 hover:shadow-green-500/10' 
                : 'border border-red-500/20 bg-gradient-to-br from-red-500/10 via-card/80 to-pink-500/5 hover:shadow-red-500/10'
            }`}>
              <div className={`absolute inset-0 ${
                isPass 
                  ? 'bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5' 
                  : 'bg-gradient-to-br from-red-500/5 via-transparent to-pink-500/5'
              }`} />
              <div className={`absolute inset-x-0 top-0 h-px ${
                isPass 
                  ? 'bg-gradient-to-r from-transparent via-green-500/50 to-transparent' 
                  : 'bg-gradient-to-r from-transparent via-red-500/50 to-transparent'
              }`} />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground font-arabic">النتيجة النهائية</CardTitle>
                <div className={`rounded-lg p-2 backdrop-blur-sm ${
                  isPass ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  <Award className={`h-4 w-4 ${
                    isPass ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`} />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className={`text-3xl font-bold font-arabic ${
                  isPass ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {score}%
            </div>
                <Badge variant={isPass ? 'default' : 'destructive'} className="mt-2 font-arabic">
                  {isPass ? 'ناجح' : 'راسب'}
                </Badge>
          </CardContent>
        </Card>

            {/* Correct Answers */}
            <Card className="group relative overflow-hidden border border-green-500/20 bg-gradient-to-br from-green-500/10 via-card/80 to-emerald-500/5 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground font-arabic">إجابات صحيحة</CardTitle>
                <div className="rounded-lg bg-green-500/20 p-2 backdrop-blur-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
          </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-foreground font-arabic">{correctAnswers}</div>
                <p className="mt-1 text-xs text-muted-foreground font-arabic">من {totalQuestions} سؤال</p>
              </CardContent>
            </Card>

            {/* Incorrect Answers */}
            <Card className="group relative overflow-hidden border border-red-500/20 bg-gradient-to-br from-red-500/10 via-card/80 to-pink-500/5 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-pink-500/5" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground font-arabic">إجابات خاطئة</CardTitle>
                <div className="rounded-lg bg-red-500/20 p-2 backdrop-blur-sm">
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-foreground font-arabic">{incorrectAnswers}</div>
                <p className="mt-1 text-xs text-muted-foreground font-arabic">إجابة غير صحيحة</p>
              </CardContent>
            </Card>

            {/* Time Taken */}
            <Card className="group relative overflow-hidden border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-card/80 to-indigo-500/5 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground font-arabic">الوقت المستغرق</CardTitle>
                <div className="rounded-lg bg-blue-500/20 p-2 backdrop-blur-sm">
                  <Timer className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-foreground font-arabic">{durationMinutes}</div>
                <p className="mt-1 text-xs text-muted-foreground font-arabic">دقيقة و {durationSeconds} ثانية</p>
              </CardContent>
            </Card>
              </div>

          {/* Progress Bar */}
          <Card className="overflow-hidden border border-border/50 bg-card/60 shadow-lg backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-muted/5 via-transparent to-muted/10" />
            <CardContent className="relative p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground font-arabic mb-2">تقدم الأداء</h3>
                <Progress
                  value={score}
                  className={`h-3 ${
                    isPass 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}
                />
                <div className="mt-2 flex justify-between text-sm text-muted-foreground font-arabic">
                  <span>0%</span>
                  <span className="font-medium">{score}%</span>
                  <span>100%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Review */}
          <Card className="overflow-hidden border border-border/50 bg-card/60 shadow-lg backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-muted/5 via-transparent to-muted/10" />
            <CardHeader className="relative border-b border-border/50 bg-muted/20">
              <div className="flex items-center gap-3">
                <IconBadge icon={BookOpen} variant="info" size="sm" />
                <div>
                  <CardTitle className="text-xl font-semibold text-foreground font-arabic">مراجعة الأسئلة</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground font-arabic">
                    راجع جميع الأسئلة وانظر أيها أجبت عليه بشكل صحيح
                  </CardDescription>
            </div>
              </div>
        </CardHeader>
            <CardContent className="relative p-6">
          <div className="space-y-8">
                {attempt.exam.examQuestions.map((examQuestion, index) => {
                  const question = examQuestion.question;
              const questionAttempt = attempt.questionAttempts.find((qa) => qa.questionId === question.id);
              const correctOption = question.options.find((o) => o.isCorrect);

              return (
                <QuestionReview
                  key={question.id}
                  question={question}
                  questionNumber={index + 1}
                  userAnswer={questionAttempt?.selectedOption}
                  correctAnswer={correctOption}
                  isCorrect={questionAttempt?.isCorrect}
                  isUnanswered={!questionAttempt}
                />
              );
            })}
          </div>
        </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="overflow-hidden border border-border/50 bg-card/60 shadow-lg backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-muted/5 via-transparent to-muted/10" />
            <CardContent className="relative p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                <Button variant="outline" asChild className="backdrop-blur-sm border-border/50 hover:bg-muted/50 font-arabic">
            <a href="/exam">العودة للامتحانات</a>
          </Button>
                <Button asChild className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary backdrop-blur-sm border border-primary/20 shadow-lg font-arabic">
            <a href={`/exam/${params.examId}`}>محاولة مرة أخرى</a>
          </Button>
              </div>
            </CardContent>
      </Card>
    </div>
      </div>
    </PageProtection>
  );
}
