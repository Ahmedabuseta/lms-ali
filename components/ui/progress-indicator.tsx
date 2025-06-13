'use client';

import { 
  CheckCircle2, 
  Circle, 
  CircleDashed, 
  Clock, 
  HelpCircle, 
  Save, 
  Loader2,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProgressIndicatorProps {
  totalQuestions: number;
  answeredQuestions: number;
  timeRemaining?: string;
  hasUnsavedChanges?: boolean;
  autoSaveStatus?: 'idle' | 'saving' | 'saved' | 'error' | 'offline';
  isOnline?: boolean;
  lastSaved?: Date;
  questionStatuses?: Array<{
    questionId: string;
    isAnswered: boolean;
    hasUnsavedChanges: boolean;
    autoSaveStatus?: 'idle' | 'saving' | 'saved' | 'error' | 'offline';
  }>;
}

export function ProgressIndicator({
  totalQuestions,
  answeredQuestions,
  timeRemaining,
  hasUnsavedChanges = false,
  autoSaveStatus = 'idle',
  isOnline = true,
  lastSaved,
  questionStatuses = [],
}: ProgressIndicatorProps) {
  const progress = Math.round((answeredQuestions / totalQuestions) * 100);
  const unansweredQuestions = totalQuestions - answeredQuestions;

  // Determine color based on progress
  const getProgressColor = () => {
    if (progress < 25) return 'text-red-500 dark:text-red-400';
    if (progress < 50) return 'text-amber-500 dark:text-amber-400';
    if (progress < 75) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-green-500 dark:text-green-400';
  };

  // Get auto-save status icon and color
  const getAutoSaveIcon = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'saved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-orange-500" />;
      default:
        return isOnline ? <Wifi className="h-4 w-4 text-gray-400" /> : <WifiOff className="h-4 w-4 text-orange-500" />;
    }
  };

  const getAutoSaveText = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return 'جاري الحفظ...';
      case 'saved':
        return `تم الحفظ ${lastSaved ? new Date(lastSaved).toLocaleTimeString('ar-SA') : ''}`;
      case 'error':
        return 'خطأ في الحفظ';
      case 'offline':
        return 'غير متصل - تم الحفظ محلياً';
      default:
        return hasUnsavedChanges ? 'تغييرات غير محفوظة' : 'متصل';
    }
  };

  // Get question status for individual questions
  const getQuestionStatus = (index: number) => {
    if (questionStatuses.length > index) {
      const status = questionStatuses[index];
      if (status.hasUnsavedChanges) {
        return 'unsaved';
      } else if (status.isAnswered) {
        return 'answered';
      }
    } else if (index < answeredQuestions) {
      return 'answered';
    }
    return 'unanswered';
  };

  const getQuestionColor = (status: string) => {
    switch (status) {
      case 'answered':
        return 'bg-green-500 dark:bg-green-600';
      case 'unsaved':
        return 'bg-amber-500 dark:bg-amber-600';
      default:
        return 'bg-slate-200 dark:bg-slate-700';
    }
  };

  const getQuestionTooltip = (index: number, status: string) => {
    const questionNum = index + 1;
    switch (status) {
      case 'answered':
        return `السؤال ${questionNum}: تمت الإجابة وتم الحفظ`;
      case 'unsaved':
        return `السؤال ${questionNum}: تمت الإجابة ولكن لم يتم الحفظ`;
      default:
        return `السؤال ${questionNum}: لم تتم الإجابة`;
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center justify-between gap-4 rounded-lg border bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:flex-row">
        {/* Progress Section */}
        <div className="flex w-full items-center gap-4 sm:w-auto">
          <div className="flex flex-col items-center justify-center">
            <div className={`text-2xl font-bold ${getProgressColor()}`} aria-label="Progress percentage">
              {progress}%
            </div>
            <div className="text-xs text-muted-foreground font-arabic">التقدم</div>
          </div>
          
          {/* Question Progress Bar */}
          <div className="flex flex-1 items-center gap-1">
            {Array.from({ length: totalQuestions }).map((_, i) => {
              const status = getQuestionStatus(i);
              return (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <div
                      className={`h-2 flex-1 rounded-full transition-all duration-200 cursor-help ${getQuestionColor(status)}`}
                      style={{ minWidth: '8px', maxWidth: '20px' }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-arabic">{getQuestionTooltip(i, status)}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Status Section */}
        <div className="flex flex-wrap items-center justify-end gap-3">
          {/* Question Count */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-arabic">
              <CheckCircle2 className="h-3 w-3 ml-1" />
              {answeredQuestions}/{totalQuestions}
            </Badge>
            
            {unansweredQuestions > 0 && (
              <Badge variant="secondary" className="font-arabic">
                <Circle className="h-3 w-3 ml-1" />
                {unansweredQuestions} متبقي
              </Badge>
            )}
          </div>

          {/* Auto-save Status */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-xs">
                {getAutoSaveIcon()}
                <span className="font-arabic">{getAutoSaveText()}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="font-arabic">
                {autoSaveStatus === 'offline' && (
                  <p>أنت غير متصل بالإنترنت. سيتم حفظ الإجابات محلياً.</p>
                )}
                {autoSaveStatus === 'error' && (
                  <p>فشل في حفظ الإجابات على الخادم. تم حفظها محلياً.</p>
                )}
                {autoSaveStatus === 'saving' && (
                  <p>جاري حفظ الإجابات...</p>
                )}
                {autoSaveStatus === 'saved' && lastSaved && (
                  <p>آخر حفظ: {new Date(lastSaved).toLocaleString('ar-SA')}</p>
                )}
                {autoSaveStatus === 'idle' && isOnline && (
                  <p>متصل ومستعد للحفظ</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>

          {/* Unsaved Changes Warning */}
          {hasUnsavedChanges && (
            <Badge variant="destructive" className="animate-pulse font-arabic">
              <Save className="h-3 w-3 ml-1" />
              تغييرات غير محفوظة
            </Badge>
          )}

          {/* Time Remaining */}
          {timeRemaining && (
            <Badge variant="outline" className="font-arabic">
              <Clock className="h-3 w-3 ml-1" />
              {timeRemaining}
            </Badge>
          )}

          {/* Connection Status */}
          {!isOnline && (
            <Badge variant="secondary" className="font-arabic">
              <WifiOff className="h-3 w-3 ml-1" />
              غير متصل
            </Badge>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
