'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ChevronLeft,
  ChevronRight,
  Loader2,
  Save,
  BookOpen,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Clock,
  Wifi,
  WifiOff } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MathRenderer } from '@/components/math-renderer';
import { MDXRenderer } from '@/components/mdx-renderer';

interface QuestionFormProps { question: {
    id: string;
    text: string;
    type: string;
    passage?: {
      id: string;
      title: string;
      content: string; };
    options: { id: string;
      text: string; }[];
  };
  selectedOptionId: string | null;
  attemptId: string;
  userId: string;
  examId: string;
  currentQuestionIndex: number;
  totalQuestions: number;
}

interface AutoSaveState { status: 'idle' | 'saving' | 'saved' | 'error' | 'offline';
  lastSaved?: Date;
  retryCount: number; }

export const QuestionForm = ({ question,
  selectedOptionId,
  attemptId,
  userId,
  examId,
  currentQuestionIndex,
  totalQuestions, }: QuestionFormProps) => { const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>(selectedOptionId);
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>({
    status: 'idle',
    retryCount: 0 });
  const [isPassageExpanded, setIsPassageExpanded] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [localAnswers, setLocalAnswers] = useState<Record<string, string>>({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor online status
  useEffect(() => { const handleOnline = () => {
      setIsOnline(true);
      if (unsavedChanges && selectedOption) {
        saveAnswer(selectedOption, true); }
    };

    const handleOffline = () => { setIsOnline(false);
      setAutoSaveState(prev => ({ ...prev, status: 'offline' }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => { window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline); };
  }, [unsavedChanges, selectedOption]);

  // Initialize local answers from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedAnswers = localStorage.getItem(`exam_answers_${attemptId}`);
    if (savedAnswers) {
      try {
        const parsed = JSON.parse(savedAnswers);
        setLocalAnswers(parsed);

        if (!selectedOptionId && parsed[question.id]) {
          setSelectedOption(parsed[question.id]);
          setUnsavedChanges(true);
        }
      } catch (e) { console.error('Error parsing saved answers', e);
        localStorage.removeItem(`exam_answers_${attemptId }`);
      }
    }
  }, [attemptId, question.id, selectedOptionId]);

  // Auto-save with retry logic
  const saveAnswer = useCallback(async (optionId: string, isRetry = false) => { if (!isOnline && !isRetry) {
      const updatedAnswers = { ...localAnswers, [question.id]: optionId };
      setLocalAnswers(updatedAnswers);
      localStorage.setItem(`exam_answers_${attemptId}`, JSON.stringify(updatedAnswers));
      setAutoSaveState(prev => ({ ...prev, status: 'offline' }));
      return;
    }

    try { setAutoSaveState(prev => ({ ...prev, status: 'saving' }));

      const updatedAnswers = { ...localAnswers, [question.id]: optionId };
      setLocalAnswers(updatedAnswers);
        localStorage.setItem(`exam_answers_${attemptId}`, JSON.stringify(updatedAnswers));

      const response = await axios.post(`/api/exam/answer`, { attemptId,
        questionId: question.id,
        optionId, });

      if (response.status === 200) { setAutoSaveState({
          status: 'saved',
          lastSaved: new Date(),
          retryCount: 0 });
        setUnsavedChanges(false);

        setTimeout(() => { setAutoSaveState(prev =>
            prev.status === 'saved' ? { ...prev, status: 'idle' } : prev
          );
        }, 3000);
      }
    } catch (error: any) { console.error('Error saving answer:', error);

      const isNetworkError = !error.response || error.code === 'NETWORK_ERROR';
      const shouldRetry = isNetworkError && autoSaveState.retryCount < 3;

      if (shouldRetry) {
        const retryDelay = Math.pow(2, autoSaveState.retryCount + 1) * 1000;

        setAutoSaveState(prev => ({
          ...prev,
          status: 'error',
          retryCount: prev.retryCount + 1 }));

        retryTimeoutRef.current = setTimeout(() => { saveAnswer(optionId, true); }, retryDelay);

        toast.error(`فشل في الحفظ، سيتم المحاولة مرة أخرى خلال ${retryDelay / 1000} ثانية`);
      } else { setAutoSaveState(prev => ({ ...prev, status: 'error' }));
        setUnsavedChanges(true);

        if (error.response?.status === 403) {
          toast.error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
        } else {
          toast.error('فشل في حفظ الإجابة، تم حفظها محلياً');
        }
      }
    }
  }, [attemptId, question.id, localAnswers, isOnline, autoSaveState.retryCount]);

  // Handle option selection with debounced saving
  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    setUnsavedChanges(true);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveAnswer(optionId);
    }, 1000);
  };

  // Manual save function
  const handleManualSave = () => {
    if (selectedOption && unsavedChanges) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveAnswer(selectedOption);
    }
  };

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Navigation functions
  const goToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      router.push(`/exam/${examId}/attempt/${attemptId}?questionIndex=${currentQuestionIndex + 1}`);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      router.push(`/exam/${examId}/attempt/${attemptId}?questionIndex=${currentQuestionIndex - 1}`);
    }
  };

  // Smart content renderer
  const renderContent = (content: string) => {
    const containsMath = content.includes('$') || content.includes('\\') || content.includes('```');
    if (containsMath) {
      return <MDXRenderer content={content} />;
    }
    return <MathRenderer content={content} />;
  };

  // Auto-save status indicator
  const getStatusIcon = () => { switch (autoSaveState.status) {
      case 'saving':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'saved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-orange-500" />;
      default:
        return isOnline ? <Wifi className="h-4 w-4 text-gray-400" /> : <WifiOff className="h-4 w-4 text-orange-500" />; }
  };

  const getStatusText = () => { switch (autoSaveState.status) {
      case 'saving':
        return 'جاري الحفظ...';
      case 'saved':
        return 'تم الحفظ';
      case 'error':
        return 'خطأ في الحفظ';
      case 'offline':
        return 'غير متصل';
      default:
        return unsavedChanges ? 'غير محفوظ' : 'محفوظ'; }
  };

  return (
    <div className="space-y-4">
      {/* Passage Section */}
      { question.passage && (
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <BookOpen className="h-5 w-5" />
                {question.passage.title }
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPassageExpanded(!isPassageExpanded)}
                className="text-blue-600 dark:text-blue-400"
              >
                { isPassageExpanded ? (
                  <>
                    <EyeOff className="h-4 w-4 ml-2" />
                    إخفاء
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 ml-2" />
                    إظهار
                  </>
                ) }
              </Button>
            </div>
          </CardHeader>
          { isPassageExpanded && (
            <CardContent className="pt-0">
              <div className="prose prose-sm max-w-none text-blue-800 dark:text-blue-200 text-right">
                {renderContent(question.passage.content) }
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="font-arabic">
                {currentQuestionIndex + 1} / {totalQuestions}
              </Badge>
              <span className="font-arabic">السؤال {currentQuestionIndex + 1}</span>
        </CardTitle>

            <div className="flex items-center gap-3">
              {/* Auto-save status */}
              <div className="flex items-center gap-1 text-xs">
                {getStatusIcon()}
                <span className="font-arabic">{getStatusText()}</span>
              </div>

              {/* Manual save button */}
              {(unsavedChanges || autoSaveState.status === 'error') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualSave}
                  disabled={!selectedOption || autoSaveState.status === 'saving'}
                  className="text-xs"
                >
                  <Save className="h-3 w-3 ml-1" />
                  حفظ
                </Button>
              )}
            </div>
          </div>
      </CardHeader>

        <CardContent className="space-y-4">
          {/* Connection Status Alert */}
          { !isOnline && (
            <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/10">
              <WifiOff className="h-4 w-4" />
              <AlertDescription className="font-arabic">
                أنت غير متصل بالإنترنت. سيتم حفظ إجاباتك محلياً وإرسالها عند عودة الاتصال.
              </AlertDescription>
            </Alert>
          ) }

          {/* Error Alert */}
          { autoSaveState.status === 'error' && (
            <Alert className="border-red-200 bg-red-50 dark:bg-red-900/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-arabic">
                فشل في حفظ الإجابة على الخادم. تم حفظها محلياً وسيتم المحاولة مرة أخرى.
              </AlertDescription>
            </Alert>
          ) }

          {/* Question Text */}
        <div className="prose dark:prose-invert max-w-none text-right">
            {renderContent(question.text)}
        </div>

          {/* Options */}
          <RadioGroup
            value={selectedOption || ''}
            onValueChange={handleOptionSelect}
            className="space-y-3"
          >
            { question.options.map((option, index) => (
            <div
              key={option.id }
                className={ `flex items-center space-x-2 space-x-reverse rounded-lg border p-3 transition-all ${
                  selectedOption === option.id
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'hover:bg-accent' }`}
            >
              <RadioGroupItem value={option.id} id={option.id} />
                <Label
                  htmlFor={option.id}
                  className="flex-grow cursor-pointer text-right"
                >
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {String.fromCharCode(65 + index)}
                    </Badge>
                    <div className="flex-1">
                      {renderContent(option.text)}
                    </div>
                  </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>

        <CardFooter className="flex justify-between border-t pt-4">
          <Button
            variant="outline"
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="font-arabic"
          >
          <ChevronRight className="ml-2 h-4 w-4" />
            السابق
        </Button>

          <div className="flex items-center gap-2 text-sm text-muted-foreground font-arabic">
            <Clock className="h-4 w-4" />
            { selectedOption ? 'تم الإجابة' : 'لم يتم الإجابة' }
          </div>

          <Button
            variant="outline"
            onClick={goToNextQuestion}
            disabled={currentQuestionIndex === totalQuestions - 1}
            className="font-arabic"
          >
            التالي
          <ChevronLeft className="mr-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
    </div>
  );
};
