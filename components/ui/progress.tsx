'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const progressVariants = cva('h-full w-full flex-1 transition-all duration-500 ease-out rounded-full', {
  variants: {
    variant: {
      default: 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg',
      success: 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg',
      warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg',
      danger: 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg',
      purple: 'bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof progressVariants> {}

type CombinedProgressProps = ProgressProps & React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>;

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, CombinedProgressProps>(
  ({ className, value, variant, ...props }, ref) => (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn('relative h-3 w-full overflow-hidden rounded-full bg-gray-200/60 backdrop-blur-xl border border-gray-200/60 shadow-inner dark:bg-white/10 dark:border-white/20', className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(progressVariants({ variant }))}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  ),
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
