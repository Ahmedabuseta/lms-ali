'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, FileQuestion } from 'lucide-react';
import { OptionItem } from './option-item';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MathRenderer } from '@/components/math-renderer';

interface Question {
  id: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  difficulty?: string;
}

interface SavedAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
}

interface QuestionCardProps {
  question: Question;
  onNext: () => void;
  onPrevious: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  savedAnswer?: SavedAnswer;
  onAnswerSubmit?: (questionId: string, selectedOptionId: string, isCorrect: boolean) => void;
}

export const QuestionCard = ({
  question,
  onNext,
  onPrevious,
  isFirstQuestion,
  isLastQuestion,
  savedAnswer,
  onAnswerSubmit,
}: QuestionCardProps) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  // Load saved answer if available
  useEffect(() => {
    if (savedAnswer) {
      setSelectedOptionId(savedAnswer.selectedOptionId);
      setShowAnswer(true);
    } else {
      setSelectedOptionId(null);
      setShowAnswer(false);
    }
  }, [savedAnswer, question.id]);

  const handleOptionSelect = (optionId: string) => {
    if (!showAnswer) {
      setSelectedOptionId(optionId);
      setShowAnswer(true);

      // Save the answer
      const selectedOption = question.options.find((opt) => opt.id === optionId);
      if (selectedOption && onAnswerSubmit) {
        onAnswerSubmit(question.id, optionId, selectedOption.isCorrect);
      }
    }
  };

  const handleNext = () => {
    onNext();
  };

  const handlePrevious = () => {
    onPrevious();
  };

  const getAnswerStatus = () => {
    if (!showAnswer || !selectedOptionId) return null;
    const selectedOption = question.options.find((opt) => opt.id === selectedOptionId);
    return selectedOption?.isCorrect ? 'صحيح' : 'خطأ';
  };

  const answerStatus = getAnswerStatus();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5" />
            <span>السؤال</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            {answerStatus && (
              <Badge variant={answerStatus === 'صحيح' ? 'default' : 'destructive'}>{answerStatus}</Badge>
            )}
            {question.difficulty && (
              <Badge variant="secondary">
                {question.difficulty === 'EASY' && 'سهل'}
                {question.difficulty === 'MEDIUM' && 'متوسط'}
                {question.difficulty === 'HARD' && 'صعب'}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="text-lg leading-relaxed">
            <MathRenderer content={question.text} />
          </div>
        </div>

        <div className="space-y-2">
          {question.options.map((option) => (
            <OptionItem
              key={option.id}
              option={option}
              isSelected={selectedOptionId === option.id}
              showAnswer={showAnswer}
              onSelect={() => handleOptionSelect(option.id)}
              isDisabled={showAnswer}
            />
          ))}
        </div>

        {showAnswer && (
          <div className="pt-4">
            <Separator className="mb-4" />
            <div className="text-sm">
              <p className="mb-1 font-medium">التوضيح:</p>
              <p className="text-slate-600">
                {question.options.find((opt) => opt.isCorrect)?.text} هي الإجابة الصحيحة.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={isFirstQuestion}>
          <ArrowRight className="ml-2 h-4 w-4" />
          السابق
        </Button>

        <Button onClick={handleNext} disabled={isLastQuestion || !showAnswer}>
          التالي
          <ArrowLeft className="mr-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
