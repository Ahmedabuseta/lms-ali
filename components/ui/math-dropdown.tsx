'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { MathRenderer } from '@/components/math-renderer';
import { cn } from '@/lib/utils';

interface MathDropdownProps { title: string;
  content: string;
  defaultOpen?: boolean;
  className?: string;
  titleClassName?: string;
  contentClassName?: string; }

export const MathDropdown: React.FC<MathDropdownProps> = ({ title,
  content,
  defaultOpen = false,
  className = '',
  titleClassName = '',
  contentClassName = '', }) => { const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <div className={cn('overflow-hidden rounded-md border', className) }>
      <button
        onClick={toggle}
        className={ cn(
          'flex w-full items-center justify-between bg-slate-50 p-4 text-left transition-colors hover:bg-slate-100',
          titleClassName,
        ) }
        aria-expanded={isOpen}
      >
        <div className="font-medium">
          <MathRenderer content={title} />
        </div>
        { isOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" /> }
      </button>

      { isOpen && (
        <div className={cn('bg-white p-4', contentClassName) }>
          <MathRenderer content={content} />
        </div>
      )}
    </div>
  );
};
