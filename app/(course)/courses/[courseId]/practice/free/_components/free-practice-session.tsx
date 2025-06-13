'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  CheckCircle, 
  XCircle, 
  BookOpen,
  Target,
  RotateCcw,
  Lightbulb,
  Award,
  Infinity,
  Brain,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MathRenderer } from '@/components/math-renderer';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'PASSAGE';
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  points?: number;
  explanation?: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  passage?: {
    id: string;
    title: string;
    content: string;
  };
  questionBank: {
    title: string;
    chapterId?: string;
  };
  attemptCount: number;
  lastAttempt?: {
    selectedOptionId: string;
    isCorrect: boolean;
    createdAt: string;
  };
}

interface SessionData {
  sessionId: string;
  courseId: string;
  mode: string;
  selectedChapters: { id: string; title: string }[];
  questions: Question[];
  totalQuestions: number;
  timeLimit: null;
}

interface FreePracticeSessionProps {
  sessionData: SessionData;
  onExit: () => void;
}

export const FreePracticeSession: React.FC<FreePracticeSessionProps> = ({
  sessionData,
  onExit,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [answerResult, setAnswerResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Session stats
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);

  const currentQuestion = sessionData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / sessionData.questions.length) * 100;
  const accuracy = questionsAnswered > 0 ? (correctAnswers / questionsAnswered) * 100 : 0;

  // Reset state when question changes
  useEffect(() => {
    setSelectedOption('');
    setShowAnswer(false);
    setAnswerResult(null);
  }, [currentQuestionIndex]);

  const renderContent = (content: string) => {
    if (!content) return null;
    return <MathRenderer content={content} />;
  };

  const handleOptionSelect = (optionId: string) => {
    if (!showAnswer) {
      setSelectedOption(optionId);
    }
  };

  const submitAnswer = () => {
    if (!selectedOption || !currentQuestion) return;

    setIsSubmitting(true);
    
    const selectedOptionObj = currentQuestion.options.find(opt => opt.id === selectedOption);
    const isCorrect = selectedOptionObj?.isCorrect || false;

    const result = {
      questionId: currentQuestion.id,
      selectedOptionId: selectedOption,
      isCorrect,
      correctAnswer: currentQuestion.options.find(opt => opt.isCorrect),
      explanation: currentQuestion.explanation
    };

    setAnswerResult(result);
    setShowAnswer(true);

    // Update stats
    setQuestionsAnswered(prev => prev + 1);
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setCurrentStreak(prev => prev + 1);
      toast.success('إجابة صحيحة! 🎉');
    } else {
      setCurrentStreak(0);
      toast.error('إجابة خاطئة');
    }

    setIsSubmitting(false);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < sessionData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      toast.success(`تم إنهاء التدريب! النقاط: ${correctAnswers}/${questionsAnswered} - الدقة: ${accuracy.toFixed(1)}%`);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const retryQuestion = () => {
    setSelectedOption('');
    setShowAnswer(false);
    setAnswerResult(null);
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-xl text-gray-800">
              <Award className="h-6 w-6 text-yellow-500" />
              انتهى التدريب الحر
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-green-800 font-bold">{correctAnswers}</div>
                <div className="text-green-600">إجابة صحيحة</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-blue-800 font-bold">{accuracy.toFixed(1)}%</div>
                <div className="text-blue-600">دقة الإجابات</div>
              </div>
            </div>
            <Button onClick={onExit} className="w-full">
              العودة للقائمة الرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onExit} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                إنهاء التدريب
              </Button>
              <div className="flex items-center gap-2">
                <Infinity className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-800">التدريب الحر</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="text-gray-600">الدقة:</span>
                <span className="font-bold text-green-600">{accuracy.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-600" />
                <span className="text-gray-600">السلسلة:</span>
                <span className="font-bold text-orange-600">{currentStreak}</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <span className="text-gray-600">الأسئلة:</span>
                <span className="font-bold text-purple-600">{questionsAnswered}/{sessionData.questions.length}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>السؤال {currentQuestionIndex + 1} من {sessionData.questions.length}</span>
              <span>{progress.toFixed(1)}% مكتمل</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">
                  {currentQuestion.type === 'MULTIPLE_CHOICE' ? 'اختيار متعدد' : 
                   currentQuestion.type === 'TRUE_FALSE' ? 'صح أو خطأ' : 'قطعة فهم'}
                </Badge>
                {currentQuestion.questionBank?.title && (
                  <Badge variant="outline" className="text-purple-600 bg-purple-50 border-purple-200">
                    {currentQuestion.questionBank.title}
                  </Badge>
                )}
              </div>
            </div>

            <CardTitle className="text-xl leading-relaxed">
              {renderContent(currentQuestion.text)}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {currentQuestion.passage && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {currentQuestion.passage.title}
                </h3>
                <div className="text-gray-700 leading-relaxed">
                  {renderContent(currentQuestion.passage.content)}
                </div>
              </div>
            )}

            <RadioGroup
              value={selectedOption}
              onValueChange={handleOptionSelect}
              disabled={showAnswer}
              className="space-y-3"
            >
              {currentQuestion.options.map((option) => (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center space-x-3 space-x-reverse p-4 rounded-lg border transition-all",
                    !showAnswer && "hover:bg-gray-50 cursor-pointer",
                    showAnswer && option.isCorrect && "bg-green-50 border-green-200",
                    showAnswer && selectedOption === option.id && !option.isCorrect && "bg-red-50 border-red-200",
                    selectedOption === option.id && !showAnswer && "bg-blue-50 border-blue-200"
                  )}
                >
                  <RadioGroupItem
                    value={option.id}
                    id={option.id}
                    disabled={showAnswer}
                  />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer leading-relaxed">
                    {renderContent(option.text)}
                  </Label>
                  {showAnswer && option.isCorrect && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {showAnswer && selectedOption === option.id && !option.isCorrect && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              ))}
            </RadioGroup>

            {showAnswer && currentQuestion.explanation && (
              <Alert className="mt-6">
                <Lightbulb className="h-4 w-4" />
                <AlertDescription className="leading-relaxed">
                  <strong>التفسير:</strong> {renderContent(currentQuestion.explanation)}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between mt-8">
              <div className="flex items-center gap-2">
                {currentQuestionIndex > 0 && (
                  <Button variant="outline" onClick={previousQuestion}>
                    <ChevronRight className="h-4 w-4 mr-1" />
                    السابق
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!showAnswer ? (
                  <Button
                    onClick={submitAnswer}
                    disabled={!selectedOption || isSubmitting}
                    className="px-8"
                  >
                    {isSubmitting ? 'جاري الإرسال...' : 'إرسال الإجابة'}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={retryQuestion}>
                      <RotateCcw className="h-4 w-4 mr-1" />
                      إعادة المحاولة
                    </Button>
                    
                    {currentQuestionIndex < sessionData.questions.length - 1 ? (
                      <Button onClick={nextQuestion}>
                        التالي
                        <ChevronLeft className="h-4 w-4 ml-1" />
                      </Button>
                    ) : (
                      <Button onClick={onExit} className="bg-green-600 hover:bg-green-700">
                        إنهاء التدريب
                        <Award className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 