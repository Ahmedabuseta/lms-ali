'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle, CircleDashed, HelpCircle, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ExamNavigationProps {
  questions: {
    id: string;
  }[];
  questionAttempts: {
    questionId: string;
  }[];
  currentQuestionIndex: number;
  examId: string;
  attemptId: string;
}

export const ExamNavigation = ({
  questions,
  questionAttempts,
  currentQuestionIndex,
  examId,
  attemptId,
}: ExamNavigationProps) => {
  const router = useRouter();
  const [localAnswers, setLocalAnswers] = useState<Record<string, boolean>>({});

  // Load locally saved answers on mount
  useEffect(() => {
    const savedAnswers = localStorage.getItem(`exam_answers_${attemptId}`);
    if (savedAnswers) {
      try {
        const parsed = JSON.parse(savedAnswers);
        const answerMap: Record<string, boolean> = {};

        // Convert saved answers to a map of questionId => true
        Object.keys(parsed).forEach((questionId) => {
          answerMap[questionId] = true;
        });

        setLocalAnswers(answerMap);
      } catch (e) {
        console.error('Error parsing saved answers', e);
      }
    }
  }, [attemptId]);

  const navigateToQuestion = (index: number) => {
    router.push(`/exam/${examId}/attempt/${attemptId}?questionIndex=${index}`);
  };

  const goToSubmit = () => {
    router.push(`/exam/${examId}/attempt/${attemptId}/submit`);
  };

  // Function to check if a question has been answered (either locally or server)
  const isQuestionAnswered = (questionId: string): boolean => {
    return localAnswers[questionId] || questionAttempts.some((qa) => qa.questionId === questionId);
  };

  // Calculate progress
  const answeredCount = questions.filter((q) => isQuestionAnswered(q.id)).length;
  const totalQuestions = questions.length;
  const progress = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-right">
          <span>التنقل بين الأسئلة</span>
          <span className="text-sm font-normal text-muted-foreground">
            {answeredCount}/{totalQuestions}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-4 grid grid-cols-4 gap-2">
          {questions.map((question, index) => {
            const isAnswered = isQuestionAnswered(question.id);
            const isCurrent = index === currentQuestionIndex;

            return (
              <Button
                key={question.id}
                variant={isCurrent ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'relative h-10 w-10 p-0 transition-transform duration-200 hover:scale-110',
                  isAnswered &&
                    !isCurrent &&
                    'border-green-200 bg-green-50 text-green-600 hover:bg-green-100 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400 dark:hover:bg-green-900/40',
                  isCurrent && 'ring-2 ring-primary',
                  !isAnswered && !isCurrent && 'bg-accent',
                )}
                onClick={() => navigateToQuestion(index)}
              >
                <span>{index + 1}</span>
                {isAnswered && !isCurrent && (
                  <CheckCircle className="absolute -right-1 -top-1 h-3 w-3 text-green-500 dark:text-green-400" />
                )}
              </Button>
            );
          })}
        </div>

        <div className="mt-4 space-y-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-accent">
            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>تم الإجابة: {answeredCount}</span>
            <span>المتبقي: {totalQuestions - answeredCount}</span>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary text-xs text-primary-foreground">
              <span>1</span>
            </div>
            <span>السؤال الحالي</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex h-5 w-5 items-center justify-center rounded-md border border-green-200 bg-green-50 text-xs text-green-600 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
              <CheckCircle className="h-3 w-3" />
            </div>
            <span>تمت الإجابة</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex h-5 w-5 items-center justify-center rounded-md border border-border bg-accent text-xs">
              <CircleDashed className="h-3 w-3" />
            </div>
            <span>لم تتم الإجابة</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button onClick={goToSubmit} className="w-full" variant="secondary">
          <BookOpen className="ml-2 h-4 w-4" />
          تسليم الامتحان
        </Button>
      </CardFooter>
    </Card>
  );
};
