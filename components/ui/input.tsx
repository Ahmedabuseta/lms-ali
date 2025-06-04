import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-lg border border-gray-200/70 bg-white/70 backdrop-blur-xl px-4 py-3 text-sm font-arabic ring-offset-background transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-1 focus-visible:border-blue-500/50 focus-visible:bg-white/90 focus-visible:scale-[1.02] hover:bg-white/80 hover:border-gray-300/80 disabled:cursor-not-allowed disabled:opacity-50 text-gray-700 dark:text-gray-200 shadow-lg dark:border-white/20 dark:bg-white/10 dark:focus-visible:bg-white/20 dark:hover:bg-white/15 dark:hover:border-white/30',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
