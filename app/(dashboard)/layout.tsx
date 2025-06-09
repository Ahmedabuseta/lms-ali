'use client';

import { Navbar } from './_components/navbar';
import Sidebar from './_components/sidebar';
import { useSidebarStore } from '@/hooks/use-sidebar-store';
import { cn } from '@/lib/utils';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 dark:from-gray-950 dark:via-zinc-950 dark:to-slate-950">
      {/* Modern abstract background elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        {/* Main gradient spheres */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-500/15 to-purple-500/10 blur-3xl animate-pulse" />
        <div className="absolute -top-16 -right-16 h-80 w-80 rounded-full bg-gradient-to-br from-purple-500/15 via-pink-500/10 to-rose-500/5 blur-3xl animate-pulse animation-delay-2000" />
        <div className="absolute -bottom-24 left-1/5 h-72 w-72 rounded-full bg-gradient-to-br from-cyan-500/15 via-teal-500/10 to-emerald-500/5 blur-3xl animate-pulse animation-delay-4000" />
        <div className="absolute bottom-0 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-violet-500/15 via-purple-500/10 to-indigo-500/5 blur-3xl animate-pulse animation-delay-1000" />

        {/* Floating accent dots */}
        <div className="absolute top-1/2 left-1/2 h-40 w-40 rounded-full bg-gradient-to-br from-amber-400/10 to-orange-400/5 blur-2xl animate-pulse animation-delay-3000" />
        <div className="absolute top-1/4 right-1/4 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400/10 to-teal-400/5 blur-2xl animate-pulse animation-delay-1500" />
        <div className="absolute bottom-1/3 left-1/4 h-28 w-28 rounded-full bg-gradient-to-br from-rose-400/10 to-pink-400/5 blur-2xl animate-pulse animation-delay-3500" />

        {/* Subtle geometric patterns */}
        <div className="absolute top-20 right-20 h-20 w-20 rotate-45 bg-gradient-to-br from-blue-400/8 to-indigo-400/4 blur-xl animate-pulse" />
        <div className="absolute bottom-20 left-20 h-16 w-16 rotate-12 bg-gradient-to-br from-purple-400/8 to-violet-400/4 blur-xl animate-pulse animation-delay-2500" />
      </div>

      {/* Glassmorphism Navbar */}
      <div className={cn(
        'fixed inset-y-0 z-50 h-[80px] w-full transition-all duration-300',
        isCollapsed ? 'md:pl-16' : 'md:pl-64'
      )}>
        <Navbar />
      </div>

      {/* Glassmorphism Sidebar */}
      <div className="fixed inset-y-0 z-50 hidden h-full flex-col md:flex transition-all duration-300">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className={cn(
        'relative min-h-screen pt-[80px] transition-all duration-300',
        isCollapsed ? 'md:pl-16' : 'md:pl-64'
      )}>
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
