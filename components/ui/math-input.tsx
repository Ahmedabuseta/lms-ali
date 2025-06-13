'use client';

import React, { useState, useRef } from 'react';
import { MathRenderer } from '@/components/math-renderer';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calculator, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover,
  PopoverContent,
  PopoverTrigger, } from '@/components/ui/popover';

interface MathInputProps { value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showPreview?: boolean;
  rows?: number;
  disabled?: boolean; }

const mathExamples = [
  { label: 'أسس', code: 'x^2' },
  { label: 'كسور', code: '\\frac{a }{b}' },
  { label: 'جذور', code: '\\sqrt{x }' },
  { label: 'مجموع', code: '\\sum_{i=1 }^{n} i' },
  { label: 'تكامل', code: '\\int_0^1 x^2 dx' },
];

export const MathInput: React.FC<MathInputProps> = ({ value,
  onChange,
  placeholder = 'أدخل النص هنا... استخدم $x^2$ للرياضيات',
  className,
  showPreview = true,
  rows = 3,
  disabled = false, }) => { const [previewOpen, setPreviewOpen] = useState(showPreview);
  const [helpOpen, setHelpOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMath = (mathCode: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + `$${mathCode }$` + value.substring(end);
      onChange(newValue);
    }
  };

  const hasMath = value.includes('$') || value.includes('\\');

  return (
    <div className={ cn('space-y-2', className) }>
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className="font-arabic pr-16"
        />

        <div className="absolute top-2 left-2 flex gap-1">
          <Popover open={helpOpen} onOpenChange={setHelpOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <Calculator className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 font-arabic">أمثلة الصيغ الرياضية</h4>
              </div>
              <div className="max-h-60 overflow-y-auto">
                { mathExamples.map((example, index) => (
                  <button
                    key={index }
                    type="button"
                    onClick={() => {
                      insertMath(example.code);
                      setHelpOpen(false);
                    }}
                    className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 font-arabic">
                      {example.label}
                    </div>
                    <code className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1 block">
                      {example.code}
                    </code>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {hasMath && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPreviewOpen(!previewOpen)}
              className="h-8 w-8 p-0 hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              { previewOpen ? (
                <EyeOff className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) }
            </Button>
          )}
        </div>
      </div>

      { previewOpen && hasMath && value.trim() && (
        <Card className="p-3 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-arabic">
              معاينة:
            </span>
          </div>
          <div className="prose dark:prose-invert max-w-none">
            <MathRenderer content={value } />
          </div>
        </Card>
      )}
    </div>
  );
};
