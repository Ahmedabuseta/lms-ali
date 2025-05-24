'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  icon: any;
  label: string;
  href: string;
  tourId?: string;
}

export const SidebarItem = ({ icon: Icon, label, href, tourId }: SidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (pathname === '/' && href === '/') || pathname === href || pathname.startsWith(`${href}/`);

  const onClick = () => {
    router.push(href);
  };

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        'group mx-2 mb-2 flex transform items-center gap-x-3 rounded-xl p-3 text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg',
        isActive
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
          : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 dark:text-gray-300 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 dark:hover:text-blue-400',
      )}
      data-tour={tourId}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300',
          isActive
            ? 'bg-white/20 backdrop-blur-sm'
            : 'bg-gray-100 group-hover:bg-blue-100 dark:bg-gray-800 dark:group-hover:bg-blue-900/30',
        )}
      >
        <Icon
          size={20}
          className={cn(
            'transition-all duration-300',
            isActive
              ? 'text-white'
              : 'text-gray-600 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400',
          )}
        />
      </div>
      <span className="flex-1 text-left">{label}</span>
      {isActive && <div className="h-2 w-2 animate-pulse rounded-full bg-white" />}
    </button>
  );
};
