import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { StudentPerformanceTable } from '@/components/StudentPerformanceTable'

interface PageProps {
  params: {
    examId: string
  }
}

export default async function ExamStatisticsPage({ params }: PageProps) {
  const { userId } = auth()

  if (!userId) {
    return redirect('/')
  }

  const exam = await db.exam.findUnique({
    where: {
      id: params.examId,
      userId,
    },
    include: {
      questions: true,
      attempts: {
        include: {
          user: true,
          answers: true,
        },
      },
    },
  })

  if (!exam) {
    return redirect('/')
  }

  // Calculate statistics
  const statistics = {
    totalAttempts: exam.attempts.length,
    averageScore: 0,
    questionStats: exam.questions.map(question => {
      const correctAnswers = exam.attempts.filter(attempt => {
        const answer = attempt.answers.find(a => a.questionId === question.id)
        return answer?.isCorrect
      }).length

      return {
        questionId: question.id,
        text: question.text,
        correctRate: exam.attempts.length > 0 
          ? Math.round((correctAnswers / exam.attempts.length) * 100)
          : 0,
        attemptCount: exam.attempts.length
      }
    }),
    studentResults: exam.attempts.map(attempt => ({
      userId: attempt.user.id,
      userName: attempt.user.name,
      email: attempt.user.email,
      score: attempt.score,
      timeTaken: attempt.timeTaken,
      completedAt: attempt.completedAt,
      correct: attempt.answers.filter(a => a.isCorrect).length,
      total: attempt.answers.length
    }))
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>أداء الأسئلة</CardTitle>
          <CardDescription>
            انظر إلى الأسئلة التي يجدها الطلاب أكثر صعوبة
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statistics.totalAttempts === 0 ? (
            <div className="text-center py-6 text-slate-500">
              لم يتم إجراء أي محاولات على هذا الامتحان بعد.
            </div>
          ) : (
            <div className="space-y-4">
              {statistics.questionStats.map((question, index) => (
                <div key={question.questionId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">س {index + 1}: {question.text}</div>
                      <div className="text-sm text-slate-500">
                        {question.correctRate}% صحيح ({question.attemptCount} محاولة)
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={question.correctRate} 
                    className="h-2" 
                    indicatorClassName={question.correctRate < 50 ? "bg-red-500" : 
                      question.correctRate < 75 ? "bg-amber-500" : "bg-green-500"}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>أداء الطلاب</CardTitle>
          <CardDescription>
            عرض وترتيب نتائج امتحانات الطلاب
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statistics.totalAttempts === 0 ? (
            <div className="text-center py-6 text-slate-500">
              لم يتم إجراء أي محاولات على هذا الامتحان بعد.
            </div>
          ) : (
            <div>
              <StudentPerformanceTable studentResults={statistics.studentResults} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 