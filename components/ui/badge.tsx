import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-1 font-arabic shadow-md    ',
  { variants: {
      variant: {
        default: 'border-blue-200/60 bg-blue-100/70 text-blue-700 hover:bg-blue-200/80 dark:border-blue-400/30 dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30',
        secondary: 'border-gray-200/60 bg-gray-100/70 text-gray-700 hover:bg-gray-200/80 dark:border-gray-400/30 dark:bg-gray-500/20 dark:text-gray-300 dark:hover:bg-gray-500/30',
        destructive: 'border-red-200/60 bg-red-100/70 text-red-700 hover:bg-red-200/80 dark:border-red-400/30 dark:bg-red-500/20 dark:text-red-300 dark:hover:bg-red-500/30',
        outline: 'border-gray-300/60 bg-white/60 text-gray-700 hover:bg-gray-100/70 dark:border-white/20 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/20',
        success: 'border-emerald-200/60 bg-emerald-100/70 text-emerald-700 hover:bg-emerald-200/80 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-300 dark:hover:bg-emerald-500/30',
        warning: 'border-yellow-200/60 bg-yellow-100/70 text-yellow-700 hover:bg-yellow-200/80 dark:border-yellow-400/30 dark:bg-yellow-500/20 dark:text-yellow-300 dark:hover:bg-yellow-500/30',
        gradient: 'border-transparent bg-gradient-to-r from-blue-500/80 to-purple-500/80 text-white hover:from-blue-600/90 hover:to-purple-600/90 shadow-lg', },
    },
    defaultVariants: { variant: 'default', },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
