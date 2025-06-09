import type { Metadata } from 'next';
import { Inter, Cairo } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/providers/toaster-provider';
import { ConfettiProvider, ThemeProvider, NotificationsProvider } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });
const cairo = Cairo({ subsets: ['arabic'] });

export const metadata: Metadata = {
  title: 'درب النجاح p2s',
  description: 'نظام إدارة التعلم',
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
          {/* Enhanced dark mode script with better transition handling */}
          {/*
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    // Get stored theme preference or detect system preference
                    const storedTheme = localStorage.getItem('theme');
                    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    // Apply theme class immediately to avoid flash
                    if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
                      document.documentElement.classList.add('dark');
                      document.documentElement.style.colorScheme = 'dark';
                    } else {
                      document.documentElement.classList.remove('dark');
                      document.documentElement.style.colorScheme = 'light';
                    }

                    // Temporarily disable transitions on initial load
                    document.documentElement.setAttribute('data-theme-transition', 'false');

                    // Re-enable transitions after a short delay
                    window.addEventListener('DOMContentLoaded', () => {
                      setTimeout(() => {
                        document.documentElement.removeAttribute('data-theme-transition');
                      }, 250);
                    });

                    // Listen for system theme changes
                    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                      const currentTheme = localStorage.getItem('theme');
                      if (currentTheme !== 'light' && currentTheme !== 'dark') {
                        if (e.matches) {
                          document.documentElement.classList.add('dark');
                          document.documentElement.style.colorScheme = 'dark';
                        } else {
                          document.documentElement.classList.remove('dark');
                          document.documentElement.style.colorScheme = 'light';
                        }
                      }
                    });
                  } catch (e) {
                    console.warn('Failed to apply theme early:', e);
                  }
                })();
              `,
            }}
          />
          */}
        </head>
        <body className={`${cairo.className} bg-background text-foreground antialiased`}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem storageKey="theme">
            <ConfettiProvider />
            <ToastProvider />
            <NotificationsProvider />
            {children}
          </ThemeProvider>
        </body>
      </html>
  );
}
