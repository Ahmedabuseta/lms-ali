import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconBadge } from '@/components/icon-badge';
import { formatPrice } from '@/lib/format';
import { DollarSign, TrendingUp, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type DataCardProps = {
  value: number;
  label: string;
  shouldFormat?: boolean;
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'destructive';
  trend?: {
    value: number;
    isPositive: boolean;
  };
};

const variants = {
  default: 'border-l-4 border-l-slate-500 relative overflow-hidden',
  success: 'border-l-4 border-l-green-500 relative overflow-hidden',
  warning: 'border-l-4 border-l-orange-500 relative overflow-hidden',
  info: 'border-l-4 border-l-blue-500 relative overflow-hidden',
  destructive: 'border-l-4 border-l-red-500 relative overflow-hidden',
};

const gradients = {
  default: 'bg-gradient-to-br from-slate-500/10 via-transparent to-gray-500/5',
  success: 'bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/5',
  warning: 'bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/5',
  info: 'bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/5',
  destructive: 'bg-gradient-to-br from-red-500/10 via-transparent to-pink-500/5',
};

export default function DataCard({
  value,
  label,
  shouldFormat,
  icon: Icon = shouldFormat ? DollarSign : TrendingUp,
  variant = shouldFormat ? 'success' : 'info',
  trend,
}: DataCardProps) {
  return (
    <Card className={cn('bg-card transition-all duration-300 hover:scale-[1.02] hover:shadow-lg', variants[variant])}>
      <div className={cn('absolute inset-0', gradients[variant])} />

      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-foreground">{label}</CardTitle>
        <IconBadge icon={Icon} variant={variant} size="sm" />
      </CardHeader>

      <CardContent className="relative">
        <div className="text-2xl font-bold text-foreground">{shouldFormat ? formatPrice(value) : value}</div>

        {trend && (
          <div className="mt-2 flex items-center gap-1">
            <TrendingUp
              className={cn('h-3 w-3', trend.isPositive ? 'rotate-0 text-green-500' : 'rotate-180 text-red-500')}
            />
            <span
              className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
              )}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">من الشهر الماضي</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
