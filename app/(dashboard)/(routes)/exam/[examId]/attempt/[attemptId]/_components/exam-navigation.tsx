'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle, CircleDashed, BookOpen, Target, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { IconBadge } from '@/components/icon-badge';

interface ExamNavigationProps {
  questions: any[];
  questionAttempts: any[];
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

  const totalQuestions = questions.length;
  const answeredCount = questionAttempts.length;
  const progress = Math.round((answeredCount / totalQuestions) * 100);

  const goToQuestion = (index: number) => {
    router.push(`/exam/${examId}/attempt/${attemptId}?questionIndex=${index}`);
  };

  const goToSubmit = () => {
    router.push(`/exam/${examId}/attempt/${attemptId}/submit`);
  };

  const isQuestionAnswered = (questionId: string) => {
    return questionAttempts.some((qa) => qa.questionId === questionId);
  };

  return (
    <Card className="sticky top-6 overflow-hidden border border-border/50 bg-card/60 shadow-lg backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-muted/5 via-transparent to-muted/10" />
      <CardHeader className="relative border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-3">
          <IconBadge icon={Navigation} variant="info" size="sm" />
          <div>
            <CardTitle className="text-lg font-semibold text-foreground font-arabic">التنقل بين الأسئلة</CardTitle>
            <p className="text-sm text-muted-foreground font-arabic">اختر السؤال للانتقال إليه</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative p-6">
        {/* Progress Overview */}
        <div className="mb-6 rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/5 p-4 border border-blue-500/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground font-arabic">التقدم العام</span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400 font-arabic">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted/40 backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground font-arabic mt-2">
            <span>تم الإجابة: {answeredCount}</span>
            <span>المتبقي: {totalQuestions - answeredCount}</span>
          </div>
        </div>

        {/* Question Grid */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {questions.map((question, index) => {
            const isAnswered = isQuestionAnswered(question.id);
            const isCurrent = index === currentQuestionIndex;

            return (
              <button
                key={question.id}
                onClick={() => goToQuestion(index)}
                className={`
                  relative flex h-10 w-10 items-center justify-center rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105
                  ${isCurrent
                    ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg border border-primary/30'
                    : isAnswered
                    ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/10 text-green-700 dark:text-green-300 border border-green-500/30 hover:from-green-500/30 hover:to-emerald-500/20'
                    : 'bg-gradient-to-br from-muted/50 to-muted/30 text-muted-foreground border border-border/50 hover:from-muted/70 hover:to-muted/50'
                  }
                `}
              >
                <span className="relative z-10 font-arabic">{index + 1}</span>
                {isCurrent && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 rounded-lg" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-xs text-primary-foreground font-arabic">
              1
            </div>
            <span className="text-foreground font-arabic">السؤال الحالي</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30">
              <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-foreground font-arabic">تمت الإجابة</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
              <CircleDashed className="h-3 w-3 text-muted-foreground" />
            </div>
            <span className="text-foreground font-arabic">لم تتم الإجابة</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="relative border-t border-border/50 bg-muted/20 pt-4">
        <Button 
          onClick={goToSubmit} 
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg border border-green-500/30 font-arabic group"
          size="lg"
        >
          <BookOpen className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
          تسليم الامتحان
        </Button>
      </CardFooter>
    </Card>
  );
};
