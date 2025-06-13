'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  icon: any;
  label: string;
  href: string;
  tourId?: string;
  collapsed?: boolean;
}

export const SidebarItem = ({ icon: Icon, label, href, tourId, collapsed = false }: SidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (pathname === '/' && href === '/') || pathname === href || pathname?.startsWith(`${href}/`);

  const onClick = () => {
    router.push(href);
  };

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        'group relative flex transform items-center gap-x-3  text-sm font-medium font-arabic transition-all duration-300     overflow-hidden',
        collapsed ? 'mx1 px-6 py-2 mb-3 justify-center rounded-md ' : ' rounded-xl mx-2 mb-3 p-4',
        isActive
          ? 'shadow-xl'
          : 'hover:shadow-lg',
      )}
      data-tour={tourId}
      title={collapsed ? label : undefined}
    >
      {/* Active state backgrounds */}
      {isActive ? (
        <>
          {/* Primary active background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />

          {/* Glass overlay for active */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-white/20" />

          {/* Active shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />

          {/* Active glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/50 to-purple-600/50 blur-lg" />
        </>
      ) : (
        <>
          {/* Inactive hover backgrounds */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/30 dark:to-purple-900/30 opacity-0 group-hover:opacity-100 transition-all duration-300" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-400/10 dark:to-purple-400/10 opacity-0 group-hover:opacity-100 transition-all duration-300" />

          {/* Glass overlay for hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-white/10 dark:from-white/5 dark:via-white/2 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-all duration-300" />

          {/* Hover glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-md opacity-0 group-hover:opacity-100 transition-all duration-300" />
        </>
      )}

      {/* Icon container */}
      <div
        className={cn(
          'relative flex items-center justify-center rounded-xl transition-all duration-300 group- e-110 shrink-0',
          collapsed ? 'h-10 w-10' : 'h-12 w-12',
          isActive
            ? 'bg-white/25 backdrop-blur-sm shadow-lg'
            : 'bg-gray-100/80 group-hover:bg-blue-100/80 dark:bg-gray-800/80 dark:group-hover:bg-blue-900/50',
        )}
      >
        {/* Icon glow for active state */}
        {isActive && (
          <div className="absolute inset-0 rounded-xl bg-white/20 blur-sm" />
        )}

        <Icon
          size={collapsed ? 16 : 22}
          className={cn(
            'relative z-10 transition-all duration-300',
            isActive
              ? 'text-white drop-shadow-lg'
              : 'text-gray-600 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400',
          )}
        />
      </div>

      {/* Label - hidden when collapsed */}
      {!collapsed && (
        <span
          className={cn(
            'relative z-10 flex-1 text-right transition-all duration-300',
            isActive
              ? 'text-white font-semibold drop-shadow-sm'
              : 'text-gray-700 group-hover:text-blue-700 dark:text-gray-300 dark:group-hover:text-blue-300'
          )}
        >
          {label}
        </span>
      )}

      {/* Active indicator - adjusted for collapsed state */}
      {isActive && !collapsed && (
        <>
          <div className="relative z-10 h-3 w-3 animate-pulse rounded-full bg-white shadow-lg" />
          <div className="absolute right-4 h-3 w-3 rounded-full bg-white/50 blur-sm" />
        </>
      )}

      {/* Active indicator for collapsed state */}
      {isActive && collapsed && (
        <div className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white shadow-lg animate-pulse" />
      )}

      {/* Subtle border for definition */}
      <div className={cn(
        'absolute inset-0 rounded-xl border transition-all duration-300',
        isActive
          ? 'border-white/20'
          : 'border-transparent group-hover:border-blue-200/50 dark:group-hover:border-blue-400/30'
      )} />
    </button>
  );
};
