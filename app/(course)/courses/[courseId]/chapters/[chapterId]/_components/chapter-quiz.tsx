'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FileQuestion,
  Clock,
  Award,
  CheckCircle,
  XCircle,
  RotateCcw,
  AlertCircle,
  Play,
  ArrowRight,
  ArrowLeft,
  Timer,
  Target } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface ChapterQuizProps {
  quiz: {
    id: string;
    title: string;
    description?: string;
    timeLimit?: number;
    requiredScore: number;
    freeAttempts: number;
    quizQuestions: Array<{
      id: string;
      position: number;
      question: {
        id: string;
        text: string;
        type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
        points: number;
        explanation?: string;
        options: Array<{
          id: string;
          text: string;
          isCorrect: boolean;
        }>;
      };
    }>;
    attempts: Array<{
      id: string;
      score?: number;
      isPassed: boolean;
      completedAt?: Date;
    }>;
  };
  courseId: string;
  chapterId: string;
}

export const ChapterQuiz = ({ quiz, courseId, chapterId }: ChapterQuizProps) => {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);

  const lastAttempt = quiz.attempts[0];
  const hasPassedQuiz = lastAttempt?.isPassed;
  const canTakeQuiz = quiz.freeAttempts === -1 || quiz.attempts.length < quiz.freeAttempts;

  // Timer effect
  useEffect(() => {
    if (isStarted && timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            // Auto-submit when time runs out
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isStarted, timeRemaining]);

  // Keyboard navigation
  useEffect(() => {
    if (!isStarted || showResults) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const currentQ = quiz.quizQuestions[currentQuestionIndex];
      
      // Number keys for option selection
      const num = parseInt(e.key);
      if (num >= 1 && num <= currentQ.question.options.length) {
        const optionIndex = num - 1;
        handleAnswerSelect(currentQ.question.id, currentQ.question.options[optionIndex].id);
        return;
      }

      // Arrow keys for navigation
      if (e.key === 'ArrowLeft' && currentQuestionIndex < quiz.quizQuestions.length - 1) {
        goToNextQuestion();
      } else if (e.key === 'ArrowRight' && currentQuestionIndex > 0) {
        goToPreviousQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isStarted, showResults, currentQuestionIndex, quiz.quizQuestions]);

  const startQuiz = async () => {
    try {
      const response = await axios.post(`/api/courses/${courseId}/chapters/${chapterId}/quiz/attempt`);
      setCurrentAttemptId(response.data.id);
      setIsStarted(true);
      setCurrentQuestionIndex(0);
      setAnswers({});

      if (quiz.timeLimit) {
        setTimeRemaining(quiz.timeLimit * 60); // Convert minutes to seconds
      }
    } catch (error) {
      toast.error('فشل في بدء الاختبار');
    }
  };

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < quiz.quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!currentAttemptId) return;

    try {
      setIsSubmitting(true);

      const submissionData = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId,
      }));

      const response = await axios.post(`/api/courses/${courseId}/chapters/${chapterId}/quiz/submit`, {
        attemptId: currentAttemptId,
        answers: submissionData,
      });

      setShowResults(true);

      // Refresh the page to update progress
      router.refresh();

      if (response.data.isPassed) {
        toast.success('مبروك! لقد نجحت في الاختبار');
      } else {
        toast.error('لم تحصل على الدرجة المطلوبة');
      }
    } catch (error) {
      toast.error('فشل في إرسال الاختبار');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setIsStarted(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeRemaining(null);
    setShowResults(false);
    setCurrentAttemptId(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = quiz.quizQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.quizQuestions.length) * 100;
  const answeredQuestions = Object.keys(answers).length;

  if (!isStarted && !showResults) {
    return (
      <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/60 shadow-lg backdrop-blur-sm" dir="rtl">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-8">
            <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 p-3 shadow-lg">
              <FileQuestion className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground font-arabic leading-relaxed mb-2">
                {quiz.title}
              </h3>
              {quiz.description && (
                <p className="text-muted-foreground font-arabic text-base leading-relaxed">
                  {quiz.description}
                </p>
              )}
            </div>
          </div>

          {/* Quiz Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-4 rounded-lg bg-background/60 border border-border/30">
              <FileQuestion className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-arabic mb-1">عدد الأسئلة</p>
              <p className="text-xl font-bold text-foreground font-arabic">
                {quiz.quizQuestions.length}
              </p>
            </div>

            {quiz.timeLimit && (
              <div className="text-center p-4 rounded-lg bg-background/60 border border-border/30">
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-arabic mb-1">المدة الزمنية</p>
                <p className="text-xl font-bold text-foreground font-arabic">
                  {quiz.timeLimit} دقيقة
                </p>
              </div>
            )}

            <div className="text-center p-4 rounded-lg bg-background/60 border border-border/30">
              <Award className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-arabic mb-1">الدرجة المطلوبة</p>
              <p className="text-xl font-bold text-foreground font-arabic">
                {quiz.requiredScore}%
              </p>
            </div>

            <div className="text-center p-4 rounded-lg bg-background/60 border border-border/30">
              <RotateCcw className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-arabic mb-1">المحاولات المتبقية</p>
              <p className="text-xl font-bold text-foreground font-arabic">
                {quiz.freeAttempts === -1
                  ? 'غير محدود'
                  : Math.max(0, quiz.freeAttempts - quiz.attempts.length)}
              </p>
            </div>
          </div>

          {/* Previous Attempt Result */}
          {lastAttempt && (
            <div className="mb-8">
              <Alert className={`border-2 ${hasPassedQuiz 
                ? "border-green-200 bg-green-50/80 dark:border-green-800 dark:bg-green-900/20" 
                : "border-red-200 bg-red-50/80 dark:border-red-800 dark:bg-red-900/20"
              }`}>
                <div className="flex items-center gap-3">
                  {hasPassedQuiz ? (
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                  )}
                  <AlertDescription className={`font-arabic text-base ${
                    hasPassedQuiz ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                  }`}>
                    {hasPassedQuiz
                      ? `🎉 تهانينا! لقد نجحت في الاختبار بدرجة ${lastAttempt.score}%`
                      : `❌ لم تنجح في المحاولة السابقة. حصلت على ${lastAttempt.score}%`
                    }
                  </AlertDescription>
                </div>
              </Alert>
            </div>
          )}

          {/* Start Quiz Button */}
          <div className="text-center">
            {canTakeQuiz ? (
              <Button
                onClick={startQuiz}
                size="lg"
                className="font-arabic text-lg px-8 py-6 h-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Play className="h-6 w-6 ml-3" />
                {hasPassedQuiz ? 'إعادة المحاولة' : 'بدء الاختبار'}
              </Button>
            ) : (
              <Alert className="max-w-md mx-auto">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="font-arabic text-base">
                  لقد استنفدت جميع المحاولات المتاحة لهذا الاختبار
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="rounded-xl border border-green-200/60 bg-gradient-to-br from-green-50/80 to-emerald-50/60 shadow-lg backdrop-blur-sm" dir="rtl">
        <div className="p-6 md:p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-green-900 dark:text-green-100 font-arabic mb-2">
              انتهى الاختبار!
            </h3>
            <p className="text-lg font-arabic text-green-800 dark:text-green-200 leading-relaxed">
              تم إرسال إجاباتك بنجاح. يمكنك مراجعة النتائج في قسم التقدم.
            </p>
          </div>
          <Button 
            onClick={resetQuiz} 
            variant="outline" 
            className="font-arabic text-base px-6 py-3 h-auto border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/20"
          >
            العودة للاختبار
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Quiz Header */}
      <div className="rounded-xl border border-border/50 bg-gradient-to-r from-card/80 to-card/60 shadow-lg backdrop-blur-sm">
        <div className="p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-bold text-foreground font-arabic mb-2">
                السؤال {currentQuestionIndex + 1} من {quiz.quizQuestions.length}
              </h3>
              <p className="text-muted-foreground font-arabic text-base">
                تم الإجابة على {answeredQuestions} من {quiz.quizQuestions.length} أسئلة
              </p>
            </div>

            <div className="flex items-center gap-4">
              {timeRemaining !== null && (
                <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition-all duration-200 ${
                  timeRemaining < 300 
                    ? 'bg-red-50/80 border-red-200 dark:bg-red-900/20 dark:border-red-800 animate-pulse' 
                    : timeRemaining < 600
                    ? 'bg-yellow-50/80 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                    : 'bg-background/60 border-border/30'
                }`}>
                  <Timer className={`h-5 w-5 ${
                    timeRemaining < 300 ? 'text-red-600' : timeRemaining < 600 ? 'text-yellow-600' : 'text-blue-600'
                  }`} />
                  <span className={`text-lg font-bold font-arabic ${
                    timeRemaining < 300 ? 'text-red-600' : timeRemaining < 600 ? 'text-yellow-600' : 'text-foreground'
                  }`}>
                    {formatTime(timeRemaining)}
                  </span>
                  {timeRemaining < 300 && (
                    <span className="text-xs text-red-600 font-arabic">وقت قليل!</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <Progress 
              value={progress} 
              className="h-3 bg-muted/30"
            />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground font-arabic">
              <span>البداية</span>
              <span>{Math.round(progress)}%</span>
              <span>النهاية</span>
            </div>
          </div>

          {/* Question Navigation Dots */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {quiz.quizQuestions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all duration-200 ${
                  index === currentQuestionIndex
                    ? 'bg-purple-600 text-white shadow-lg scale-110'
                    : answers[quiz.quizQuestions[index].question.id]
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted/70'
                }`}
                title={`السؤال ${index + 1}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Question */}
      <div className="rounded-xl border border-border/50 bg-card/60 shadow-lg backdrop-blur-sm">
        <div className="p-6 md:p-8">
          {/* Question Header */}
          <div className="mb-6">
            <h4 className="text-xl md:text-2xl font-arabic leading-relaxed text-foreground mb-4">
              {currentQuestion.question.text}
            </h4>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline" className="font-arabic text-sm px-3 py-1">
                {currentQuestion.question.type === 'MULTIPLE_CHOICE' ? 'اختيار من متعدد' : 'صح أو خطأ'}
              </Badge>
              <Badge variant="secondary" className="font-arabic text-sm px-3 py-1">
                {currentQuestion.question.points} نقطة
              </Badge>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4 mb-8">
            {currentQuestion.question.options.map((option, index) => (
              <div
                key={option.id}
                className={`group p-4 md:p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  answers[currentQuestion.question.id] === option.id
                    ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-900/20 shadow-md'
                    : 'border-border/50 hover:border-purple-300 hover:bg-muted/30 hover:shadow-sm'
                }`}
                onClick={() => handleAnswerSelect(currentQuestion.question.id, option.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    answers[currentQuestion.question.id] === option.id
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-muted-foreground/30 group-hover:border-purple-400'
                  }`}>
                    {answers[currentQuestion.question.id] === option.id && (
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <span className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-sm font-bold text-muted-foreground">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="font-arabic text-base md:text-lg leading-relaxed">{option.text}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator className="mb-6" />

          {/* Keyboard Shortcuts Hint */}
          <div className="text-center mb-4">
            <p className="text-xs text-muted-foreground font-arabic">
              استخدم الأرقام (1-{currentQuestion.question.options.length}) لاختيار الإجابة، أو الأسهم للتنقل
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Button
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="font-arabic text-base px-6 py-3 h-auto w-full sm:w-auto"
            >
              <ArrowRight className="h-5 w-5 ml-2" />
              السؤال السابق
            </Button>

            <div className="flex gap-3 w-full sm:w-auto">
              {currentQuestionIndex === quiz.quizQuestions.length - 1 ? (
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting || answeredQuestions < quiz.quizQuestions.length}
                  className="font-arabic text-base px-8 py-3 h-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
                >
                  {isSubmitting ? 'جاري الإرسال...' : 'إرسال الاختبار'}
                </Button>
              ) : (
                <Button
                  onClick={goToNextQuestion}
                  disabled={!answers[currentQuestion.question.id]}
                  className="font-arabic text-base px-6 py-3 h-auto w-full sm:w-auto"
                >
                  السؤال التالي
                  <ArrowLeft className="h-5 w-5 mr-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
