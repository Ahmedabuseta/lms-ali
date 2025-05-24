'use client';

import { CheckCircle2, Circle, CircleDashed, Clock, HelpCircle, Save } from 'lucide-react';

interface ProgressIndicatorProps {
  totalQuestions: number;
  answeredQuestions: number;
  timeRemaining?: string;
  hasUnsavedChanges?: boolean;
}

export function ProgressIndicator({
  totalQuestions,
  answeredQuestions,
  timeRemaining,
  hasUnsavedChanges = false,
}: ProgressIndicatorProps) {
  const progress = Math.round((answeredQuestions / totalQuestions) * 100);

  // Determine color based on progress
  const getProgressColor = () => {
    if (progress < 25) return 'text-red-500 dark:text-red-400';
    if (progress < 50) return 'text-amber-500 dark:text-amber-400';
    if (progress < 75) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-green-500 dark:text-green-400';
  };

  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-lg border bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:flex-row">
      <div className="flex w-full items-center gap-4 sm:w-auto">
        <div className="flex flex-col items-center justify-center">
          <div className={`text-2xl font-bold ${getProgressColor()}`} aria-label="Progress percentage">
            {progress}%
          </div>
          <div className="text-xs text-muted-foreground">التقدم</div>
        </div>
        <div className="flex flex-1 items-center gap-1">
          {Array.from({ length: totalQuestions }).map((_, i) => {
            const isAnswered = i < answeredQuestions;
            return (
              <div
                key={i}
                className={`max-w-2 h-2 flex-1 rounded-full transition-colors ${
                  isAnswered ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                }`}
                title={`سؤال ${i + 1}${isAnswered ? ': تمت الإجابة' : ': لم تتم الإجابة'}`}
              />
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">
            {answeredQuestions}/{totalQuestions}
          </span>
        </div>

        {hasUnsavedChanges && (
          <div className="flex items-center gap-1 text-amber-600">
            <Save className="h-4 w-4" />
            <span className="text-xs">تغييرات غير محفوظة</span>
          </div>
        )}

        {timeRemaining && (
          <div className="ml-3 flex items-center gap-1 text-primary">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">{timeRemaining}</span>
          </div>
        )}
      </div>
    </div>
  );
}
