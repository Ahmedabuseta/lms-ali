import { LucideIcon } from 'lucide-react';

import { IconBadge } from '@/components/icon-badge';

interface InfoCardProps {
  numberOfItems: number;
  variant?: 'default' | 'success' | 'warning' | 'info';
  label: string;
  icon: LucideIcon;
  itemLabel?: string;
}

export const InfoCard = ({ variant, icon: Icon, numberOfItems, label, itemLabel = 'دورة' }: InfoCardProps) => {
  return (
    <div className="flex items-center gap-x-3 rounded-lg border bg-card p-4 shadow-sm transition-shadow duration-300 hover:shadow-md">
      <IconBadge variant={variant} icon={Icon} size="lg" />
      <div>
        <p className="text-lg font-semibold text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">
          {numberOfItems} {numberOfItems === 1 ? itemLabel : `${itemLabel}ات`}
        </p>
      </div>
    </div>
  );
};
