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
  Timer,
  Play,
  TrendingUp,
  Clock,
  Award
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { MathRenderer } from '@/components/math-renderer';
import { MDXRenderer } from '@/components/mdx-renderer';
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
  selectedChapters: { id: string; title: string }[];
  questions: Question[];
  totalQuestions: number;
  currentBatch: number;
  batchSize: number;
  hasMoreQuestions: boolean;
  settings: {
    difficulty: string;
    includePassages: boolean;
  };
}

interface EnhancedPracticeSessionProps {
  sessionData: SessionData;
  onExit: () => void;
}

interface QuestionResult {
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean | null;
  timeSpent: number;
  attempts: number;
}

export const EnhancedPracticeSession: React.FC<EnhancedPracticeSessionProps> = ({
  sessionData,
  onExit,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [answerResult, setAnswerResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  
  // Session state
  const [sessionResults, setSessionResults] = useState<QuestionResult[]>([]);
  const [sessionStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  
  // Stats
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [batchCompleted, setBatchCompleted] = useState(false);

  // Passage display state
  const [isPassageExpanded, setIsPassageExpanded] = useState(true);

  const currentQuestion = sessionData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / sessionData.questions.length) * 100;
  const overallProgress = (((sessionData.currentBatch - 1) * sessionData.batchSize + currentQuestionIndex + 1) / sessionData.totalQuestions) * 100;

  // Reset state when question changes
  useEffect(() => {
    setSelectedOption('');
    setShowAnswer(false);
    setAnswerResult(null);
    setQuestionStartTime(Date.now());
    
    // Pre-select last attempt if exists
    if (currentQuestion?.lastAttempt) {
      setSelectedOption(currentQuestion.lastAttempt.selectedOptionId);
    }
  }, [currentQuestionIndex, currentQuestion]);

  // Determine if content contains math (LaTeX or MDX)
  const containsMath = (text: string) => {
    return text.includes('$') || text.includes('\\') || text.includes('```');
  };

  // Smart content renderer - uses MDX for complex content, MathRenderer for simple math
  const renderContent = (content: string) => {
    if (!content) return null;
    
    if (containsMath(content)) {
      return <MDXRenderer content={content} />;
    }
    return <MathRenderer content={content} />;
  };

  const handleOptionSelect = (optionId: string) => {
    if (!showAnswer) {
      setSelectedOption(optionId);
    }
  };

  const submitAnswer = async () => {
    if (!selectedOption || !currentQuestion) return;

    setIsSubmitting(true);
    try {
      const selectedOptionObj = currentQuestion.options.find(opt => opt.id === selectedOption);
      const isCorrect = selectedOptionObj?.isCorrect || false;
      const timeSpent = Date.now() - questionStartTime;

      // Submit attempt
      const response = await axios.post('/api/practice/attempt', {
        sessionId: sessionData.sessionId,
        questionId: currentQuestion.id,
        selectedOptionId: selectedOption,
        isCorrect,
        timeSpent,
      });

      const result = response.data;
      setAnswerResult(result);
      setShowAnswer(true);

      // Update session results
      const questionResult: QuestionResult = {
        questionId: currentQuestion.id,
        selectedOptionId: selectedOption,
        isCorrect,
        timeSpent,
        attempts: 1,
      };

      setSessionResults(prev => {
        const existing = prev.findIndex(r => r.questionId === currentQuestion.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { ...updated[existing], ...questionResult, attempts: updated[existing].attempts + 1 };
          return updated;
        }
        return [...prev, questionResult];
      });

      // Update stats
      if (isCorrect) {
        setCorrectAnswers(prev => prev + 1);
      }
      setQuestionsAnswered(prev => prev + 1);

      toast.success(isCorrect ? 'إجابة صحيحة! 🎉' : 'إجابة خاطئة');
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('حدث خطأ في إرسال الإجابة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < sessionData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (!batchCompleted) {
      // Batch completed
      setBatchCompleted(true);
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
    setQuestionStartTime(Date.now());
  };

  const loadNextBatch = async () => {
    setIsLoadingNext(true);
    try {
      const response = await axios.get('/api/practice/session', {
        params: {
          sessionId: sessionData.sessionId,
          courseId: sessionData.courseId,
          chapterIds: sessionData.selectedChapters.map(c => c.id).join(','),
          batch: sessionData.currentBatch + 1,
          batchSize: sessionData.batchSize,
          difficulty: sessionData.settings.difficulty,
        }
      });

      const newSessionData = response.data;
      
      // Update the session data
      sessionData.questions = newSessionData.questions;
      sessionData.currentBatch = newSessionData.currentBatch;
      sessionData.hasMoreQuestions = newSessionData.hasMoreQuestions;
      
      setBatchCompleted(false);
      setCurrentQuestionIndex(0);
      setSessionResults([]);
      setQuestionsAnswered(0);
      setCorrectAnswers(0);
      
      toast.success('تم تحميل مجموعة أسئلة جديدة! 🚀');
    } catch (error) {
      console.error('Error loading next batch:', error);
      toast.error('حدث خطأ في تحميل الأسئلة الجديدة');
    } finally {
      setIsLoadingNext(false);
    }
  };

  const getBatchScore = () => {
    return questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'HARD': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getDifficultyLabel = (difficulty?: string) => {
    switch (difficulty) {
      case 'EASY': return 'سهل';
      case 'MEDIUM': return 'متوسط';
      case 'HARD': return 'صعب';
      default: return difficulty;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE': return 'اختيار متعدد';
      case 'TRUE_FALSE': return 'صح أم خطأ';
      case 'PASSAGE': return 'قطعة';
      default: return type;
    }
  };

  // Batch completion view
  if (batchCompleted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
              <CheckCircle className="h-6 w-6" />
              أحسنت! تمت المجموعة الحالية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Batch Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">{questionsAnswered}</div>
                <div className="text-sm text-gray-600">أسئلة مجابة</div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border">
                <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                <div className="text-sm text-gray-600">إجابات صحيحة</div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border">
                <div className="text-2xl font-bold text-purple-600">{getBatchScore()}%</div>
                <div className="text-sm text-gray-600">النتيجة</div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round((Date.now() - sessionStartTime) / 60000)}
                </div>
                <div className="text-sm text-gray-600">دقيقة</div>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>التقدم الإجمالي</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
              <div className="text-xs text-gray-600 text-center">
                المجموعة {sessionData.currentBatch} من أصل {Math.ceil(sessionData.totalQuestions / sessionData.batchSize)}
              </div>
            </div>

            {/* Performance Message */}
            <div className="text-center">
              {getBatchScore() >= 80 && (
                <div className="text-green-700 dark:text-green-300 font-semibold">
                  🌟 أداء ممتاز! استمر في التقدم
                </div>
              )}
              {getBatchScore() >= 60 && getBatchScore() < 80 && (
                <div className="text-yellow-700 dark:text-yellow-300 font-semibold">
                  👍 أداء جيد! يمكنك تحسين أكثر
                </div>
              )}
              {getBatchScore() < 60 && (
                <div className="text-orange-700 dark:text-orange-300 font-semibold">
                  💪 تحتاج المزيد من التدريب - لا تستسلم!
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" onClick={onExit}>
                <X className="h-4 w-4 mr-2" />
                إنهاء التدريب
              </Button>
              
              {sessionData.hasMoreQuestions && (
                <Button 
                  onClick={loadNextBatch}
                  disabled={isLoadingNext}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isLoadingNext ? 'جاري التحميل...' : '10 أسئلة أخرى'}
                </Button>
              )}
            </div>

            {!sessionData.hasMoreQuestions && (
              <Alert>
                <Award className="h-4 w-4" />
                <AlertDescription>
                  🎉 تهانينا! لقد أكملت جميع الأسئلة المتاحة في هذا المجال. لقد قمت بعمل رائع!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert>
          <AlertDescription>
            لا توجد أسئلة متاحة في هذه الجلسة.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onExit}>
            <X className="h-4 w-4 mr-2" />
            إنهاء التدريب
          </Button>
          <div className="text-sm text-gray-600">
            الفصول: {sessionData.selectedChapters.map(c => c.title).join(', ')}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline">
            السؤال {currentQuestionIndex + 1} من {sessionData.questions.length}
          </Badge>
          <Badge variant="secondary">
            المجموعة {sessionData.currentBatch}
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6 space-y-3">
        {/* Batch Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">تقدم المجموعة الحالية</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {/* Overall Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">التقدم الإجمالي</span>
            <span className="text-sm text-gray-600">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-1" />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-lg font-bold text-blue-600">{questionsAnswered}</div>
          <div className="text-xs text-blue-700">مجابة</div>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-lg font-bold text-green-600">{correctAnswers}</div>
          <div className="text-xs text-green-700">صحيحة</div>
        </div>
        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-lg font-bold text-purple-600">{getBatchScore()}%</div>
          <div className="text-xs text-purple-700">النتيجة</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
          <div className="text-lg font-bold text-gray-600">{sessionData.questions.length - currentQuestionIndex - 1}</div>
          <div className="text-xs text-gray-700">متبقية</div>
        </div>
        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="text-lg font-bold text-orange-600">
            {Math.round((Date.now() - questionStartTime) / 1000)}
          </div>
          <div className="text-xs text-orange-700">ثانية</div>
        </div>
      </div>

      {/* Passage Section */}
      {currentQuestion.passage && (
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800 mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <BookOpen className="h-5 w-5" />
                {currentQuestion.passage.title}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPassageExpanded(!isPassageExpanded)}
                className="text-blue-600 dark:text-blue-400"
              >
                {isPassageExpanded ? 'إخفاء' : 'إظهار'}
              </Button>
            </div>
          </CardHeader>
          {isPassageExpanded && (
            <CardContent className="pt-0">
              <div className="prose prose-sm max-w-none text-blue-800 dark:text-blue-200">
                {renderContent(currentQuestion.passage.content)}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={getDifficultyColor(currentQuestion.difficulty)}>
                {getDifficultyLabel(currentQuestion.difficulty)}
              </Badge>
              <Badge variant="secondary">
                {getTypeLabel(currentQuestion.type)}
              </Badge>
              {currentQuestion.points && currentQuestion.points > 1 && (
                <Badge variant="outline" className="border-purple-200 text-purple-700">
                  {currentQuestion.points} نقاط
                </Badge>
              )}
              {currentQuestion.attemptCount > 0 && (
                <Badge variant="outline" className="text-blue-600">
                  <Target className="h-3 w-3 mr-1" />
                  {currentQuestion.attemptCount} محاولة
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Question Text */}
          <div className="text-lg font-medium leading-relaxed text-gray-900 dark:text-gray-100">
            {renderContent(currentQuestion.text)}
          </div>

          {/* Options */}
          <RadioGroup
            value={selectedOption}
            onValueChange={handleOptionSelect}
            disabled={showAnswer || isSubmitting}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === option.id;
              const isCorrect = option.isCorrect;
              
              let optionStyle = 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600';
              
              if (showAnswer) {
                if (isCorrect) {
                  optionStyle = 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-600';
                } else if (isSelected && !isCorrect) {
                  optionStyle = 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-600';
                }
              } else if (isSelected) {
                optionStyle = 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600';
              }

              return (
                <div
                  key={option.id}
                  className={cn(
                    'flex items-center space-x-3 space-x-reverse p-4 border rounded-lg transition-all cursor-pointer',
                    optionStyle,
                    (isSubmitting || showAnswer) && 'cursor-default'
                  )}
                  onClick={() => !isSubmitting && !showAnswer && handleOptionSelect(option.id)}
                >
                  <RadioGroupItem 
                    value={option.id} 
                    id={option.id}
                    className="order-last"
                  />
                  <Label 
                    htmlFor={option.id} 
                    className="flex-1 cursor-pointer text-right"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        {renderContent(option.text)}
                      </div>
                      <div className="flex items-center gap-2 mr-3">
                        <span className="text-sm font-medium text-gray-500">
                          {String.fromCharCode(65 + index)}
                        </span>
                        {showAnswer && isCorrect && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                        {showAnswer && isSelected && !isCorrect && (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    </div>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>

          {/* Explanation */}
          {showAnswer && currentQuestion.explanation && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/10 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">
                    تفسير الإجابة:
                  </div>
                  <div className="text-amber-700 dark:text-amber-200">
                    {renderContent(currentQuestion.explanation)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Answer Result */}
      {showAnswer && answerResult && (
        <Card className={cn(
          'mb-6 border-2',
          answerResult.isCorrect 
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
            : 'border-red-500 bg-red-50 dark:bg-red-900/20'
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {answerResult.isCorrect ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              <div>
                <div className={cn(
                  'font-semibold',
                  answerResult.isCorrect ? 'text-green-800' : 'text-red-800'
                )}>
                  {answerResult.isCorrect ? 'إجابة صحيحة! 🎉' : 'إجابة خاطئة'}
                </div>
                {answerResult.score && (
                  <div className="text-sm text-gray-600">
                    النقاط المكتسبة: {answerResult.score}
                  </div>
                )}
                {answerResult.stats && (
                  <div className="text-sm text-gray-600">
                    دقة إجاباتك على هذا السؤال: {answerResult.stats.accuracy}%
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="outline"
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronRight className="h-4 w-4 mr-2" />
          السؤال السابق
        </Button>

        <div className="flex items-center gap-2">
          {!showAnswer ? (
            <Button
              onClick={submitAnswer}
              disabled={!selectedOption || isSubmitting}
              className="px-6"
            >
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال الإجابة'}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={retryQuestion}>
                <RotateCcw className="h-4 w-4 mr-2" />
                إعادة المحاولة
              </Button>
              {currentQuestionIndex < sessionData.questions.length - 1 ? (
                <Button onClick={nextQuestion}>
                  السؤال التالي
                  <ChevronLeft className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={nextQuestion} className="bg-green-600 hover:bg-green-700">
                  إنهاء المجموعة
                  <CheckCircle className="h-4 w-4 ml-2" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Question Navigation Dots */}
      <div className="flex justify-center">
        <div className="flex gap-2 max-w-full overflow-x-auto pb-2">
          {sessionData.questions.map((_, index) => {
            const isAnswered = sessionResults.some(r => r.questionId === sessionData.questions[index].id);
            const isCorrect = sessionResults.find(r => r.questionId === sessionData.questions[index].id)?.isCorrect;
            
            return (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={cn(
                  'w-8 h-8 rounded-full text-xs font-medium transition-all flex-shrink-0',
                  index === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : isAnswered
                    ? isCorrect
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                )}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}; 