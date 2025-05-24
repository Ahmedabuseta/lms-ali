import Image from 'next/image';
import Link from 'next/link';
import { BookOpenIcon, Clock, User, Star } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { IconBadge } from './icon-badge';
import { CourseProgress } from './course-progress';
import { cn } from '@/lib/utils';

type CourseCardProps = {
  id: string;
  title: string;
  imageUrl: string | null;
  chaptersLength: number;
  price: number | null;
  progress: number | null;
  category: string | null;
};

export default function CourseCard({
  id,
  title,
  imageUrl,
  chaptersLength,
  price,
  progress,
  category,
}: CourseCardProps) {
  return (
    <Link href={`/courses/${id}`}>
      <div className="group h-full transform overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 shadow-lg backdrop-blur-sm transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl dark:from-gray-800 dark:via-blue-900/10 dark:to-purple-900/10">
        {/* Image Container */}
        <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20">
          {imageUrl ? (
            <Image
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              alt={title}
              src={imageUrl}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500">
              <BookOpenIcon className="h-16 w-16 text-white" />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Category Badge */}
          {category && (
            <div className="absolute right-3 top-3">
              <div className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow-lg backdrop-blur-sm dark:bg-gray-800/90 dark:text-gray-300">
                {category}
              </div>
            </div>
          )}

          {/* Progress Badge */}
          {progress !== null && (
            <div className="absolute left-3 top-3">
              <div
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-bold shadow-lg backdrop-blur-sm',
                  progress === 100 ? 'bg-green-500/90 text-white' : 'bg-blue-500/90 text-white',
                )}
              >
                {progress === 100 ? 'مكتمل' : `${Math.round(progress)}%`}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4 p-6">
          {/* Title */}
          <div>
            <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-800 transition-colors duration-300 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              {title}
            </h3>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                <BookOpenIcon className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium">
                {chaptersLength} {chaptersLength === 1 ? 'فصل' : 'فصول'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{chaptersLength * 2}ساعة</span>
            </div>
          </div>

          {/* Progress or Price */}
          <div className="space-y-3">
            {progress !== null ? (
              <div className="space-y-2">
                <CourseProgress variant={progress === 100 ? 'success' : 'default'} size="sm" value={progress} />
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>تقدمك</span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20">
                    <Star className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">متاح للشراء</span>
                </div>
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-lg font-bold text-transparent">
                  {formatPrice(price || 0)}
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <div className="w-full transform rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-center text-sm font-medium text-white shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:from-purple-600 group-hover:to-blue-600 group-hover:shadow-xl">
              {progress !== null ? 'متابعة التعلم' : 'عرض التفاصيل'}
            </div>
          </div>
        </div>

        {/* Floating decoration */}
        <div className="absolute left-4 top-4 h-8 w-8 rounded-full bg-gradient-to-r from-orange-400 to-red-400 opacity-20 transition-transform duration-500 group-hover:scale-150"></div>
      </div>
    </Link>
  );
}
