'use client';

import { PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { MobileSidebar } from './mobile-sidebar';
import { NavbarRoutes } from '@/components/navbar-routes';
import { useSidebarStore } from '@/hooks/use-sidebar-store';

export const Navbar = () => {
  const { isCollapsed, toggle } = useSidebarStore();

  return (
    <div className="relative flex h-full items-center bg-white/20 backdrop-blur-lg border-b border-white/30 dark:bg-gray-900/20 dark:border-white/10">
      <div className="flex w-full items-center px-6 py-4">
        {/* Desktop Sidebar Toggle */}
        <button
          onClick={toggle}
          className="hidden md:flex items-center justify-center h-10 w-10 rounded-lg bg-white/30 hover:bg-white/40 dark:bg-gray-800/30 dark:hover:bg-gray-800/40 transition-all duration-200 mr-4 hover:scale-105"
          title={isCollapsed ? 'توسيع الشريط الجانبي' : 'طي الشريط الجانبي'}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          ) : (
            <PanelLeftClose className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          )}
        </button>

        <MobileSidebar />
        <NavbarRoutes />
      </div>
    </div>
  );
};
