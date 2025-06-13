'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Pencil, Trash, GripVertical, CheckCircle, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmModal } from '@/components/modals/confirm-modal';
import { QuizQuestionEditForm } from './quiz-question-edit-form';

interface QuizQuestionsListProps {
  courseId: string;
  chapterId: string;
  quizId: string;
  questions: Array<{
    id: string;
    position: number;
    question: {
      id: string;
      text: string;
      type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
      difficulty: 'EASY' | 'MEDIUM' | 'HARD';
      points: number;
      explanation?: string;
      options: Array<{
        id: string;
        text: string;
        isCorrect: boolean;
      }>;
    };
  }>;
  isLocked: boolean;
}

export const QuizQuestionsList = ({ 
  courseId, 
  chapterId, 
  quizId, 
  questions, 
  isLocked 
}: QuizQuestionsListProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);

  const onDelete = async (questionId: string) => {
    try {
      setIsDeleting(questionId);
      await axios.delete(`/api/courses/${courseId}/chapters/${chapterId}/quiz/questions/${questionId}`);
      toast.success('تم حذف السؤال بنجاح');
      router.refresh();
    } catch (error) {
      toast.error('حدث خطأ أثناء حذف السؤال');
    } finally {
      setIsDeleting(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'HARD':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'سهل';
      case 'MEDIUM':
        return 'متوسط';
      case 'HARD':
        return 'صعب';
      default:
        return difficulty;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE':
        return 'اختيار من متعدد';
      case 'TRUE_FALSE':
        return 'صح أو خطأ';
      default:
        return type;
    }
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 dark:text-gray-400 font-arabic">
          لا توجد أسئلة بعد. ابدأ بإضافة سؤال جديد.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((quizQuestion, index) => (
        editingQuestion === quizQuestion.question.id ? (
          <QuizQuestionEditForm
            key={`edit-${quizQuestion.question.id}`}
            courseId={courseId}
            chapterId={chapterId}
            question={quizQuestion.question}
            onCancel={() => setEditingQuestion(null)}
            onSuccess={() => setEditingQuestion(null)}
          />
        ) : (
          <Card key={quizQuestion.id} className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 flex-wrap">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 font-arabic">
                    السؤال {index + 1}
                  </span>
                  <Badge variant="outline" className="font-arabic">
                    {getTypeText(quizQuestion.question.type)}
                  </Badge>
                  <Badge 
                    className={`font-arabic ${getDifficultyColor(quizQuestion.question.difficulty)}`}
                  >
                    {getDifficultyText(quizQuestion.question.difficulty)}
                  </Badge>
                  <Badge variant="secondary" className="font-arabic">
                    {quizQuestion.question.points} نقطة
                  </Badge>
                </div>
                <CardTitle className="text-lg font-arabic leading-relaxed">
                  {quizQuestion.question.text}
                </CardTitle>
              </div>
              
              {!isLocked && (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="font-arabic"
                    onClick={() => setEditingQuestion(quizQuestion.question.id)}
                  >
                    <Pencil className="h-4 w-4 ml-1" />
                    تعديل
                  </Button>
                  <ConfirmModal
                    onConfirm={() => onDelete(quizQuestion.question.id)}
                  >
                    <Button 
                      variant="ghost" 
                      size="sm"
                      disabled={isDeleting === quizQuestion.question.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 font-arabic"
                    >
                      <Trash className="h-4 w-4 ml-1" />
                      حذف
                    </Button>
                  </ConfirmModal>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Options */}
            <div className="space-y-2">
              {quizQuestion.question.options.map((option, optionIndex) => (
                <div 
                  key={option.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    option.isCorrect 
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800' 
                      : 'bg-gray-50 border-gray-200 dark:bg-gray-900/10 dark:border-gray-800'
                  }`}
                >
                  {option.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                  <span className={`font-arabic ${
                    option.isCorrect 
                      ? 'text-green-800 dark:text-green-300 font-semibold' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {option.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Explanation */}
            {quizQuestion.question.explanation && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/10 dark:border-blue-800">
                <div className="text-sm font-semibold text-blue-800 dark:text-blue-300 font-arabic mb-1">
                  تفسير الإجابة:
                </div>
                <div className="text-blue-700 dark:text-blue-300 font-arabic">
                  {quizQuestion.question.explanation}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        )
      ))}

      {isLocked && (
        <div className="text-center py-4 text-yellow-700 dark:text-yellow-300 font-arabic">
          الاختبار منشور - لا يمكن تعديل الأسئلة
        </div>
      )}
    </div>
  );
}; 