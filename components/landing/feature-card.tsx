import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradientFrom: string;
  gradientTo: string;
  iconGradientFrom: string;
  iconGradientTo: string;
}

export const FeatureCard = ({
  title,
  description,
  icon: Icon,
  gradientFrom,
  gradientTo,
  iconGradientFrom,
  iconGradientTo,
}: FeatureCardProps) => {
  return (
    <Card className={`group transform border-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} transition-all duration-500 hover:shadow-2xl dark:${gradientFrom.replace('50', '900/20')} dark:${gradientTo.replace('100', '900/20')}`}>
      <CardContent className="p-6 md:p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className={`flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r ${iconGradientFrom} ${iconGradientTo} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white font-arabic">{title}</h3>
        </div>
        <p className="leading-relaxed text-gray-600 dark:text-gray-300 font-arabic text-sm md:text-base">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};
