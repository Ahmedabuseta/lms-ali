import { redirect } from 'next/navigation';
import { QuestionForm } from './_components/question-form';
import { ExamNavigation } from './_components/exam-navigation';
import { ExamTimer } from './_components/exam-timer';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressIndicator } from '@/components/ui/progress-indicator';
import { PageProtection } from '@/components/page-protection';
import { getCurrentUser } from '@/lib/auth-helpers';
import { ClientOnlyWrapper } from './_components/client-only-wrapper';
import { FileQuestion, Clock, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PageProps { params: {
    examId: string;
    attemptId: string; };
  searchParams: { questionIndex?: string; };
}

export default async function ExamAttemptPage({ params, searchParams }: PageProps) { const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  // Get current question index from search params or default to 0
  const questionIndex = searchParams.questionIndex ? parseInt(searchParams.questionIndex) : 0;
  const safeIndex = isNaN(questionIndex) ? 0 : questionIndex;

  // Fetch exam attempt with questions
  const attempt = await db.examAttempt.findUnique({
    where: {
      id: params.attemptId,
      userId: user.id, },
    include: { exam: {
        include: {
          examQuestions: {
            include: {
              question: {
                include: {
                  options: true,
                  passage: true, },
              },
            },
            orderBy: { position: 'asc', },
          },
        },
      },
      questionAttempts: true,
    },
  });

  if (!attempt) {
    return redirect('/exam');
  }

  // After the attempt is submitted, redirect to results
  if (attempt.completedAt) {
    return redirect(`/exam/${params.examId}/results/${params.attemptId}`);
  }

  const questions = attempt.exam.examQuestions.map((eq) => eq.question);
  const totalQuestions = questions.length;
  const currentQuestion = questions[safeIndex];

  // Find if current question has an attempt
  const existingAttempt = attempt.questionAttempts.find((qa) => qa.questionId === currentQuestion?.id);

  // Count answered questions for progress
  const answeredQuestions = attempt.questionAttempts.length;
  const unansweredQuestions = totalQuestions - answeredQuestions;

  return (
    <PageProtection requiredPermission="canAccessExams">
      <div className="min-h-screen bg-background" dir="rtl">
        <div className="mx-auto max-w-6xl space-y-6 p-6">

          {/* Header */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <FileQuestion className="h-5 w-5 text-primary" />
                  </div>
        <div>
                    <CardTitle className="text-xl font-arabic">
                      {attempt.exam.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground font-arabic">
                      {attempt.exam.description}
                    </p>
                  </div>
                </div>

                {/* Timer */}
          {attempt.exam.timeLimit && (
                  <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
              <ExamTimer
                timeLimit={attempt.exam.timeLimit}
                      startedAt={attempt.startedAt.toISOString()}
                attemptId={params.attemptId}
                examId={params.examId}
              />
            </div>
          )}
        </div>
            </CardHeader>

            <CardContent className="pt-0">
        <ProgressIndicator
          totalQuestions={totalQuestions}
          answeredQuestions={answeredQuestions}
          hasUnsavedChanges={false}
                autoSaveStatus="idle"
                isOnline={true}
                questionStatuses={ questions.map((question) => {
                  const hasAttempt = attempt.questionAttempts.find(qa => qa.questionId === question.id);
                  return {
                    questionId: question.id,
                    isAnswered: !!hasAttempt,
                    hasUnsavedChanges: false,
                    autoSaveStatus: 'idle' as const };
                })}
              />
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">

            {/* Question Content */}
            <div className="lg:col-span-3">
              { currentQuestion ? (
              <QuestionForm
                question={{
                  id: currentQuestion.id,
                  text: currentQuestion.text,
                  type: currentQuestion.type,
                  passage: currentQuestion.passage ? {
                    id: currentQuestion.passage.id,
                    title: currentQuestion.passage.title,
                    content: currentQuestion.passage.content } : undefined,
                  options: currentQuestion.options.map(opt => ({ id: opt.id,
                    text: opt.text }))
                }}
                selectedOptionId={existingAttempt?.selectedOptionId || null}
                attemptId={params.attemptId}
                userId={user.id}
                examId={params.examId}
                currentQuestionIndex={safeIndex}
                totalQuestions={totalQuestions}
              />
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2 font-arabic">لا توجد أسئلة</h3>
                      <p className="text-muted-foreground font-arabic">
                        لم يتم العثور على أسئلة في هذا الامتحان
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Navigation Sidebar */}
            <div className="lg:col-span-1">
              <ExamNavigation
                questions={questions}
                questionAttempts={attempt.questionAttempts}
                currentQuestionIndex={safeIndex}
                examId={params.examId}
                attemptId={params.attemptId}
              />
            </div>
          </div>

          {/* Warning for unanswered questions */}
          <ClientOnlyWrapper>
            { unansweredQuestions > 0 && (
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="font-arabic">
                  <strong>تحذير:</strong> لديك {unansweredQuestions } سؤال بدون إجابة.
                  تأكد من الإجابة على جميع الأسئلة قبل تسليم الامتحان.
                </AlertDescription>
              </Alert>
            )}
          </ClientOnlyWrapper>
        </div>
      </div>
    </PageProtection>
  );
}
