'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Loader2, SendHorizonal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExamSubmitActionProps {
  examId: string
  attemptId: string
  // userId is no longer needed since we'll get it from auth in the API
}

export const ExamSubmitAction = ({
  examId,
  attemptId
}: ExamSubmitActionProps) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      
      // Clear any locally stored answers for this attempt
      localStorage.removeItem(`exam_answers_${attemptId}`)
      
      // Submit the exam
      await axios.post(`/api/exam/${examId}/attempt/${attemptId}/submit`)
      
      toast.success('تم تسليم الامتحان بنجاح')
      router.push(`/exam/${examId}/results/${attemptId}`)
    } catch (error) {
      console.error('Error submitting exam:', error)
      toast.error('فشل في تسليم الامتحان')
      setIsDialogOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="default"
          className="w-full"
        >
          <SendHorizonal className="ml-2 h-4 w-4" />
          تسليم الامتحان
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="text-right">
        <AlertDialogHeader>
          <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
          <AlertDialogDescription>
            بمجرد تسليم الامتحان، لن تتمكن من تغيير إجاباتك. الأسئلة التي لم تجب عليها ستحسب كإجابات خاطئة.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row-reverse">
          <AlertDialogCancel disabled={isSubmitting}>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={cn(
              "relative",
              isSubmitting && "opacity-50 cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري التسليم...
              </>
            ) : (
              "تسليم نهائي"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}