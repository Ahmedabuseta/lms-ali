'use client';

import React from 'react';
import { Navbar } from './_components/navbar';
import Sidebar from './_components/sidebar';
import { useSidebarStore } from '@/hooks/use-sidebar-store';
import { cn } from '@/lib/utils';

const DashboardLayout = React.memo(({ children }: { children: React.ReactNode }) => {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Removed heavy animated/blurred/gradient background elements for performance */}

      {/* Glassmorphism Navbar */}
      <div className={ cn(
        'fixed inset-y-0 z-50 h-[80px] w-full transition-all duration-300',
        isCollapsed ? 'md:pl-16' : 'md:pl-64'
      ) }>
        <Navbar />
      </div>

      {/* Glassmorphism Sidebar */}
      <div className="fixed inset-y-0 z-50 hidden h-full flex-col md:flex transition-all duration-300">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className={ cn(
        'relative min-h-screen pt-[80px] transition-all duration-300',
        isCollapsed ? 'md:pl-16' : 'md:pl-64'
      ) }>
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
});

export default DashboardLayout;
