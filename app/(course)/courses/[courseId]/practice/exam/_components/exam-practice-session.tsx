'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Flag,
  RotateCcw,
  Home,
  BookOpen,
  Target,
  Award,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface SessionData {
  sessionId: string;
  courseId: string;
  mode: string;
  selectedChapters: { id: string; title: string }[];
  questions: any[];
  totalQuestions: number;
  timeLimit: number; // in minutes
}

interface ExamPracticeSessionProps {
  sessionData: SessionData;
  onExit: () => void;
}

export function ExamPracticeSession({ sessionData, onExit }: ExamPracticeSessionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  // Ensure timeLimit is a valid number, default to 45 minutes for exam mode
  const initialTimeLimit = sessionData.timeLimit && !isNaN(sessionData.timeLimit) ? sessionData.timeLimit : 45;
  const [timeRemaining, setTimeRemaining] = useState(initialTimeLimit * 60);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [sessionResults, setSessionResults] = useState<any>(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = sessionData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / sessionData.totalQuestions) * 100;

  useEffect(() => {
    // Only run timer if we have valid timeRemaining
    if (timeRemaining > 0 && !isCompleted && !isNaN(timeRemaining)) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          return newTime >= 0 ? newTime : 0;
        });
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

  const formatTime = (seconds: number) => {
    // Handle invalid input
    if (!seconds || isNaN(seconds) || seconds < 0) {
      return '00:00';
    }
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionId
    }));
  };

  const handleSubmit = async (autoSubmit = false) => {
    try {
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
          points: isCorrect ? (question.points || 1) : 0
        };
      });

      const totalPoints = results.reduce((sum, r) => sum + r.points, 0);
      const maxPoints = sessionData.questions.reduce((sum, q) => sum + (q.points || 1), 0);
      const percentage = (totalPoints / maxPoints) * 100;

      const sessionResults = {
        sessionId: sessionData.sessionId,
        results,
        totalPoints,
        maxPoints,
        percentage,
        timeSpent: (initialTimeLimit * 60) - timeRemaining,
        autoSubmitted: autoSubmit
      };

      // Store results for display
      setSessionResults(sessionResults);
      setShowResults(true);

      if (!autoSubmit) {
        toast.success('تم إرسال الإجابات بنجاح!');
      } else {
        toast.error('انتهى الوقت! تم إرسال الإجابات تلقائياً');
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast.error('حدث خطأ في إرسال الإجابات');
    }
  };

  const toggleFlag = (questionIndex: number) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionIndex)) {
        newSet.delete(questionIndex);
      } else {
        newSet.add(questionIndex);
      }
      return newSet;
    });
  };

  if (showResults && sessionResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/40 to-indigo-50/60 dark:from-background dark:via-blue-950/20 dark:to-purple-950/20 flex items-center justify-center px-4 py-6 sm:py-8" dir="rtl">
        <Card className="w-full max-w-sm sm:max-w-md lg:max-w-4xl shadow-xl border-0 bg-background/95 backdrop-blur-sm">
          <CardHeader className="text-center p-4 sm:p-6 lg:p-8">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                  <Award className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" />
                </div>
                <div className="absolute -inset-2 bg-emerald-500/20 rounded-full animate-pulse"></div>
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-arabic-heading">
              نتائج الامتحان التدريبي
            </CardTitle>
            <p className="text-sm sm:text-base text-muted-foreground font-arabic mt-2">
              {sessionResults.autoSubmitted ? 'تم إنهاء الامتحان تلقائياً' : 'تم إكمال الامتحان بنجاح'}
            </p>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 lg:p-8">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {[
                { 
                  value: sessionResults.totalPoints || 0, 
                  label: "النقاط المكتسبة",
                  max: sessionResults.maxPoints || sessionData.totalQuestions,
                  color: "from-blue-500 to-blue-600",
                  icon: Target
                },
                { 
                  value: `${Math.round(sessionResults.percentage || 0)}%`, 
                  label: "النسبة المئوية",
                  color: sessionResults.percentage >= 80 ? "from-green-500 to-emerald-600" : 
                         sessionResults.percentage >= 60 ? "from-yellow-500 to-orange-500" : "from-red-500 to-red-600",
                  icon: Award
                },
                { 
                  value: formatTime(sessionResults.timeSpent || 0), 
                  label: "الوقت المستغرق",
                  color: "from-purple-500 to-purple-600",
                  icon: Clock
                }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className={cn(
                    "w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-xl sm:rounded-2xl bg-gradient-to-r shadow-lg flex items-center justify-center mb-3 sm:mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl",
                    stat.color
                  )}>
                    <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground font-arabic-heading mb-1">
                    {stat.value}
                    {stat.max && <span className="text-sm sm:text-lg text-muted-foreground">/{stat.max}</span>}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground font-arabic">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Performance Message */}
            <div className="text-center mb-6 sm:mb-8">
              {sessionResults.percentage >= 80 && (
                <Alert className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200 font-arabic text-base sm:text-lg">
                    🌟 أداء ممتاز! تهانينا على هذا الإنجاز الرائع
                  </AlertDescription>
                </Alert>
              )}
              {sessionResults.percentage >= 60 && sessionResults.percentage < 80 && (
                <Alert className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20">
                  <Target className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800 dark:text-yellow-200 font-arabic text-base sm:text-lg">
                    👍 أداء جيد! يمكنك تحسين أدائك أكثر
                  </AlertDescription>
                </Alert>
              )}
              {sessionResults.percentage < 60 && (
                <Alert className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800 dark:text-orange-200 font-arabic text-base sm:text-lg">
                    💪 تحتاج المزيد من التدريب - لا تستسلم!
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button 
                onClick={onExit} 
                variant="outline"
                className="font-arabic hover:bg-primary hover:text-primary-foreground transition-all duration-200 w-full sm:w-auto"
              >
                <Home className="ml-2 h-4 w-4" />
                العودة للتدريب
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 font-arabic shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
              >
                <RotateCcw className="ml-2 h-4 w-4" />
                إعادة المحاولة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/40 to-indigo-50/60 dark:from-background dark:via-blue-950/20 dark:to-purple-950/20 animate-fade-in" dir="rtl">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        {/* Header */}
        <Card className="border-0 bg-background/95 shadow-lg backdrop-blur-sm mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    timeRemaining < 300 ? "bg-red-100 dark:bg-red-950/20" : "bg-orange-100 dark:bg-orange-950/20"
                  )}>
                    <Clock className={cn(
                      "h-4 w-4 sm:h-5 sm:w-5",
                      timeRemaining < 300 ? "text-red-600" : "text-orange-600"
                    )} />
                  </div>
                  <div>
                    <span className={`font-mono text-xl sm:text-2xl font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-orange-600'}`}>
                      {formatTime(timeRemaining)}
                    </span>
                    <p className="text-xs text-muted-foreground font-arabic">الوقت المتبقي</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-200 font-arabic text-sm">
                  السؤال {currentQuestionIndex + 1} من {sessionData.totalQuestions}
                </Badge>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
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
                  className={cn(
                    "font-arabic transition-all duration-200",
                    flaggedQuestions.has(currentQuestionIndex) 
                      ? 'text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/20' 
                      : 'hover:bg-amber-50 dark:hover:bg-amber-950/20'
                  )}
                >
                  <Flag className="h-4 w-4" />
                  <span className="hidden sm:inline mr-2">علامة</span>
                </Button>
                <Button 
                  onClick={onExit} 
                  variant="outline" 
                  size="sm"
                  className="font-arabic hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
                >
                  <Home className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">خروج</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Progress value={progress} className="h-2 sm:h-3" variant="default" />
              <div className="flex justify-between text-xs text-muted-foreground font-arabic">
                <span>التقدم: {Math.round(progress)}%</span>
                <span>{Object.keys(answers).length} من {sessionData.totalQuestions} مجاب</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Question Area */}
          <div className="lg:col-span-3 order-1 lg:order-1">
            <Card className="border-0 bg-background/95 shadow-lg backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-6 text-foreground font-arabic leading-relaxed">
                    {currentQuestion?.question}
                  </h2>

                  {currentQuestion?.passage && (
                    <Card className="mb-6 sm:mb-8 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/50">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                          <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                          <h3 className="font-semibold text-blue-900 dark:text-blue-100 font-arabic text-sm sm:text-base">نص القطعة</h3>
                        </div>
                        <div className="prose prose-sm max-w-none text-foreground font-arabic leading-relaxed text-sm sm:text-base">
                          {currentQuestion.passage}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {currentQuestion?.options?.map((option: any, index: number) => (
                    <Card
                      key={option.id}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                        answers[currentQuestionIndex] === option.id
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-md'
                          : 'border-border hover:border-border/80 hover:bg-muted/50'
                      )}
                      onClick={() => handleAnswerSelect(option.id)}
                    >
                      <CardContent className="p-3 sm:p-4 lg:p-5">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            <div className="text-xs sm:text-sm font-medium text-muted-foreground bg-muted w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center">
                              {String.fromCharCode(65 + index)}
                            </div>
                            <div className={cn(
                              "w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                              answers[currentQuestionIndex] === option.id
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-border'
                            )}>
                              {answers[currentQuestionIndex] === option.id && (
                                <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                              )}
                            </div>
                          </div>
                          <span className="text-foreground font-arabic flex-1 leading-relaxed text-sm sm:text-base break-words">
                            {option.text}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mt-8 sm:mt-10">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="font-arabic hover:bg-primary hover:text-primary-foreground transition-all duration-200 w-full sm:w-auto order-2 sm:order-1"
                  >
                    <ArrowRight className="h-4 w-4 ml-2" />
                    السابق
                  </Button>

                  {currentQuestionIndex === sessionData.totalQuestions - 1 ? (
                    <Button
                      onClick={() => handleSubmit()}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 font-arabic shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto order-1 sm:order-2"
                    >
                      <Target className="h-4 w-4 ml-2" />
                      إرسال الإجابات
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setCurrentQuestionIndex(Math.min(sessionData.totalQuestions - 1, currentQuestionIndex + 1))}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 font-arabic shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto order-1 sm:order-2"
                    >
                      التالي
                      <ArrowLeft className="h-4 w-4 mr-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Map Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-2">
            <Card className="border-0 bg-background/95 shadow-lg backdrop-blur-sm lg:sticky lg:top-6">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg font-semibold font-arabic flex items-center gap-2">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  خريطة الأسئلة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6">
                  {sessionData.questions.map((_, index) => {
                    const hasAnswer = answers[index] !== undefined;
                    const isFlagged = flaggedQuestions.has(index);
                    const isCurrent = index === currentQuestionIndex;

                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={cn(
                          'w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 border-2',
                          isCurrent 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-110' 
                            : hasAnswer && isFlagged
                            ? 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600'
                            : hasAnswer
                            ? 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600'
                            : isFlagged
                            ? 'bg-amber-200 text-amber-800 border-amber-400 hover:bg-amber-300 dark:bg-amber-950/30 dark:text-amber-200'
                            : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                        )}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="space-y-2 sm:space-y-3 text-xs font-arabic">
                  {[
                    { color: "bg-blue-600", label: "السؤال الحالي" },
                    { color: "bg-emerald-500", label: "مجاب عليه" },
                    { color: "bg-amber-500", label: "مُعلّم ومجاب" },
                    { color: "bg-amber-200 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200", label: "مُعلّم" },
                    { color: "bg-muted", label: "غير مجاب" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 sm:gap-3">
                      <div className={cn("w-3 h-3 sm:w-4 sm:h-4 rounded", item.color)}></div>
                      <span className="text-muted-foreground text-xs sm:text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
