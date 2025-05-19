import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { QuestionForm } from './_components/question-form'
import { ExamNavigation } from './_components/exam-navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ProgressIndicator } from '@/components/ui/progress-indicator'
import { Separator } from '@/components/ui/separator'
import { ExamTimer } from './_components/exam-timer'
import { AlertTriangle, TimerIcon } from 'lucide-react'

interface PageProps {
  params: {
    examId: string;
    attemptId: string;
  };
  searchParams: {
    questionIndex?: string;
  };
}

export default async function ExamAttemptPage({ params, searchParams }: PageProps) {
  const { userId } = auth()

  if (!userId) {
    return redirect('/')
  }

  // Get current question index from search params or default to 0
  const questionIndex = searchParams.questionIndex ? parseInt(searchParams.questionIndex) : 0
  
  // Make sure we have a valid index
  const safeIndex = isNaN(questionIndex) ? 0 : questionIndex

  // Fetch exam attempt with questions
  const attempt = await db.examAttempt.findUnique({
    where: {
      id: params.attemptId,
      userId,
    },
    include: {
      exam: {
        include: {
          questions: {
            include: {
              options: true,
            },
            orderBy: {
              id: 'asc',  // Order by ID until we add a position field
            },
          },
        },
      },
      questionAttempts: true,
    },
  })

  if (!attempt) {
    return redirect('/exam')
  }
  
  // After the attempt is submitted, redirect to results
  if (attempt.completedAt) {
    return redirect(`/exam/${params.examId}/results/${params.attemptId}`)
  }

  const questions = attempt.exam.questions
  const totalQuestions = questions.length
  const currentQuestion = questions[safeIndex]

  // Find if current question has an attempt
  const existingAttempt = attempt.questionAttempts.find(
    (qa) => qa.questionId === currentQuestion?.id
  )
  
  // Count answered questions for progress
  const answeredQuestions = attempt.questionAttempts.length
  const progress = Math.round((answeredQuestions / totalQuestions) * 100)

  // Calculate time remaining
  const startTime = new Date(attempt.startedAt).getTime()
  const timeLimit = attempt.exam.timeLimit || 0
  const endTime = startTime + (timeLimit * 60 * 1000)
  const now = new Date().getTime()
  const timeRemaining = Math.max(0, endTime - now)

  // Calculate unanswered questions
  const unansweredQuestions = totalQuestions - answeredQuestions

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-right">{attempt.exam.title}</h1>
        <p className="text-sm text-muted-foreground mt-1 text-right">{attempt.exam.description}</p>
        
        {attempt.exam.timeLimit && (
          <div className="mt-2">
            <ExamTimer 
              timeLimit={attempt.exam.timeLimit} 
              startedAt={attempt.createdAt.toISOString()} 
              attemptId={params.attemptId} 
              examId={params.examId} 
            />
          </div>
        )}
      </div>

      {/* Progress indicator */}
      <ProgressIndicator 
        totalQuestions={totalQuestions}
        answeredQuestions={answeredQuestions}
        hasUnsavedChanges={false}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Navigation sidebar - keep on right side for RTL */}
        <div className="order-last md:order-last">
          <ExamNavigation 
            questions={questions} 
            questionAttempts={attempt.questionAttempts} 
            currentQuestionIndex={safeIndex}
            examId={params.examId}
            attemptId={params.attemptId}
          />
        </div>

        {/* Question form */}
        <div className="md:col-span-3">
          {currentQuestion && (
            <QuestionForm 
              question={currentQuestion}
              selectedOptionId={existingAttempt?.selectedOptionId || null}
              attemptId={params.attemptId}
              userId={userId}
              examId={params.examId}
              currentQuestionIndex={safeIndex}
              totalQuestions={totalQuestions}
            />
          )}
        </div>
      </div>

      {/* Warning for unanswered questions */}
      {unansweredQuestions > 0 && (
        <div className="rounded-md bg-amber-50 dark:bg-amber-950/50 p-4 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <div className="font-semibold">تحذير: أسئلة بدون إجابة</div>
          </div>
          <p className="mt-2 text-sm text-right">
            لديك {unansweredQuestions} سؤال بدون إجابة{unansweredQuestions > 1 ? '' : ''}.
            تأكد من الإجابة على جميع الأسئلة قبل تسليم الامتحان.
          </p>
        </div>
      )}

      {/* Time warning */}
      {timeLimit > 0 && timeRemaining < 5 * 60 * 1000 && (
        <div className="rounded-md bg-red-50 dark:bg-red-950/50 p-4 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2">
            <TimerIcon className="h-5 w-5" />
            <div className="font-semibold">تحذير: وقت قليل</div>
          </div>
          <p className="mt-2 text-sm text-right">
            فاضل أقل من 5 دقايق! لو سمحت احفظ إجاباتك بسرعة.
          </p>
        </div>
      )}
    </div>
  )
}