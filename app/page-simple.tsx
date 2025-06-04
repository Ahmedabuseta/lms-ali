'use client';

import { useAuth } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export default function SimpleLandingPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Handle authentication redirect
  useEffect(() => {
    if (isLoaded && userId) {
      router.push('/dashboard');
    }
  }, [isLoaded, userId, router]);

  // Show loading state while auth is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-arabic">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is authenticated (will redirect)
  if (userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900" dir="rtl">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="hidden sm:block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-lg md:text-xl font-bold text-transparent font-arabic">
                LMS Ali
              </span>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4 space-x-reverse">
              <ThemeToggle />
              <Button
                onClick={openModal}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-arabic text-xs md:text-sm px-2 sm:px-3 md:px-4"
              >
                <span className="hidden sm:inline">تسجيل الدخول</span>
                <span className="sm:hidden">دخول</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-5xl font-bold text-transparent md:text-7xl font-arabic leading-tight">
              مستقبل التعلم
              <br />
              <span className="text-4xl md:text-6xl">يبدأ هنا</span>
            </h1>

            <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600 dark:text-gray-300 md:text-2xl font-arabic leading-relaxed">
              منصة تعليمية شاملة تجمع بين التكنولوجيا المتقدمة والتعلم التفاعلي لتوفير تجربة تعليمية استثنائية
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                onClick={openModal}
                className="transform bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl font-arabic"
              >
                ابدأ التعلم الآن
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-md transform rounded-2xl bg-white p-6 shadow-2xl transition-all dark:bg-gray-800">
            <div className="text-center">
              <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white font-arabic">
                عيد مبارك! 🌙
              </h3>
              <p className="text-gray-600 dark:text-gray-300 font-arabic leading-relaxed mb-6">
                ستكون المنصة متاحة بعد انتهاء إجازة العيد المبارك
              </p>
              <Button
                onClick={closeModal}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-arabic"
              >
                فهمت، شكراً لكم
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 