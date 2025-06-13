'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) { const [mounted, setMounted] = React.useState(false);

  // Only show UI once mounted to prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true); }, []);

  // Update color-scheme CSS property when theme changes
  React.useEffect(() => { if (!mounted) return;

    const updateColorScheme = () => {
      const theme = localStorage.getItem('theme') || 'system';
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = theme === 'dark' || (theme === 'system' && systemPrefersDark);

      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';

      // Apply specific fixes for components that don't automatically adapt to theme changes
      const editorElements = document.querySelectorAll('.ql-editor');
      editorElements.forEach((editor) => {
        if (isDark) {
          editor.classList.add('dark-editor'); } else {
          editor.classList.remove('dark-editor');
        }
      });
    };

    // Run initially and whenever theme changes
    updateColorScheme();
    window.addEventListener('storage', (event) => {
      if (event.key === 'theme') updateColorScheme();
    });

    // Apply anti-aliasing for better text rendering in both themes
    document.body.classList.add('antialiased');

    return () => { window.removeEventListener('storage', updateColorScheme); };
  }, [mounted]);

  return (
    <NextThemesProvider {...props}>
      { mounted ? (
        children
      ) : (
        // Use a placeholder with the same layout to prevent layout shift
        <div style={{ visibility: 'hidden', opacity: 0 }}>{children}</div>
      )}
    </NextThemesProvider>
  );
}
