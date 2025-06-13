'use client';

import axios from 'axios';
import { Loader2, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/modals/confirm-modal';
import { cn } from '@/lib/utils';

interface ExamActionsProps { disabled: boolean;
  examId: string;
  isPublished: boolean; }

export const ExamActions = ({ disabled, examId, isPublished }: ExamActionsProps) => { const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);

      if (isPublished) {
        await axios.patch(`/api/exam/${examId }/unpublish`);
        toast.success('تم إيقاف نشر الامتحان');
      } else {
        await axios.patch(`/api/exam/${examId}/publish`);
        toast.success('تم نشر الامتحان');
      }

      router.refresh();
    } catch {
      toast.error('حدث خطأ ما');
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      await axios.delete(`/api/exam/${examId}`);
      toast.success('تم حذف الامتحان');
      router.push('/teacher/exam');
    } catch {
      toast.error('حدث خطأ ما');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-x-2">
      <Button
        onClick={onClick}
        disabled={disabled || isLoading}
        variant="outline"
        size="sm"
        className={ cn('relative', (disabled || isLoading) && 'cursor-not-allowed opacity-50') }
      >
        { isLoading ? (
          <>
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            جاري التحديث...
          </>
        ) : (
          <>{isPublished ? 'إيقاف النشر' : 'نشر' }</>
        )}
      </Button>
      <ConfirmModal onConfirm={onDelete}>
        <Button
          size="sm"
          disabled={isDeleting}
          className={ cn('relative', isDeleting && 'cursor-not-allowed opacity-50') }
        >
          { isDeleting ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري الحذف...
            </>
          ) : (
            <>
              <Trash className="ml-2 h-4 w-4" />
              حذف
            </>
          ) }
        </Button>
      </ConfirmModal>
    </div>
  );
};
