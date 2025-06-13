'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatTime } from '@/lib/utils';

interface ExamTimerProps {
  timeLimit: number;
  startedAt: string;
  attemptId: string;
  examId: string;
}

export const ExamTimer = ({ timeLimit, startedAt, attemptId, examId }: ExamTimerProps) => {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isWarning, setIsWarning] = useState(false);
  const [isAlmostTimeUp, setIsAlmostTimeUp] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Ensure we're on the client side before showing time
  useEffect(() => {
    setIsClient(true);
    
    // Add debug information
    const startTime = new Date(startedAt);
    const now = new Date();
    setDebugInfo(`Start: ${startTime.toLocaleTimeString()}, Now: ${now.toLocaleTimeString()}, Limit: ${timeLimit}min`);
  }, [startedAt, timeLimit]);

  useEffect(() => {
    if (!isClient) return;

    // Validate inputs
    if (!startedAt || !timeLimit || timeLimit <= 0) {
      console.error('Invalid timer parameters:', { startedAt, timeLimit });
      setTimeLeft(0);
      return;
    }

    // Calculate initial time left
    const startTime = new Date(startedAt).getTime();
    const now = new Date().getTime();
    const endTime = startTime + timeLimit * 60 * 1000;
    const initialTimeLeft = Math.max(0, endTime - now);

    // Debug logging
    console.log('Timer Debug:', {
      startedAt,
      startTime: new Date(startTime).toLocaleString(),
      now: new Date(now).toLocaleString(),
      endTime: new Date(endTime).toLocaleString(),
      timeLimit,
      initialTimeLeft,
      initialTimeLeftMinutes: Math.floor(initialTimeLeft / 60000),
    });

    // If time has already expired, redirect immediately
    if (initialTimeLeft <= 0) {
      console.log('Time already expired, redirecting...');
      router.push(`/exam/${examId}/attempt/${attemptId}/submit`);
      return;
    }

    // Set initial time left
    setTimeLeft(initialTimeLeft);

    // Check if we have stored end time in localStorage (for tab refresh)
    const storedTimerKey = `exam_timer_${attemptId}`;
    const storedTimer = localStorage.getItem(storedTimerKey);

    let timerEndTime = endTime;

    // If we've stored the timer before, use that end time
    // otherwise, use the calculated end time and store it
    if (storedTimer) {
      try {
        const parsed = JSON.parse(storedTimer);
        timerEndTime = parsed.endTime;
        
        // Validate stored time - if it's too far off, recalculate
        const timeDiff = Math.abs(timerEndTime - endTime);
        if (timeDiff > 60000) { // More than 1 minute difference
          console.log('Stored timer time differs significantly, recalculating...');
          timerEndTime = endTime;
          localStorage.setItem(
            storedTimerKey,
            JSON.stringify({
              endTime,
              timeLimit,
              startedAt,
            }),
          );
        }
      } catch (error) {
        console.error('Error parsing stored timer:', error);
        timerEndTime = endTime;
        localStorage.setItem(
          storedTimerKey,
          JSON.stringify({
            endTime,
            timeLimit,
            startedAt,
          }),
        );
      }
    } else {
      localStorage.setItem(
        storedTimerKey,
        JSON.stringify({
          endTime,
          timeLimit,
          startedAt,
        }),
      );
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const remaining = Math.max(0, timerEndTime - now);

      if (remaining <= 0) {
        clearInterval(timer);
        // Clean up timer from local storage
        localStorage.removeItem(storedTimerKey);
        // Auto-submit when time is up
        console.log('Timer expired, auto-submitting...');
        router.push(`/exam/${examId}/attempt/${attemptId}/submit`);
        return;
      }

      setTimeLeft(remaining);

      // Show warnings at different time thresholds
      if (remaining <= 60 * 1000) {
        // 1 minute
        setIsAlmostTimeUp(true);
        // Show a toast notification (only once per session)
        if (!document.hidden && !sessionStorage.getItem(`timer_alert_${attemptId}`)) {
          sessionStorage.setItem(`timer_alert_${attemptId}`, 'shown');
          try {
          const notification = new Audio('/sounds/timer-alert.mp3');
          notification.volume = 0.5;
          notification.play().catch((e) => console.error('Error playing sound', e));
          } catch (error) {
            console.error('Error with audio notification:', error);
          }
        }
      } else if (remaining <= 5 * 60 * 1000) {
        // 5 minutes
        setIsWarning(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLimit, startedAt, attemptId, examId, router, isClient]);

  // Don't render on server or while loading on client
  if (!isClient || timeLeft === null) {
    return (
      <div className="space-y-2">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="ml-2 h-5 w-5 text-primary" />
              <div className="text-right text-lg font-medium">
                الوقت المتبقي: جاري التحميل...
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

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
        
        {/* Debug info - only show in development */}
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <div className="mt-2 text-xs text-gray-500 border-t pt-2">
            Debug: {debugInfo}
          </div>
        )}
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
