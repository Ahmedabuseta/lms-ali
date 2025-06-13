import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 backdrop-blur-sm font-arabic',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl     hover:from-blue-700 hover:to-purple-700 active:scale-95',
        destructive: 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:shadow-xl     hover:from-red-600 hover:to-pink-700 active:scale-95',
        outline: 'border border-gray-300/70 bg-white/70 backdrop-blur-xl hover:bg-white/90 hover:border-gray-400/80     text-gray-700 dark:text-gray-200 shadow-lg active:scale-95 dark:border-white/20 dark:bg-white/10 dark:hover:bg-white/20 dark:hover:border-white/30',
        secondary: 'bg-gray-100/70 backdrop-blur-xl text-gray-700 dark:text-gray-200 hover:bg-gray-200/80     shadow-lg border border-gray-200/60 active:scale-95 dark:bg-white/20 dark:border-white/10 dark:hover:bg-white/30',
        ghost: 'hover:bg-gray-100/70 hover:backdrop-blur-xl     text-gray-600 dark:text-gray-300 active:scale-95 dark:hover:bg-white/10',
        link: 'text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline     active:scale-95',
        success: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl     hover:from-emerald-600 hover:to-teal-700 active:scale-95',
        glass: 'bg-white/70 backdrop-blur-2xl border border-gray-200/60 text-gray-700 dark:text-gray-200 hover:bg-white/90 hover:border-gray-300/70     shadow-xl active:scale-95 dark:border-white/20 dark:bg-white/10 dark:hover:bg-white/20 dark:hover:border-white/30',
        gradient: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg hover:shadow-2xl     hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 active:scale-95',
      },
      size: {
        default: 'h-10 px-6 py-2',
        sm: 'h-8 rounded-md px-4 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base',
        icon: 'h-10 w-10',
        xl: 'h-14 rounded-xl px-10 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
