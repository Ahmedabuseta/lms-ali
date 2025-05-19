'use client'

import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface QuestionReviewProps {
  question: {
    id: string
    text: string
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE'
    options: {
      id: string
      text: string
      isCorrect: boolean
    }[]
  }
  questionNumber: number
  userAnswer?: {
    id: string
    text: string
  } | null
  correctAnswer?: {
    id: string
    text: string
  } | null
  isCorrect?: boolean | null
  isUnanswered: boolean
}

export const QuestionReview = ({
  question,
  questionNumber,
  userAnswer,
  correctAnswer,
  isCorrect,
  isUnanswered
}: QuestionReviewProps) => {
  return (
    <Card className={cn(
      "border-2",
      isCorrect === true && "border-green-200 dark:border-green-800",
      isCorrect === false && "border-red-200 dark:border-red-800",
      isUnanswered && "border-amber-200 dark:border-amber-800"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{questionNumber}</span>
          </div>
          <div className="space-y-4 flex-1">
            <div className="text-right">
              <p className="text-base font-medium text-slate-900 dark:text-slate-100">{question.text}</p>
            </div>
            <div className="space-y-2">
              {question.options.map((option) => (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-3",
                    option.isCorrect && "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50",
                    userAnswer?.id === option.id && !option.isCorrect && "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50",
                    userAnswer?.id === option.id && option.isCorrect && "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50",
                    !option.isCorrect && userAnswer?.id !== option.id && "border-slate-200 dark:border-slate-800"
                  )}
                >
                  <div className="flex items-center gap-x-2">
                    {option.isCorrect && <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />}
                    {userAnswer?.id === option.id && !option.isCorrect && (
                      <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
                    )}
                    <span className={cn(
                      "text-slate-900 dark:text-slate-100",
                      option.isCorrect && "text-green-600 dark:text-green-400",
                      userAnswer?.id === option.id && !option.isCorrect && "text-red-600 dark:text-red-400"
                    )}>
                      {option.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {isUnanswered && (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">لم يتم الإجابة على هذا السؤال</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}