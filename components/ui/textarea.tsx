import * as React from 'react';

import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[100px] w-full rounded-lg border border-gray-200/60 bg-white/60 backdrop-blur-xl px-4 py-3 text-sm font-arabic ring-offset-background transition-all duration-300 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-1 focus-visible:border-blue-500/50 focus-visible:bg-white/80 focus-visible:scale-[1.02] hover:bg-white/70 hover:border-gray-300/70 disabled:cursor-not-allowed disabled:opacity-50 text-gray-700 dark:text-gray-200 shadow-lg dark:border-white/20 dark:bg-white/10 dark:focus-visible:bg-white/20 dark:hover:bg-white/15 dark:hover:border-white/30 resize-none',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
