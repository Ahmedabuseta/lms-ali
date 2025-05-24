'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Clock } from 'lucide-react';
import { formatTime } from '@/lib/utils';

interface ExamTimerProps {
  timeLimit: number;
  startedAt: string;
  attemptId: string;
  examId: string;
}

export const ExamTimer = ({ timeLimit, startedAt, attemptId, examId }: ExamTimerProps) => {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isWarning, setIsWarning] = useState(false);
  const [isAlmostTimeUp, setIsAlmostTimeUp] = useState(false);

  useEffect(() => {
    // Get the end time (start time + time limit)
    const startTime = new Date(startedAt).getTime();
    const endTime = startTime + timeLimit * 60 * 1000;

    // Check if we have stored end time in localStorage (for tab refresh)
    const storedTimerKey = `exam_timer_${attemptId}`;
    const storedTimer = localStorage.getItem(storedTimerKey);

    // If we've stored the timer before, use that end time
    // otherwise, use the calculated end time and store it
    if (!storedTimer) {
      localStorage.setItem(
        storedTimerKey,
        JSON.stringify({
          endTime,
          timeLimit,
        }),
      );
    }

    const timerEndTime = storedTimer ? JSON.parse(storedTimer).endTime : endTime;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const remaining = timerEndTime - now;

      if (remaining <= 0) {
        clearInterval(timer);
        // Clean up timer from local storage
        localStorage.removeItem(storedTimerKey);
        // Auto-submit when time is up
        router.push(`/exam/${examId}/attempt/${attemptId}/submit`);
        return;
      }

      setTimeLeft(remaining);

      // Show warnings at different time thresholds
      if (remaining <= 60 * 1000) {
        // 1 minute
        setIsAlmostTimeUp(true);
        // Show a toast notification
        if (!document.hidden) {
          const notification = new Audio('/sounds/timer-alert.mp3');
          notification.volume = 0.5;
          notification.play().catch((e) => console.error('Error playing sound', e));
        }
      } else if (remaining <= 5 * 60 * 1000) {
        // 5 minutes
        setIsWarning(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLimit, startedAt, attemptId, examId, router]);

  return (
    <div className="space-y-2">
      <Card
        className={`p-4 transition-colors ${
          isAlmostTimeUp
            ? 'animate-pulse border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/50'
            : isWarning
              ? 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50'
              : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock
              className={`ml-2 h-5 w-5 ${
                isAlmostTimeUp
                  ? 'text-red-500 dark:text-red-400'
                  : isWarning
                    ? 'text-amber-500 dark:text-amber-400'
                    : 'text-primary'
              }`}
            />
            <div
              className={`text-right text-lg font-medium ${
                isAlmostTimeUp
                  ? 'text-red-600 dark:text-red-400'
                  : isWarning
                    ? 'text-amber-600 dark:text-amber-400'
                    : ''
              }`}
            >
              الوقت المتبقي: {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </Card>

      {isWarning && (
        <Alert variant={isAlmostTimeUp ? 'destructive' : 'default'} className="animate-pulse">
          <AlertTriangle className="ml-2 h-4 w-4" />
          <AlertDescription className="text-right">
            {isAlmostTimeUp
              ? 'أقل من دقيقة متبقية! سيتم تسليم الامتحان تلقائياً.'
              : 'فاضل أقل من 5 دقايق! لو سمحت احفظ إجاباتك بسرعة.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
