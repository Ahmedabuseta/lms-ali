'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

import { cn } from '@/lib/utils';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-gray-200/60 bg-gray-200/60 backdrop-blur-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-1 focus-visible:scale-110 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=unchecked]:bg-gray-200/60     dark:border-white/20 dark:bg-white/10 dark:data-[state=checked]:bg-blue-500 dark:data-[state=unchecked]:bg-white/10',
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-all duration-300 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5 backdrop-blur-xl dark:bg-gray-200',
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
