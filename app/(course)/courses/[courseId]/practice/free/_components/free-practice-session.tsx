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
  Brain,
  Zap,
  Award,
  Infinity
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

export const FreePracticeSession: React.FC<FreePracticeSessionProps> = ({ sessionData, onExit }) => {
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

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-300';
      case 'HARD': return 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-950/20 dark:text-gray-300';
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

  const handleOptionSelect = (optionId: string) => {
    if (!showAnswer) {
      setSelectedOption(optionId);
    }
  };

  const submitAnswer = () => {
    if (!selectedOption || !currentQuestion) return;

    setIsSubmitting(true);

    const correctOption = currentQuestion.options.find(opt => opt.isCorrect);
    const isCorrect = selectedOption === correctOption?.id;

    setAnswerResult({
      isCorrect,
      correctOption,
      selectedOption
    });

    // Update session stats
    setQuestionsAnswered(prev => prev + 1);
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setCurrentStreak(prev => prev + 1);
      toast.success('إجابة صحيحة! 🎉');
    } else {
      setCurrentStreak(0);
      toast.error('إجابة خاطئة، حاول مرة أخرى');
    }

    setShowAnswer(true);
    setIsSubmitting(false);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < sessionData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
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

  // Completion screen
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-green-50/40 to-emerald-50/60 dark:from-background dark:via-green-950/20 dark:to-emerald-950/20 flex items-center justify-center p-4 animate-fade-in" dir="rtl">
        <Card className="w-full max-w-2xl shadow-xl border-0 bg-background/95 backdrop-blur-sm">
          <CardHeader className="text-center bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <Award className="h-10 w-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-foreground font-arabic-heading">
              تهانينا! انتهى التدريب الحر
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-8 p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50/50 dark:bg-green-950/20 p-6 rounded-xl border border-green-200/50 dark:border-green-800/50">
                <div className="text-4xl font-bold text-green-600 font-arabic-heading mb-2">{correctAnswers}</div>
                <div className="text-green-700 dark:text-green-300 font-arabic">إجابة صحيحة</div>
              </div>
              <div className="bg-blue-50/50 dark:bg-blue-950/20 p-6 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                <div className="text-4xl font-bold text-blue-600 font-arabic-heading mb-2">{accuracy.toFixed(1)}%</div>
                <div className="text-blue-700 dark:text-blue-300 font-arabic">دقة الإجابات</div>
              </div>
              <div className="bg-purple-50/50 dark:bg-purple-950/20 p-6 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                <div className="text-4xl font-bold text-purple-600 font-arabic-heading mb-2">{questionsAnswered}</div>
                <div className="text-purple-700 dark:text-purple-300 font-arabic">إجمالي الأسئلة</div>
              </div>
            </div>
            
            {accuracy >= 80 && (
              <Alert className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
                <Award className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200 font-arabic text-lg">
                  🌟 أداء ممتاز! استمر في التقدم والتعلم
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4 justify-center">
              <Button onClick={onExit} variant="outline" className="font-arabic hover:bg-primary hover:text-primary-foreground transition-all duration-200">
                <Target className="mr-2 h-4 w-4" />
              العودة للقائمة الرئيسية
            </Button>
              <Button onClick={() => window.location.reload()} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 font-arabic shadow-lg hover:shadow-xl transition-all duration-300">
                <RotateCcw className="mr-2 h-4 w-4" />
                جلسة تدريب جديدة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-50/40 to-emerald-50/60 dark:from-background dark:via-green-950/20 dark:to-emerald-950/20 animate-fade-in" dir="rtl">
      {/* Enhanced Header */}
      <div className="bg-background/95 backdrop-blur-sm shadow-lg border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button 
                variant="ghost" 
                onClick={onExit} 
                className="flex items-center gap-2 font-arabic hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
              >
                <X className="h-5 w-5" />
                إنهاء التدريب
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-sm">
                  <Infinity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="font-bold text-foreground font-arabic-heading text-lg">التدريب الحر</span>
                  <p className="text-xs text-muted-foreground font-arabic">تعلم بالسرعة التي تناسبك</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {[
                { icon: Target, label: "الدقة", value: `${accuracy.toFixed(1)}%`, color: "text-green-600" },
                { icon: Zap, label: "السلسلة", value: currentStreak, color: "text-orange-600" },
                { icon: Brain, label: "الأسئلة", value: `${questionsAnswered}/${sessionData.questions.length}`, color: "text-purple-600" }
              ].map((stat, index) => (
                <div key={index} className="flex items-center gap-3 bg-background/80 px-4 py-2 rounded-lg border border-border/50 shadow-sm">
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                  <div>
                    <span className="text-muted-foreground font-arabic text-sm">{stat.label}:</span>
                    <span className={cn("font-bold ml-1 font-arabic", stat.color)}>{stat.value}</span>
              </div>
              </div>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <Progress value={progress} className="h-3" variant="success" />
            <div className="flex justify-between text-sm text-muted-foreground font-arabic">
              <span>السؤال {currentQuestionIndex + 1} من {sessionData.questions.length}</span>
              <span>{progress.toFixed(1)}% مكتمل</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        <Card className="shadow-xl border-0 bg-background/95 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Badge 
                  variant="outline" 
                  className={cn("font-arabic border-2", getDifficultyColor(currentQuestion.difficulty))}
                >
                  {getDifficultyLabel(currentQuestion.difficulty)}
                </Badge>
                <Badge variant="secondary" className="text-blue-600 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 font-arabic">
                  {getTypeLabel(currentQuestion.type)}
                </Badge>
                {currentQuestion.questionBank?.title && (
                  <Badge variant="outline" className="text-purple-600 bg-purple-50/50 dark:bg-purple-950/20 border-purple-200/50 font-arabic">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {currentQuestion.questionBank.title}
                  </Badge>
                )}
              </div>
            </div>

            <CardTitle className="text-2xl leading-relaxed font-arabic text-foreground">
              {renderContent(currentQuestion.text)}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Passage Section */}
            {currentQuestion.passage && (
              <Card className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-blue-950/10 dark:to-indigo-950/10 border-blue-200/50 dark:border-blue-800/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-3 text-blue-900 dark:text-blue-100 font-arabic-heading">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  {currentQuestion.passage.title}
                </h3>
                  <div className="text-foreground leading-relaxed font-arabic">
                  {renderContent(currentQuestion.passage.content)}
                </div>
                </CardContent>
              </Card>
            )}

            {/* Options */}
            <RadioGroup
              value={selectedOption}
              onValueChange={handleOptionSelect}
              disabled={showAnswer}
              className="space-y-4"
            >
              {currentQuestion.options.map((option, index) => (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center space-x-4 space-x-reverse p-5 rounded-xl border-2 transition-all duration-200",
                    !showAnswer && "hover:bg-muted/50 cursor-pointer",
                    showAnswer && option.isCorrect && "bg-green-50/50 border-green-300/50 dark:bg-green-950/20 dark:border-green-700/50",
                    showAnswer && selectedOption === option.id && !option.isCorrect && "bg-red-50/50 border-red-300/50 dark:bg-red-950/20 dark:border-red-700/50",
                    selectedOption === option.id && !showAnswer && "bg-blue-50/50 border-blue-300/50 dark:bg-blue-950/20 dark:border-blue-700/50",
                    !selectedOption && !showAnswer && "border-border"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-muted-foreground bg-muted w-8 h-8 rounded-full flex items-center justify-center">
                      {String.fromCharCode(65 + index)}
                    </div>
                  <RadioGroupItem
                    value={option.id}
                    id={option.id}
                    disabled={showAnswer}
                  />
                  </div>
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer leading-relaxed font-arabic">
                    {renderContent(option.text)}
                  </Label>
                  <div className="flex items-center gap-2">
                  {showAnswer && option.isCorrect && (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                  )}
                  {showAnswer && selectedOption === option.id && !option.isCorrect && (
                      <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  </div>
                </div>
              ))}
            </RadioGroup>

            {/* Explanation */}
            {showAnswer && currentQuestion.explanation && (
              <Alert className="border-amber-200/50 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-800/50">
                <Lightbulb className="h-5 w-5 text-amber-600" />
                <AlertDescription className="leading-relaxed">
                  <div className="font-semibold text-amber-800 dark:text-amber-300 mb-2 font-arabic">
                    التفسير:
                  </div>
                  <div className="text-amber-700 dark:text-amber-200 font-arabic">
                    {renderContent(currentQuestion.explanation)}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Answer Result */}
            {showAnswer && answerResult && (
              <Alert className={cn(
                "border-2",
                answerResult.isCorrect
                  ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
                  : "border-red-500/50 bg-red-50/50 dark:bg-red-950/20"
              )}>
                <div className="flex items-center gap-3">
                  {answerResult.isCorrect ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  <div>
                    <AlertDescription className={cn(
                      "font-semibold text-lg font-arabic",
                      answerResult.isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                    )}>
                      {answerResult.isCorrect ? 'إجابة صحيحة! 🎉' : 'إجابة خاطئة'}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3">
                {currentQuestionIndex > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={previousQuestion}
                    className="font-arabic hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  >
                    <ChevronRight className="h-4 w-4 mr-1" />
                    السابق
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {showAnswer && (
                  <Button 
                    variant="outline" 
                    onClick={retryQuestion}
                    className="font-arabic hover:bg-secondary hover:text-secondary-foreground transition-all duration-200"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    إعادة المحاولة
                  </Button>
                )}
                
                {!showAnswer && selectedOption && (
                  <Button
                    onClick={submitAnswer}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 font-arabic shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {isSubmitting ? 'جاري التحقق...' : 'تحقق من الإجابة'}
                  </Button>
                )}
                
                {currentQuestionIndex < sessionData.questions.length - 1 && (
                  <Button 
                    onClick={nextQuestion}
                    variant={showAnswer ? "default" : "outline"}
                    className={cn(
                      "font-arabic transition-all duration-200",
                      showAnswer 
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl"
                        : "hover:bg-primary hover:text-primary-foreground"
                    )}
                  >
                        التالي
                        <ChevronLeft className="h-4 w-4 ml-1" />
                      </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
