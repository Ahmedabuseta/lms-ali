'use client';

import { useState } from 'react';
import { X, Calendar, Gift, Star, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface EidModalProps { isOpen: boolean;
  onClose: () => void; }

export const EidModal = ({ isOpen, onClose }: EidModalProps) => {
  const router = useRouter();

  const handleSignInRedirect = () => {
    router.push('/sign-in?auto=true'); // Auto-trigger sign-in for one-tap experience
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md transform rounded-2xl bg-white p-6 shadow-2xl transition-all dark:bg-gray-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
            <Gift className="h-8 w-8 text-white" />
          </div>

          {/* Title */}
          <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white font-arabic">
            مرحباً بك! 👋
          </h3>

          {/* Message */}
          <div className="mb-6 space-y-3">
            <p className="text-gray-600 dark:text-gray-300 font-arabic leading-relaxed">
              للدخول إلى منصة التعلم، يرجى تسجيل الدخول باستخدام حساب Google الخاص بك
            </p>

            <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-4 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <LogIn className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-blue-600 dark:text-blue-400 font-arabic">
                  تسجيل الدخول مطلوب
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-arabic leading-relaxed">
                استخدم حساب Google الخاص بك للوصول السريع والآمن إلى جميع ميزات المنصة
              </p>
            </div>

            <div className="flex items-center justify-center gap-1">
              { [1, 2, 3].map((star) => (
                <Star key={star } className="h-4 w-4 fill-current text-yellow-400" />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleSignInRedirect}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-arabic"
            >
              <LogIn className="mr-2 h-4 w-4" />
              تسجيل الدخول
            </Button>

            <Button
              onClick={onClose}
              variant="outline"
              className="w-full font-arabic"
            >
              إلغاء
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
