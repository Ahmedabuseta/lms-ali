'use client';

import React from 'react';
import { SidebarRoutes } from './sidebar-routes';
import { useSidebarStore } from '@/hooks/use-sidebar-store';
import { cn } from '@/lib/utils';

const SidebarComponent = () => {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className={cn(
      'flex h-full w-full flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex h-full w-full flex-col">
        <SidebarRoutes collapsed={isCollapsed} />
      </div>
    </div>
  );
};

export default React.memo(SidebarComponent);
