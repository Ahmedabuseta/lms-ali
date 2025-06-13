'use client';

import Logo from './logo';
import { SidebarRoutes } from './sidebar-routes';
import { useSidebarStore } from '@/hooks/use-sidebar-store';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className={ cn(
      'relative flex h-full flex-col overflow-y-auto bg-white/20 backdrop-blur-lg border-r border-white/30 dark:bg-gray-900/20 dark:border-white/10 transition-all duration-300',
      isCollapsed ? 'w-20' : 'w-64'
    ) }>
      <div className={ cn(
        'border-b border-white/20 dark:border-white/10 transition-all duration-300',
        isCollapsed ? 'p-4' : 'p-6'
      ) }>
        <Logo collapsed={isCollapsed} />
      </div>

      <div className="flex w-full flex-col p-4">
        <SidebarRoutes collapsed={isCollapsed} />
      </div>
    </div>
  );
};

export default Sidebar;
