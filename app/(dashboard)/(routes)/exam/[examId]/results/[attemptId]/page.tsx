import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, ArrowLeft, Trophy, AlertTriangle, TimerIcon } from 'lucide-react'
import { QuestionReview } from './_components/question-review'

interface PageProps {
  params: {
    examId: string
    attemptId: string
  }
}

export default async function ExamResultsPage({ params }: PageProps) {
  const { userId } = auth()
  
  if (!userId) {
    return redirect('/')
  }

  // Get the completed attempt with all details
  const attempt = await db.examAttempt.findUnique({
    where: {
      id: params.attemptId,
      userId,
      examId: params.examId,
    },
    include: {
      exam: {
        include: {
          questions: {
            include: {
              options: true,
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
  })

  if (!attempt) {
    return redirect(`/exam/${params.examId}`)
  }

  // Make sure the attempt is completed
  if (!attempt.completedAt) {
    return redirect(`/exam/${params.examId}/attempt/${params.attemptId}`)
  }

  // Calculate statistics
  const totalQuestions = attempt.exam.questions.length
  const correctAnswers = attempt.questionAttempts.filter(qa => qa.isCorrect).length
  const incorrectAnswers = attempt.questionAttempts.filter(qa => qa.isCorrect === false).length
  const unansweredQuestions = totalQuestions - attempt.questionAttempts.length

  // Format exam duration
  const startTime = new Date(attempt.startedAt).getTime()
  const endTime = new Date(attempt.completedAt).getTime()
  const durationMs = endTime - startTime
  const durationMinutes = Math.floor(durationMs / (1000 * 60))
  const durationSeconds = Math.floor((durationMs % (1000 * 60)) / 1000)
  
  // Get score status
  const score = attempt.score || 0
  const isPass = score >= 70
  const scoreColor = isPass ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-right">نتائج الامتحان: {attempt.exam.title}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 text-right">
            تم الإكمال في {new Date(attempt.completedAt).toLocaleString('ar-SA')}
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href={`/exam/${params.examId}`}>
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة للامتحان
          </a>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Score card */}
        <Card className="md:col-span-1">
          <CardHeader className="bg-slate-50 dark:bg-slate-800/50 pb-3">
            <CardTitle className="flex items-center gap-2 text-right">
              <Trophy className="h-5 w-5 text-amber-500" />
              درجتك
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className={`text-6xl font-bold ${scoreColor}`}>
              {score}%
            </div>
            <div className="mt-2 text-center">
              <Badge variant={isPass ? "default" : "destructive"} className="text-sm">
                {isPass ? "ناجح" : "راسب"}
              </Badge>
            </div>
            <div className="mt-4 w-full">
              <Progress
                value={score}
                className={`h-2 ${isPass ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
              />
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <TimerIcon className="h-4 w-4" />
              <span>
                الوقت المستغرق: {durationMinutes} دقيقة {durationSeconds} ثانية
              </span>
            </div>
          </CardContent>
        </Card>
        
        {/* Statistics */}
        <Card className="md:col-span-2">
          <CardHeader className="bg-slate-50 dark:bg-slate-800/50 pb-3">
            <CardTitle className="text-right">ملخص الأداء</CardTitle>
            <CardDescription className="text-right">تفاصيل إجاباتك</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex flex-col items-center justify-center rounded-md border bg-card p-4 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-800 dark:text-slate-200">{correctAnswers}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">إجابات صحيحة</div>
              </div>
              
              <div className="flex flex-col items-center justify-center rounded-md border bg-card p-4 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-800 dark:text-slate-200">{incorrectAnswers}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">إجابات خاطئة</div>
              </div>
              
              <div className="flex flex-col items-center justify-center rounded-md border bg-card p-4 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-800 dark:text-slate-200">{unansweredQuestions}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">بدون إجابة</div>
              </div>
            </div>
            
            {!isPass && (
              <div className="mt-6 rounded-md bg-amber-50 dark:bg-amber-950/50 p-4 text-sm text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <p className="font-medium text-right">توصية:</p>
                <p className="mt-1 text-right">
                  راجع الأسئلة التي أخطأت فيها أدناه وحاول مرة أخرى لتحسين درجتك.
                  تحتاج إلى درجة 70% أو أعلى للنجاح.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Questions review */}
      <Card>
        <CardHeader className="bg-slate-50 dark:bg-slate-800/50 pb-3">
          <CardTitle className="text-right">مراجعة الأسئلة</CardTitle>
          <CardDescription className="text-right">
            راجع جميع الأسئلة وانظر أيها أجبت عليه بشكل صحيح
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-8">
            {attempt.exam.questions.map((question, index) => {
              const questionAttempt = attempt.questionAttempts.find(
                qa => qa.questionId === question.id
              )
              
              const correctOption = question.options.find(o => o.isCorrect)
              
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
              )
            })}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between flex-row-reverse border-t bg-slate-50 dark:bg-slate-800/50 p-6">
          <Button variant="outline" asChild>
            <a href="/exam">العودة للامتحانات</a>
          </Button>
          <Button asChild>
            <a href={`/exam/${params.examId}`}>محاولة مرة أخرى</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}