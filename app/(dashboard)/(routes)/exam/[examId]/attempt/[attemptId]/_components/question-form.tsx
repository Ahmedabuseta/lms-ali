'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Loader2, Save } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MathRenderer } from '@/components/math-renderer';

interface QuestionFormProps {
  question: {
    id: string;
    text: string;
    type: string;
    options: {
      id: string;
      text: string;
    }[];
  };
  selectedOptionId: string | null;
  attemptId: string;
  userId: string;
  examId: string;
  currentQuestionIndex: number;
  totalQuestions: number;
}

export const QuestionForm = ({
  question,
  selectedOptionId,
  attemptId,
  userId,
  examId,
  currentQuestionIndex,
  totalQuestions,
}: QuestionFormProps) => {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>(selectedOptionId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [localAnswers, setLocalAnswers] = useState<Record<string, string>>({});

  // Initialize local answers from localStorage on component mount
  useEffect(() => {
    const savedAnswers = localStorage.getItem(`exam_answers_${attemptId}`);
    if (savedAnswers) {
      try {
        const parsed = JSON.parse(savedAnswers);
        setLocalAnswers(parsed);

        // If we have a local answer for this question but no server answer, use it
        if (!selectedOptionId && parsed[question.id]) {
          setSelectedOption(parsed[question.id]);
        }
      } catch (e) {
        console.error('Error parsing saved answers', e);
      }
    }
  }, [attemptId, question.id, selectedOptionId]);

  // Save answer to server with debounce
  const saveAnswer = async (optionId: string) => {
    try {
      // Store answer locally first for instant feedback
      const updatedAnswers = {
        ...localAnswers,
        [question.id]: optionId,
      };
      setLocalAnswers(updatedAnswers);
      localStorage.setItem(`exam_answers_${attemptId}`, JSON.stringify(updatedAnswers));

      setIsSubmitting(true);

      await axios.post(`/api/exam/answer`, {
        attemptId,
        questionId: question.id,
        optionId,
      });

      setShowSavedIndicator(true);
      setTimeout(() => setShowSavedIndicator(false), 2000);
    } catch (error) {
      console.error('Error saving answer:', error);
      toast.error('فشل في حفظ الإجابة، سيتم المحاولة مرة أخرى تلقائياً');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle option selection with debounced saving
  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set a new timeout to save the answer after 500ms
    saveTimeoutRef.current = setTimeout(() => {
      saveAnswer(optionId);
    }, 500);
  };

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Navigate to next question
  const goToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      router.push(`/exam/${examId}/attempt/${attemptId}?questionIndex=${currentQuestionIndex + 1}`);
    }
  };

  // Navigate to previous question
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      router.push(`/exam/${examId}/attempt/${attemptId}?questionIndex=${currentQuestionIndex - 1}`);
    }
  };

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="flex flex-row-reverse items-center justify-between">
          <span className="text-right">
            سؤال {currentQuestionIndex + 1} من {totalQuestions}
          </span>
          {showSavedIndicator && (
            <span className="animate-pulse text-xs text-green-600 dark:text-green-400">تم حفظ الإجابة ✓</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="prose dark:prose-invert max-w-none text-right">
          <MathRenderer content={question.text} />
        </div>

        <RadioGroup value={selectedOption || ''} onValueChange={handleOptionSelect} className="space-y-4">
          {question.options.map((option) => (
            <div
              key={option.id}
              className={`flex items-center space-x-2 space-x-reverse rounded-md border p-3 transition-colors ${
                selectedOption === option.id ? 'border-primary bg-primary/10 dark:bg-primary/20' : 'hover:bg-accent'
              }`}
            >
              <RadioGroupItem value={option.id} id={option.id} />
              <Label htmlFor={option.id} className="flex-grow cursor-pointer text-right">
                <MathRenderer content={option.text} />
              </Label>
            </div>
          ))}
        </RadioGroup>

        {isSubmitting && (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="mr-2 text-xs text-muted-foreground">جاري الحفظ...</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <Button variant="outline" onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0}>
          <ChevronRight className="ml-2 h-4 w-4" />
          السؤال السابق
        </Button>

        <Button variant="outline" onClick={goToNextQuestion} disabled={currentQuestionIndex === totalQuestions - 1}>
          السؤال التالي
          <ChevronLeft className="mr-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
