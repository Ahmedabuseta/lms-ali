'use client';

import { authClient, signIn } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
      });
      await authClient.revokeOtherSessions()
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('خطأ في تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            تسجيل الدخول
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            مرحباً بك في نظام إدارة التعلم
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <FcGoogle className="w-6 h-6 mr-3" />
              {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول بنقرة واحدة'}
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-arabic">
                تسجيل دخول آمن وسريع بحساب Google
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 