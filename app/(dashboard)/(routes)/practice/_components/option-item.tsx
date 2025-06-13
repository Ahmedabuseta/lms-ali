'use client';

import { Check, X } from 'lucide-react';
import { MathRenderer } from '@/components/math-renderer';

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface OptionItemProps {
  option: Option;
  isSelected: boolean;
  showAnswer: boolean;
  onSelect: () => void;
  isDisabled?: boolean;
}

export const OptionItem = ({ option, isSelected, showAnswer, onSelect, isDisabled = false }: OptionItemProps) => {
  const getOptionClasses = () => {
    const baseClasses = 'p-4 rounded-lg border transition-all flex items-center justify-between';
    const cursorClasses = isDisabled ? 'cursor-default' : 'cursor-pointer';

    if (!showAnswer) {
      return `${baseClasses} ${cursorClasses} ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : isDisabled
            ? 'border-slate-200 dark:border-slate-700'
            : 'hover:border-slate-300 dark:hover:border-slate-600'
      }`;
    }

    if (option.isCorrect) {
      return `${baseClasses} ${cursorClasses} border-green-500 bg-green-50 dark:bg-green-900/20`;
    }

    if (isSelected && !option.isCorrect) {
      return `${baseClasses} ${cursorClasses} border-red-500 bg-red-50 dark:bg-red-900/20`;
    }

    return `${baseClasses} ${cursorClasses} opacity-50`;
  };

  const handleClick = () => {
    if (!isDisabled) {
      onSelect();
    }
  };

  return (
    <div
      className={getOptionClasses()}
      onClick={handleClick}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-disabled={isDisabled}
    >
      <div className="flex-1">
        <MathRenderer content={option.text} />
      </div>
      {showAnswer && (
        <div className="flex items-center gap-2">
          {option.isCorrect ? (
            <span className="text-sm text-green-600 dark:text-green-400 font-arabic">صحيح</span>
          ) : isSelected ? (
            <span className="text-sm text-red-600 dark:text-red-400 font-arabic">خطأ</span>
          ) : null}
          {option.isCorrect ? (
            <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : isSelected ? (
            <X className="h-5 w-5 text-red-600 dark:text-red-400" />
          ) : null}
        </div>
      )}
    </div>
  );
};
