'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, BookOpen, Info, Lightbulb } from 'lucide-react';
import { MathRenderer } from '@/components/math-renderer';
import { MDXRenderer } from '@/components/mdx-renderer';
import { cn } from '@/lib/utils';

export interface QuestionOption { id: string;
  text: string;
  isCorrect: boolean; }

export interface Passage { id: string;
  title: string;
  content: string; }

export interface Question { id: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'PASSAGE';
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  points?: number;
  explanation?: string;
  options: QuestionOption[];
  passage?: Passage;
  questionBank?: {
    title: string;
    chapterId?: string; };
}

export interface QuestionDisplayProps { question: Question;
  selectedOptionId?: string;
  onOptionSelect?: (optionId: string) => void;
  showAnswer?: boolean;
  showExplanation?: boolean;
  isReviewMode?: boolean;
  disabled?: boolean;
  className?: string;
  // Layout options
  layout?: 'compact' | 'standard' | 'detailed';
  // Show additional info
  showQuestionMeta?: boolean;
  showPassageCollapsed?: boolean;
  // Actions
  actions?: React.ReactNode; }

const getDifficultyColor = (difficulty?: string) => { switch (difficulty) {
    case 'EASY':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'HARD':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'; }
};

const getDifficultyLabel = (difficulty?: string) => { switch (difficulty) {
    case 'EASY': return 'سهل';
    case 'MEDIUM': return 'متوسط';
    case 'HARD': return 'صعب';
    default: return difficulty; }
};

const getTypeLabel = (type: string) => { switch (type) {
    case 'MULTIPLE_CHOICE': return 'اختيار متعدد';
    case 'TRUE_FALSE': return 'صح أم خطأ';
    case 'PASSAGE': return 'قطعة';
    default: return type; }
};

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question,
  selectedOptionId,
  onOptionSelect,
  showAnswer = false,
  showExplanation = false,
  isReviewMode = false,
  disabled = false,
  className,
  layout = 'standard',
  showQuestionMeta = false,
  showPassageCollapsed = false,
  actions, }) => { const [isPassageExpanded, setIsPassageExpanded] = React.useState(!showPassageCollapsed);

  // Determine if content contains math (LaTeX or MDX)
  const containsMath = (text: string) => {
    return text.includes('$') || text.includes('\\') || text.includes('```'); };

  // Smart content renderer - uses MDX for complex content, plain text for simple
  const renderContent = (content: string) => {
    if (containsMath(content)) {
      return <MDXRenderer content={content} />;
    }
    return <MathRenderer content={content} />;
  };

  return (
    <div className={ cn('space-y-4', className) }>
      {/* Passage Section */}
      { question.passage && (
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <BookOpen className="h-5 w-5" />
                {question.passage.title }
              </CardTitle>
              {showPassageCollapsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPassageExpanded(!isPassageExpanded)}
                  className="text-blue-600 dark:text-blue-400"
                >
                  { isPassageExpanded ? 'إخفاء' : 'إظهار' }
                </Button>
              )}
            </div>
          </CardHeader>
          { isPassageExpanded && (
            <CardContent className="pt-0">
              <div className="prose prose-sm max-w-none text-blue-800 dark:text-blue-200">
                {renderContent(question.passage.content) }
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Question Card */}
      <Card className={ cn(
        'border transition-all duration-200',
        layout === 'compact' && 'border-0 shadow-none bg-transparent',
        isReviewMode && 'border-gray-300 dark:border-gray-600',
      ) }>
        {layout !== 'compact' && (
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {showQuestionMeta && (
                  <>
                    <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                      {getDifficultyLabel(question.difficulty)}
                    </Badge>
                    <Badge variant="secondary">
                      {getTypeLabel(question.type)}
                    </Badge>
                    {question.points && question.points > 1 && (
                      <Badge variant="outline" className="border-purple-200 text-purple-700">
                        {question.points} نقاط
                      </Badge>
                    )}
                  </>
                )}
              </div>
              {actions}
            </div>
          </CardHeader>
        )}

        <CardContent className={ layout === 'compact' ? 'p-0' : 'pt-0' }>
          {/* Question Text */}
          <div className="mb-6">
            <div className="text-lg font-medium leading-relaxed text-gray-900 dark:text-gray-100">
              {renderContent(question.text)}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {onOptionSelect ? (
              <RadioGroup
                value={selectedOptionId || ''}
                onValueChange={onOptionSelect}
                disabled={disabled || showAnswer}
                className="space-y-3"
              >
                { question.options.map((option, index) => {
                  const isSelected = selectedOptionId === option.id;
                  const isCorrect = option.isCorrect;

                  let optionStyle = 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600';

                  if (showAnswer) {
                    if (isCorrect) {
                      optionStyle = 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-600'; } else if (isSelected && !isCorrect) { optionStyle = 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-600'; }
                  } else if (isSelected) { optionStyle = 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600'; }

                  return (
                    <div
                      key={option.id}
                      className={ cn(
                        'flex items-center space-x-3 space-x-reverse p-4 border rounded-lg transition-all cursor-pointer',
                        optionStyle,
                        (disabled || showAnswer) && 'cursor-default'
                      ) }
                      onClick={() => !disabled && !showAnswer && onOptionSelect?.(option.id)}
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
            ) : (
              // Read-only display mode
              <div className="space-y-3">
                { question.options.map((option, index) => {
                  const isSelected = selectedOptionId === option.id;
                  const isCorrect = option.isCorrect;

                  let optionStyle = 'border-gray-200 dark:border-gray-700';

                  if (showAnswer) {
                    if (isCorrect) {
                      optionStyle = 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-600'; } else if (isSelected && !isCorrect) { optionStyle = 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-600'; }
                  } else if (isSelected) { optionStyle = 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600'; }

                  return (
                    <div
                      key={option.id}
                      className={ cn(
                        'flex items-center space-x-3 space-x-reverse p-4 border rounded-lg',
                        optionStyle
                      ) }
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex-1 text-right">
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
                          {isSelected && !showAnswer && (
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Explanation */}
          { (showExplanation || (showAnswer && question.explanation)) && question.explanation && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/10 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">
                    تفسير الإجابة:
                  </div>
                  <div className="text-amber-700 dark:text-amber-200">
                    {renderContent(question.explanation) }
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Question Meta (if compact layout) */}
          {layout === 'compact' && showQuestionMeta && (
            <div className="flex items-center gap-2 mt-4">
              <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                {getDifficultyLabel(question.difficulty)}
              </Badge>
              <Badge variant="secondary">
                {getTypeLabel(question.type)}
              </Badge>
              {question.points && question.points > 1 && (
                <Badge variant="outline" className="border-purple-200 text-purple-700">
                  {question.points} نقاط
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
