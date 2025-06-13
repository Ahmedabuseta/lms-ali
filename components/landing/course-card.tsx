import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CourseCardProps { title: string;
  description: string;
  icon: LucideIcon;
  gradientFrom: string;
  gradientTo: string;
  iconGradientFrom: string;
  iconGradientTo: string;
  priceColor: string;
  href?: string;
  onStartClick?: () => void; }

export const CourseCard = ({ title,
  description,
  icon: Icon,
  gradientFrom,
  gradientTo,
  iconGradientFrom,
  iconGradientTo,
  priceColor,
  href = '/dashboard',
  onStartClick }: CourseCardProps) => {
  return (
    <Card className={`group transform border-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} transition-all duration-500 hover:shadow-2xl dark:${ gradientFrom.replace('50', '900/20') } dark:${ gradientTo.replace('100', '900/20') }`}>
                  <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className={`flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r ${iconGradientFrom} ${iconGradientTo} transition-transform duration-300 group- e-110`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white font-arabic">{title}</h3>
        </div>
        <p className="mb-4 leading-relaxed text-gray-600 dark:text-gray-300 font-arabic text-sm">
          {description}
        </p>
        <div className="flex items-center justify-between">
          <span className={`text-lg font-bold ${priceColor} font-arabic`}>جرب مجاناً</span>
          {onStartClick ? (
            <Button
              size="sm"
              onClick={onStartClick}
              className={`bg-gradient-to-r ${iconGradientFrom} ${iconGradientTo} font-arabic`}
            >
              ابدأ الآن
            </Button>
          ) : (
            <Button size="sm" className={`bg-gradient-to-r ${iconGradientFrom} ${iconGradientTo} font-arabic`} asChild>
              <Link href={href}>
                ابدأ الآن
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
