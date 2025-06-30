'use client';

import { useEffect, useState } from 'react';
import { Shield, LogOut, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';

interface ImpersonationBannerProps {
  impersonatedUser?: {
    name?: string;
    email: string;
  };
  teacherName?: string;
}

export const ImpersonationBanner = ({ impersonatedUser, teacherName }: ImpersonationBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleStopImpersonation = async () => {
    try {
      // Clear the impersonated session
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });

      if (response.ok) {
        // Redirect to teacher dashboard
        window.location.href = '/teacher/users';
      } else {
        throw new Error('Failed to stop impersonation');
      }
    } catch (error) {
      toast.error('فشل في إنهاء جلسة التنكر');
      console.error('Error stopping impersonation:', error);
    }
  };

  if (!impersonatedUser || !isVisible) {
    return null;
  }

  return (
    <Card className="fixed top-0 left-0 right-0 z-50 rounded-none border-l-0 border-r-0 border-t-0 border-b border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 shadow-md">
      <CardContent className="p-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200">
              <Shield className="h-3 w-3 mr-1" />
              جلسة تنكر نشطة
            </Badge>
            
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-orange-800 dark:text-orange-200">
                أنت تتصفح كـ <strong>{impersonatedUser.name || impersonatedUser.email}</strong>
              </span>
              {teacherName && (
                <span className="text-orange-700 dark:text-orange-300 text-xs">
                  (بواسطة {teacherName})
                </span>
              )}
            </div>

            <div className="sm:hidden text-xs text-orange-800 dark:text-orange-200">
              تتصفح كـ <strong>{impersonatedUser.name || 'مستخدم'}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsVisible(false)}
              className="h-7 w-7 p-0 border-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900"
            >
              ×
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleStopImpersonation}
              className="border-orange-300 bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:hover:bg-orange-800"
            >
              <LogOut className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">إنهاء التنكر</span>
              <span className="sm:hidden">إنهاء</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImpersonationBanner;
