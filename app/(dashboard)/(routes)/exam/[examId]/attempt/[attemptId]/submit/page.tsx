import { redirect } from 'next/navigation';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { ExamSubmitAction } from './_components/exam-submit-action';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { SubmitExamClient } from './_components/submit-exam-client';
import { getCurrentUser } from '@/lib/auth-helpers';
import { PageProtection } from '@/components/page-protection';

interface PageProps {
  params: {
    examId: string;
    attemptId: string;
  };
}

export default async function ExamSubmitPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  // Get the active attempt and make sure it's valid
  const attempt = await db.examAttempt.findUnique({
    where: {
      id: params.attemptId,
      userId: user.id,
      examId: params.examId,
      completedAt: null,
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
          },
        },
      },
      questionAttempts: true,
    },
  });

  if (!attempt) {
    return redirect(`/exam/${params.examId}`);
  }

  // Calculate stats for the summary
  const totalQuestions = attempt.exam.examQuestions.length;
  const answeredQuestions = attempt.questionAttempts.length;
  const unansweredQuestions = totalQuestions - answeredQuestions;
  const answeredPercentage = Math.round((answeredQuestions / totalQuestions) * 100);

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div>
        <h1 className="text-right text-2xl font-bold">تسليم الامتحان: {attempt.exam.title}</h1>
        <p className="text-right text-sm text-slate-600 dark:text-slate-400">راجع إجاباتك قبل تسليم الامتحان</p>
      </div>

      <Card>
        <CardHeader className="bg-muted">
          <CardTitle className="text-right">ملخص الامتحان</CardTitle>
          <CardDescription className="text-right">بمجرد التسليم، لن تتمكن من تغيير إجاباتك</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col items-center justify-center rounded-md border bg-card p-4 shadow-sm">
              <div className="text-3xl font-bold text-primary">{answeredQuestions}</div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                <span>تمت الإجابة</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center rounded-md border bg-card p-4 shadow-sm">
              <div className="text-3xl font-bold text-primary">{unansweredQuestions}</div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <XCircle className="h-4 w-4 text-muted-foreground" />
                <span>بدون إجابة</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center rounded-md border bg-card p-4 shadow-sm">
              <div className="text-3xl font-bold text-primary">{totalQuestions}</div>
              <div className="text-sm text-muted-foreground">إجمالي الأسئلة</div>
            </div>
          </div>

          {unansweredQuestions > 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <div className="font-semibold">تحذير: أسئلة بدون إجابة</div>
              </div>
              <p className="mt-2 text-right text-sm">
                لديك {unansweredQuestions} سؤال بدون إجابة{unansweredQuestions > 1 ? '' : ''}. بمجرد التسليم، لن تتمكن
                من العودة والإجابة عليها.
              </p>
            </div>
          )}

          <div>
            <h3 className="text-right font-medium">حالة الأسئلة</h3>
            <div className="mt-3 grid grid-cols-10 gap-2">
              {attempt.exam.examQuestions.map((question, index) => {
                const isAnswered = attempt.questionAttempts.some((qa) => qa.questionId === question.question.id);

                return (
                  <div
                    key={question.question.id}
                    className={`flex h-8 w-8 items-center justify-center rounded-md text-sm ${
                      isAnswered
                        ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                        : 'bg-accent text-muted-foreground'
                    }`}
                    title={`سؤال ${index + 1}: ${isAnswered ? 'تمت الإجابة' : 'بدون إجابة'}`}
                  >
                    {index + 1}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-row-reverse justify-between border-t bg-muted p-6">
          <Button variant="outline" asChild>
            <a href={`/exam/${params.examId}/attempt/${params.attemptId}`}>العودة للامتحان</a>
          </Button>

          <ExamSubmitAction examId={params.examId} attemptId={params.attemptId} />
        </CardFooter>
      </Card>
    </div>
  );
}
