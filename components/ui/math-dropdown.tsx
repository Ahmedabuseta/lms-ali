"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { MathRenderer } from '@/components/math-renderer';
import { cn } from '@/lib/utils';

interface MathDropdownProps {
  title: string;
  content: string;
  defaultOpen?: boolean;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
}

export const MathDropdown: React.FC<MathDropdownProps> = ({
  title,
  content,
  defaultOpen = false,
  className = '',
  titleClassName = '',
  contentClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <div className={cn("border rounded-md overflow-hidden", className)}>
      <button
        onClick={toggle}
        className={cn(
          "flex items-center justify-between w-full p-4 text-left bg-slate-50 hover:bg-slate-100 transition-colors",
          titleClassName
        )}
        aria-expanded={isOpen}
      >
        <div className="font-medium">
          <MathRenderer content={title} />
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-slate-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-500" />
        )}
      </button>
      
      {isOpen && (
        <div className={cn("p-4 bg-white", contentClassName)}>
          <MathRenderer content={content} />
        </div>
      )}
    </div>
  );
};