import { AlertTriangle, CheckCircleIcon, Info, X } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const bannerVariants = cva(
  'border text-center p-4 text-sm flex items-center w-full rounded-xl backdrop-blur-xl font-arabic transition-all duration-300 shadow-lg',
  { variants: {
      variant: {
        warning: 'bg-yellow-100/80 border-yellow-200/70 text-yellow-800 dark:bg-yellow-500/20 dark:border-yellow-400/30 dark:text-yellow-300',
        success: 'bg-emerald-100/80 border-emerald-200/70 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-400/30 dark:text-emerald-300',
        error: 'bg-red-100/80 border-red-200/70 text-red-800 dark:bg-red-500/20 dark:border-red-400/30 dark:text-red-300',
        info: 'bg-blue-100/80 border-blue-200/70 text-blue-800 dark:bg-blue-500/20 dark:border-blue-400/30 dark:text-blue-300', },
    },
    defaultVariants: { variant: 'warning', },
  }
);

interface BannerProps extends VariantProps<typeof bannerVariants> { label: string;
  onDismiss?: () => void; }

const iconMap = { warning: AlertTriangle,
  success: CheckCircleIcon,
  error: AlertTriangle,
  info: Info, };

export const Banner = ({ label, variant, onDismiss }: BannerProps) => {
  const Icon = iconMap[variant || 'warning'];

  return (
    <div className={cn(bannerVariants({ variant }))}>
      <div className="flex items-center justify-center gap-3 w-full">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <span className="flex-1 text-center font-medium leading-relaxed">{label}</span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 rounded-lg p-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
