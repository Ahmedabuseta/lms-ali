'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Flag,
  RotateCcw,
  Home,
  BookOpen,
  Target,
  Award } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SessionData { sessionId: string;
  courseId: string;
  mode: string;
  selectedChapters: { id: string; title: string }[];
  questions: any[];
  totalQuestions: number;
  timeLimit: number; // in minutes
}

interface ExamPracticeSessionProps { sessionData: SessionData;
  onExit: () => void; }

export function ExamPracticeSession({ sessionData, onExit }: ExamPracticeSessionProps) { const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({ });
  const [timeRemaining, setTimeRemaining] = useState(sessionData.timeLimit * 60);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = sessionData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / sessionData.totalQuestions) * 100;

  useEffect(() => {
    if (timeRemaining > 0 && !isCompleted) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && !isCompleted) {
      handleSubmit(true);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeRemaining, isCompleted]);

  const formatTime = (seconds: number) => { const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0') }:${ secs.toString().padStart(2, '0') }`;
  };

  const handleAnswerSelect = (optionId: string) => { setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionId }));
  };

  const handleSubmit = async (autoSubmit = false) => { try {
      setIsCompleted(true);

      const results = sessionData.questions.map((question, index) => {
        const userAnswer = answers[index];
        const correctOption = question.options.find((opt: any) => opt.isCorrect);
        const isCorrect = userAnswer === correctOption?.id;

        return {
          questionIndex: index,
          questionId: question.id,
          userAnswer,
          correctAnswer: correctOption?.id,
          isCorrect,
          points: isCorrect ? (question.points || 1) : 0 };
      });

      const totalPoints = results.reduce((sum, r) => sum + r.points, 0);
      const maxPoints = sessionData.questions.reduce((sum, q) => sum + (q.points || 1), 0);
      const percentage = (totalPoints / maxPoints) * 100;

      const sessionResults = { sessionId: sessionData.sessionId,
        results,
        totalPoints,
        maxPoints,
        percentage,
        timeSpent: sessionData.timeLimit * 60 - timeRemaining,
        completedAt: new Date().toISOString(),
        autoSubmitted: autoSubmit };

      localStorage.setItem(`practice_results_${sessionData.sessionId}`, JSON.stringify(sessionResults));

      if (autoSubmit) {
        toast.error('انتهى الوقت المحدد! تم إرسال الإجابات تلقائياً');
      } else {
        toast.success('تم إرسال الإجابات بنجاح!');
      }

      setShowResults(true);
    } catch (error) { console.error('Error submitting exam:', error);
      toast.error('خطأ في إرسال الإجابات'); }
  };

  if (showResults) {
    const results = JSON.parse(localStorage.getItem(`practice_results_${sessionData.sessionId}`) || '{}');

    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 via-white to-indigo-50/60 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="relative z-10 container mx-auto px-4 py-8">
          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80 max-w-4xl mx-auto">
            <CardHeader className="text-center p-6">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 p-3">
                  <Award className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                نتائج الامتحان التدريبي
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-3 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {results.totalPoints || 0}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">النقاط المكتسبة</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {Math.round(results.percentage || 0)}%
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">النسبة المئوية</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {formatTime(results.timeSpent || 0)}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">الوقت المستغرق</p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={onExit} variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  العودة للتدريب
                </Button>
                <Button onClick={() => window.location.reload()} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  إعادة المحاولة
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 via-white to-indigo-50/60 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="relative z-10 container mx-auto px-4 py-6">
        <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span className={ `font-mono text-lg font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-orange-600' }`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  السؤال {currentQuestionIndex + 1} من {sessionData.totalQuestions}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFlaggedQuestions(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(currentQuestionIndex)) {
                      newSet.delete(currentQuestionIndex);
                    } else {
                      newSet.add(currentQuestionIndex);
                    }
                    return newSet;
                  })}
                  className={ flaggedQuestions.has(currentQuestionIndex) ? 'text-amber-600 border-amber-200' : '' }
                >
                  <Flag className="h-4 w-4" />
                </Button>
                <Button onClick={onExit} variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  خروج
                </Button>
              </div>
            </div>

            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
                    {currentQuestion?.question}
                  </h2>

                  { currentQuestion?.passage && (
                    <Card className="mb-6 bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                      <CardContent className="p-4">
                        <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300">
                          {currentQuestion.passage }
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-3">
                  { currentQuestion?.options?.map((option: any) => (
                    <Card
                      key={option.id }
                      className={ `cursor-pointer transition-all duration-200 hover:shadow-md ${
                        answers[currentQuestionIndex] === option.id
                          ? 'border-2 border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                          : 'border border-slate-200 hover:border-slate-300 dark:border-slate-700' }`}
                      onClick={() => handleAnswerSelect(option.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={ `w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            answers[currentQuestionIndex] === option.id
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-slate-300 dark:border-slate-600' }`}>
                            {answers[currentQuestionIndex] === option.id && (
                              <CheckCircle className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <span className="text-slate-800 dark:text-slate-200">
                            {option.text}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={ () => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1)) }
                    disabled={currentQuestionIndex === 0}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    السابق
                  </Button>

                  {currentQuestionIndex === sessionData.totalQuestions - 1 ? (
                    <Button
                      onClick={() => handleSubmit()}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      إرسال الإجابات
                    </Button>
                  ) : (
                    <Button
                      onClick={ () => setCurrentQuestionIndex(Math.min(sessionData.totalQuestions - 1, currentQuestionIndex + 1)) }
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    >
                      التالي
                      <ArrowLeft className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
              <CardHeader className="p-4">
                <CardTitle className="text-lg font-semibold">خريطة الأسئلة</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-5 gap-2">
                  { sessionData.questions.map((_, index) => {
                    const hasAnswer = answers[index] !== undefined;
                    const isFlagged = flaggedQuestions.has(index);
                    const isCurrent = index === currentQuestionIndex;

                    let className = 'w-8 h-8 rounded text-xs font-medium transition-all duration-200 ';

                    if (isCurrent) {
                      className += 'bg-blue-600 text-white shadow-lg'; } else if (hasAnswer && isFlagged) {
                      className += 'bg-amber-500 text-white';
                    } else if (hasAnswer) {
                      className += 'bg-emerald-500 text-white';
                    } else if (isFlagged) {
                      className += 'bg-amber-200 text-amber-800 border border-amber-400';
                    } else { className += 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300'; }

                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={className}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded"></div>
                    <span>السؤال الحالي</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                    <span>مجاب عليه</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded"></div>
                    <span>مُعلّم</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-300 rounded"></div>
                    <span>غير مجاب</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
