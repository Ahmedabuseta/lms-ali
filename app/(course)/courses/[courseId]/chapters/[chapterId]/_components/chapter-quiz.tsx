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
  Play } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface ChapterQuizProps { quiz: {
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
          isCorrect: boolean; }>;
      };
    }>;
    attempts: Array<{ id: string;
      score?: number;
      isPassed: boolean;
      completedAt?: Date; }>;
  };
  courseId: string;
  chapterId: string;
}

export const ChapterQuiz = ({ quiz, courseId, chapterId }: ChapterQuizProps) => { const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({ });
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

  const handleAnswerSelect = (questionId: string, optionId: string) => { setAnswers(prev => ({
      ...prev,
      [questionId]: optionId }));
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

  const handleSubmitQuiz = async () => { if (!currentAttemptId) return;

    try {
      setIsSubmitting(true);

      const submissionData = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId, }));

      const response = await axios.post(`/api/courses/${courseId}/chapters/${chapterId}/quiz/submit`, { attemptId: currentAttemptId,
        answers: submissionData, });

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
    return `${mins}:${ secs.toString().padStart(2, '0') }`;
  };

  const currentQuestion = quiz.quizQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.quizQuestions.length) * 100;
  const answeredQuestions = Object.keys(answers).length;

  if (!isStarted && !showResults) { return (
      <Card className="border border-indigo-200/60 bg-indigo-50/80 backdrop-blur-2xl shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 p-3 shadow-lg">
              <FileQuestion className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 font-arabic">
                {quiz.title }
              </CardTitle>
              { quiz.description && (
                <p className="text-indigo-700 dark:text-indigo-300 mt-2 font-arabic">
                  {quiz.description }
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Quiz Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <FileQuestion className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
              <p className="text-sm text-indigo-600 font-arabic">عدد الأسئلة</p>
              <p className="font-bold text-indigo-900 dark:text-indigo-100 font-arabic">
                {quiz.quizQuestions.length}
              </p>
            </div>

            { quiz.timeLimit && (
              <div className="text-center">
                <Clock className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                <p className="text-sm text-indigo-600 font-arabic">المدة الزمنية</p>
                <p className="font-bold text-indigo-900 dark:text-indigo-100 font-arabic">
                  {quiz.timeLimit } دقيقة
                </p>
              </div>
            )}

            <div className="text-center">
              <Award className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
              <p className="text-sm text-indigo-600 font-arabic">الدرجة المطلوبة</p>
              <p className="font-bold text-indigo-900 dark:text-indigo-100 font-arabic">
                {quiz.requiredScore}%
              </p>
            </div>

            <div className="text-center">
              <RotateCcw className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
              <p className="text-sm text-indigo-600 font-arabic">المحاولات المتبقية</p>
              <p className="font-bold text-indigo-900 dark:text-indigo-100 font-arabic">
                { quiz.freeAttempts === -1
                  ? 'غير محدود'
                  : Math.max(0, quiz.freeAttempts - quiz.attempts.length) }
              </p>
            </div>
          </div>

          {/* Previous Attempt Result */}
          { lastAttempt && (
            <Alert className={hasPassedQuiz ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50" }>
              <div className="flex items-center gap-2">
                { hasPassedQuiz ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                ) }
                <AlertDescription className={ `font-arabic ${hasPassedQuiz ? 'text-green-800' : 'text-red-800' }`}>
                  {hasPassedQuiz
                    ? `تهانينا! لقد نجحت في الاختبار بدرجة ${lastAttempt.score}%`
                    : `لم تنجح في المحاولة السابقة. حصلت على ${lastAttempt.score}%`
                  }
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Start Quiz Button */}
          <div className="text-center">
            {canTakeQuiz ? (
              <Button
                onClick={startQuiz}
                size="lg"
                className="font-arabic"
              >
                <Play className="h-5 w-5 ml-2" />
                { hasPassedQuiz ? 'إعادة المحاولة' : 'بدء الاختبار' }
              </Button>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-arabic">
                  لقد استنفدت جميع المحاولات المتاحة لهذا الاختبار
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showResults) { return (
      <Card className="border border-green-200/60 bg-green-50/80 backdrop-blur-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-900 dark:text-green-100 font-arabic text-center">
            انتهى الاختبار!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-lg font-arabic text-green-800 dark:text-green-200">
            تم إرسال إجاباتك بنجاح. يمكنك مراجعة النتائج في قسم التقدم.
          </div>
          <Button onClick={resetQuiz } variant="outline" className="font-arabic">
            العودة للاختبار
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <Card className="border border-indigo-200/60 bg-indigo-50/80 backdrop-blur-2xl shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 font-arabic">
                السؤال {currentQuestionIndex + 1} من {quiz.quizQuestions.length}
              </h3>
              <p className="text-indigo-700 dark:text-indigo-300 font-arabic">
                تم الإجابة على {answeredQuestions} من {quiz.quizQuestions.length} أسئلة
              </p>
            </div>

            <div className="flex items-center gap-4">
              { timeRemaining !== null && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-600" />
                  <span className={`font-bold font-arabic ${
                    timeRemaining < 300 ? 'text-red-600' : 'text-indigo-900 dark:text-indigo-100' }`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Progress value={progress} className="mt-4" />
        </CardContent>
      </Card>

      {/* Current Question */}
      <Card className="border border-gray-200/60 bg-white/80 backdrop-blur-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-arabic leading-relaxed">
            {currentQuestion.question.text}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-arabic">
              { currentQuestion.question.type === 'MULTIPLE_CHOICE' ? 'اختيار من متعدد' : 'صح أو خطأ' }
            </Badge>
            <Badge variant="secondary" className="font-arabic">
              {currentQuestion.question.points} نقطة
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.question.options.map((option) => (
              <div
                key={option.id}
                className={ `p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  answers[currentQuestion.question.id] === option.id
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50' }`}
                onClick={ () => handleAnswerSelect(currentQuestion.question.id, option.id) }
              >
                <div className="flex items-center gap-3">
                  <div className={ `w-4 h-4 rounded-full border-2 ${
                    answers[currentQuestion.question.id] === option.id
                      ? 'border-indigo-500 bg-indigo-500'
                      : 'border-gray-300' }`}>
                    {answers[currentQuestion.question.id] === option.id && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                  <span className="font-arabic">{option.text}</span>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="font-arabic"
            >
              السؤال السابق
            </Button>

            <div className="flex gap-2">
              {currentQuestionIndex === quiz.quizQuestions.length - 1 ? (
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting || answeredQuestions < quiz.quizQuestions.length}
                  className="font-arabic"
                >
                  { isSubmitting ? 'جاري الإرسال...' : 'إرسال الاختبار' }
                </Button>
              ) : (
                <Button
                  onClick={goToNextQuestion}
                  disabled={!answers[currentQuestion.question.id]}
                  className="font-arabic"
                >
                  السؤال التالي
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
