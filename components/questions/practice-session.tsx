'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  XCircle,
  BookOpen,
  Target,
  RotateCcw,
  Lightbulb,
  Timer,
  Play } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { QuestionDisplay, Question } from './question-display';
import { cn } from '@/lib/utils';

export interface PracticeSessionData { sessionId: string;
  courseId: string;
  selectedChapters: { id: string; title: string }[];
  questions: Question[];
  totalQuestions: number;
  currentBatch: number;
  batchSize: number;
  hasMoreQuestions: boolean;
}

export interface PracticeSessionProps { sessionData: PracticeSessionData;
  onExit: () => void;
  onLoadNextBatch?: () => Promise<void>;
  // Options
  showTimer?: boolean;
  allowRetry?: boolean;
  showExplanations?: boolean;
  autoAdvance?: boolean;
  // Callbacks
  onQuestionAnswer?: (questionId: string, optionId: string, isCorrect: boolean) => void;
  onBatchComplete?: (batchResults: any) => void; }

interface QuestionResult { questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean | null;
  timeSpent: number;
  attempts: number; }

export const PracticeSession: React.FC<PracticeSessionProps> = ({ sessionData,
  onExit,
  onLoadNextBatch,
  showTimer = false,
  allowRetry = true,
  showExplanations = true,
  autoAdvance = false,
  onQuestionAnswer,
  onBatchComplete, }) => { const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
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

  const currentQuestion = sessionData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / sessionData.questions.length) * 100;
  const overallProgress = (((sessionData.currentBatch - 1) * sessionData.batchSize + currentQuestionIndex + 1) / sessionData.totalQuestions) * 100;

  // Reset state when question changes
  useEffect(() => {
    setSelectedOption('');
    setShowAnswer(false);
    setAnswerResult(null);
    setQuestionStartTime(Date.now()); }, [currentQuestionIndex]);

  // Auto-advance logic
  useEffect(() => {
    if (autoAdvance && showAnswer && answerResult) {
      const timer = setTimeout(() => {
        nextQuestion();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showAnswer, answerResult, autoAdvance]);

  const handleOptionSelect = (optionId: string) => {
    if (!showAnswer) {
      setSelectedOption(optionId);
    }
  };

  const submitAnswer = async () => { if (!selectedOption || !currentQuestion) return;

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
        timeSpent, });

      const result = response.data;
      setAnswerResult(result);
      setShowAnswer(true);

      // Update session results
      const questionResult: QuestionResult = { questionId: currentQuestion.id,
        selectedOptionId: selectedOption,
        isCorrect,
        timeSpent,
        attempts: 1, // TODO: Track retry attempts };

      setSessionResults(prev => { const existing = prev.findIndex(r => r.questionId === currentQuestion.id);
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

      // Callback
      onQuestionAnswer?.(currentQuestion.id, selectedOption, isCorrect);

      toast.success(isCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة');
    } catch (error) { console.error('Error submitting answer:', error);
      toast.error('حدث خطأ في إرسال الإجابة'); } finally {
      setIsSubmitting(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < sessionData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (!batchCompleted) {
      // Batch completed
      setBatchCompleted(true);
      onBatchComplete?.(sessionResults);
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
    if (!onLoadNextBatch) return;

    setIsLoadingNext(true);
    try {
      await onLoadNextBatch();
      setBatchCompleted(false);
      setCurrentQuestionIndex(0);
      setSessionResults([]);
      setQuestionsAnswered(0);
      setCorrectAnswers(0);
      toast.success('تم تحميل مجموعة أسئلة جديدة!');
    } catch (error) { console.error('Error loading next batch:', error);
      toast.error('حدث خطأ في تحميل الأسئلة الجديدة'); } finally {
      setIsLoadingNext(false);
    }
  };

  const getBatchScore = () => { return questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0; };

  // Batch completion view
  if (batchCompleted) { return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
              <CheckCircle className="h-6 w-6" />
              تمت المجموعة الحالية!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Batch Stats */ }
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" onClick={onExit}>
                <X className="h-4 w-4 mr-2" />
                إنهاء التدريب
              </Button>

              {sessionData.hasMoreQuestions && onLoadNextBatch && (
                <Button
                  onClick={loadNextBatch}
                  disabled={isLoadingNext}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  { isLoadingNext ? 'جاري التحميل...' : 'مجموعة أسئلة جديدة' }
                </Button>
              )}
            </div>

            {!sessionData.hasMoreQuestions && (
              <Alert>
                <Target className="h-4 w-4" />
                <AlertDescription>
                  تهانينا! لقد أكملت جميع الأسئلة المتاحة في هذا المجال.
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
            الفصول: { sessionData.selectedChapters.map(c => c.title).join(', ') }
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
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
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
      </div>

      {/* Question Display */}
      <QuestionDisplay
        question={currentQuestion}
        selectedOptionId={selectedOption}
        onOptionSelect={handleOptionSelect}
        showAnswer={showAnswer}
        showExplanation={showExplanations}
        showQuestionMeta={true}
        disabled={isSubmitting}
        className="mb-6"
      />

      {/* Answer Result */}
      { showAnswer && answerResult && (
        <Card className={cn(
          'mb-6 border-2',
          answerResult.isCorrect
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
            : 'border-red-500 bg-red-50 dark:bg-red-900/20'
        ) }>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              { answerResult.isCorrect ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              ) }
              <div>
                <div className={ cn(
                  'font-semibold',
                  answerResult.isCorrect ? 'text-green-800' : 'text-red-800'
                ) }>
                  { answerResult.isCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة' }
                </div>
                { answerResult.score && (
                  <div className="text-sm text-gray-600">
                    النقاط المكتسبة: {answerResult.score }
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
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
              { isSubmitting ? 'جاري الإرسال...' : 'إرسال الإجابة' }
            </Button>
          ) : (
            <>
              {allowRetry && (
                <Button variant="outline" onClick={retryQuestion}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  إعادة المحاولة
                </Button>
              )}
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
      <div className="flex justify-center mt-8">
        <div className="flex gap-2 max-w-full overflow-x-auto pb-2">
          { sessionData.questions.map((_, index) => {
            const isAnswered = sessionResults.some(r => r.questionId === sessionData.questions[index].id);
            const isCorrect = sessionResults.find(r => r.questionId === sessionData.questions[index].id)?.isCorrect;

            return (
              <button
                key={index }
                onClick={() => setCurrentQuestionIndex(index)}
                className={ cn(
                  'w-8 h-8 rounded-full text-xs font-medium transition-all flex-shrink-0',
                  index === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : isAnswered
                    ? isCorrect
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                ) }
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
