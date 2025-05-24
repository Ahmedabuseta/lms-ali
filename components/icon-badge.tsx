import { LucideIcon } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const backgroundVariants = cva('rounded-full flex items-center justify-center', {
  variants: {
    variant: {
      default: 'bg-accent',
      success: 'bg-[hsl(var(--success-light))] bg-opacity-20 dark:bg-opacity-10',
      warning: 'bg-[hsl(var(--warning-light))] bg-opacity-20 dark:bg-opacity-10',
      info: 'bg-[hsl(var(--info-light))] bg-opacity-20 dark:bg-opacity-10',
      destructive: 'bg-destructive bg-opacity-20 dark:bg-opacity-10',
    },
    size: {
      default: 'p-2',
      sm: 'p-1',
      lg: 'p-3',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

const iconVariants = cva('', {
  variants: {
    variant: {
      default: 'text-accent-foreground',
      success: 'text-[hsl(var(--success-light))] dark:text-[hsl(var(--success-dark))]',
      warning: 'text-[hsl(var(--warning-light))] dark:text-[hsl(var(--warning-dark))]',
      info: 'text-[hsl(var(--info-light))] dark:text-[hsl(var(--info-dark))]',
      destructive: 'text-destructive-foreground',
    },
    size: {
      default: 'h-6 w-6',
      sm: 'h-4 w-4',
      lg: 'h-8 w-8',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

type BackgroundVariantsProps = VariantProps<typeof backgroundVariants>;
type IconVariantsProps = VariantProps<typeof iconVariants>;

interface IconBadgeProps extends BackgroundVariantsProps, IconVariantsProps {
  icon: LucideIcon;
}

export const IconBadge = ({ icon: Icon, variant, size }: IconBadgeProps) => {
  return (
    <div className={cn(backgroundVariants({ variant, size }))}>
      <Icon className={cn(iconVariants({ variant, size }))} />
    </div>
  );
};
