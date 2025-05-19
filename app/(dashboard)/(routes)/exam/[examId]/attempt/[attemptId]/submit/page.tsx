import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { ExamSubmitAction } from './_components/exam-submit-action'

interface PageProps {
  params: {
    examId: string
    attemptId: string
  }
}

export default async function ExamSubmitPage({ params }: PageProps) {
  const { userId } = auth()
  
  if (!userId) {
    return redirect('/')
  }

  // Get the active attempt and make sure it's valid
  const attempt = await db.examAttempt.findUnique({
    where: {
      id: params.attemptId,
      userId,
      examId: params.examId,
      completedAt: null,
    },
    include: {
      exam: {
        include: {
          questions: true,
        },
      },
      questionAttempts: true,
    },
  })

  if (!attempt) {
    return redirect(`/exam/${params.examId}`)
  }

  // Calculate stats for the summary
  const totalQuestions = attempt.exam.questions.length
  const answeredQuestions = attempt.questionAttempts.length
  const unansweredQuestions = totalQuestions - answeredQuestions
  const answeredPercentage = Math.round((answeredQuestions / totalQuestions) * 100)

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-right">تسليم الامتحان: {attempt.exam.title}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 text-right">
          راجع إجاباتك قبل تسليم الامتحان
        </p>
      </div>

      <Card>
        <CardHeader className="bg-muted">
          <CardTitle className="text-right">ملخص الامتحان</CardTitle>
          <CardDescription className="text-right">
            بمجرد التسليم، لن تتمكن من تغيير إجاباتك
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
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
            <div className="rounded-md bg-amber-50 dark:bg-amber-950/50 p-4 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <div className="font-semibold">تحذير: أسئلة بدون إجابة</div>
              </div>
              <p className="mt-2 text-sm text-right">
                لديك {unansweredQuestions} سؤال بدون إجابة{unansweredQuestions > 1 ? '' : ''}.
                بمجرد التسليم، لن تتمكن من العودة والإجابة عليها.
              </p>
            </div>
          )}

          <div>
            <h3 className="font-medium text-right">حالة الأسئلة</h3>
            <div className="mt-3 grid grid-cols-10 gap-2">
              {attempt.exam.questions.map((question, index) => {
                const isAnswered = attempt.questionAttempts.some(
                  qa => qa.questionId === question.id
                );
                
                return (
                  <div
                    key={question.id}
                    className={`flex h-8 w-8 items-center justify-center rounded-md text-sm ${
                      isAnswered
                        ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                        : 'bg-accent text-muted-foreground'
                    }`}
                    title={`سؤال ${index + 1}: ${isAnswered ? 'تمت الإجابة' : 'بدون إجابة'}`}
                  >
                    {index + 1}
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between flex-row-reverse border-t bg-muted p-6">
          <Button
            variant="outline"
            asChild
          >
            <a href={`/exam/${params.examId}/attempt/${params.attemptId}`}>
              العودة للامتحان
            </a>
          </Button>
          
          <ExamSubmitAction
            examId={params.examId}
            attemptId={params.attemptId}
          />
        </CardFooter>
      </Card>
    </div>
  )
}