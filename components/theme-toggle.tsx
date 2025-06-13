'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Only show the toggle once the component has mounted to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-10 w-10" />; // Placeholder with same dimensions
  }

  const toggleTheme = () => {
    // Simple toggle between light and dark
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative h-10 w-10 transform rounded-xl border border-blue-200/50 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg backdrop-blur-sm transition-all duration-300  e-110 hover:from-blue-100 hover:to-purple-100 hover:shadow-xl dark:border-gray-600/50 dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600"
      data-tour="theme-toggle"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative">
        <Sun
          className={`h-5 w-5 transform transition-all duration-500 ${
            isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          } text-amber-500`}
        />
        <Moon
          className={`absolute inset-0 h-5 w-5 transform transition-all duration-500 ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          } text-indigo-400`}
        />
      </div>

      {/* Animated background */}
      <div
        className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
          isDark
            ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10'
            : 'bg-gradient-to-r from-amber-200/20 to-orange-200/20'
        }`}
      />
    </Button>
  );
}
