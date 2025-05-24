'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ExamClientProps {
  examId: string;
  activeAttemptId?: string;
  timeLimit?: number | null;
  userId?: string;
  title?: string;
}

export const ExamClient = ({ examId, activeAttemptId, timeLimit, userId, title = 'امتحان' }: ExamClientProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExamStart = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // If there's an active attempt, redirect to it
      if (activeAttemptId) {
        router.push(`/exam/${examId}/attempt/${activeAttemptId}`);
        return;
      }

      // Otherwise, create a new attempt
      const response = await axios.post(
        `/api/exam/${examId}/attempt`,
        {},
        {
          timeout: 10000, // 10s timeout
        },
      );
      const attempt = response.data;

      toast.success('تم بدء الامتحان بنجاح');
      router.push(`/exam/${examId}/attempt/${attempt.id}`);
    } catch (error) {
      console.error('Exam start error:', error);
      setError(error instanceof Error ? error.message : 'فشل في بدء الامتحان. برجاء المحاولة مرة أخرى.');
      toast.error('فشل في بدء الامتحان');
    } finally {
      setIsLoading(false);
    }
  };

  const continueAttempt = () => {
    if (activeAttemptId) {
      setIsLoading(true);
      router.push(`/exam/${examId}/attempt/${activeAttemptId}`);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-right">{error}</AlertDescription>
        </Alert>
      )}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            disabled={isLoading}
            variant={activeAttemptId ? 'secondary' : 'default'}
            aria-label={activeAttemptId ? 'استكمال الامتحان' : 'بدء الامتحان'}
            className={`w-full md:w-auto ${activeAttemptId ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
          >
            {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            {activeAttemptId ? 'استكمال المحاولة' : 'بدء الامتحان'}
            {timeLimit && !activeAttemptId && ` (${timeLimit} دقيقة)`}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">
              {activeAttemptId ? 'استكمال المحاولة' : 'بدء الامتحان'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              {activeAttemptId
                ? 'هل أنت متأكد من استكمال المحاولة السابقة؟'
                : 'هل أنت متأكد من بدء الامتحان؟ بمجرد البدء، سيبدأ العد التنازلي للوقت.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={activeAttemptId ? continueAttempt : handleExamStart}>متابعة</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
