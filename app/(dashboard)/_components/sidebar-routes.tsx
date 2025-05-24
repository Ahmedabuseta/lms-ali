'use client';

import {
  BarChart,
  Bot,
  Compass,
  Dumbbell,
  FileQuestion,
  Layout,
  List,
  MemoryStick,
  Globe,
  ScanText,
  Users,
  UserCheck,
  Clock,
  CreditCard,
  MessageCircle,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { SidebarItem } from './sidebar-item';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';

interface UserPermissions {
  canAccessVideos: boolean;
  canAccessCourses: boolean;
  canAccessExams: boolean;
  canAccessFlashcards: boolean;
  canAccessPractice: boolean;
  canAccessAI: boolean;
  isTeacher: boolean;
  accessType: string;
  canStartTrial: boolean;
  trialDaysLeft: number;
  isTrialExpired: boolean;
}

const getAllRoutes = (permissions: UserPermissions) => {
  const studentRoutes = [
    {
      icon: Layout,
      label: 'لوحة التحكم',
      href: '/dashboard',
      requiresPermission: null,
    },
    {
      icon: Compass,
      label: 'استكشاف الدورات',
      href: '/search',
      requiresPermission: 'canAccessCourses' as keyof UserPermissions,
    },
    {
      icon: FileQuestion,
      label: 'الاختبارات',
      href: '/exam',
      requiresPermission: 'canAccessExams' as keyof UserPermissions,
    },
    {
      icon: MemoryStick,
      label: 'البطاقات التعليمية',
      href: '/flashcards',
      requiresPermission: 'canAccessFlashcards' as keyof UserPermissions,
    },
    {
      icon: Dumbbell,
      label: 'التمارين',
      href: '/practice',
      requiresPermission: 'canAccessPractice' as keyof UserPermissions,
    },
    {
      icon: Bot,
      label: 'المدرس الذكي',
      href: '/ai-tutor',
      requiresPermission: 'canAccessAI' as keyof UserPermissions,
    },
  ];

  const teacherRoutes = [
    {
      icon: List,
      label: 'الدورات',
      href: '/teacher/courses',
      requiresPermission: null,
    },
    {
      icon: BarChart,
      label: 'التحليلات',
      href: '/teacher/analytics',
      requiresPermission: null,
    },
    {
      icon: FileQuestion,
      label: 'الاختبارات',
      href: '/teacher/exam',
      requiresPermission: null,
    },
    {
      icon: MemoryStick,
      label: 'البطاقات التعليمية',
      href: '/teacher/flashcards',
      requiresPermission: null,
    },
    {
      icon: Dumbbell,
      label: 'بنك الأسئلة',
      href: '/teacher/questions-bank',
      requiresPermission: null,
    },
    {
      icon: Users,
      label: 'إدارة المستخدمين',
      href: '/teacher/users',
      requiresPermission: null,
    },
  ];

  // Filter routes based on permissions
  const filteredStudentRoutes = studentRoutes.filter((route) => {
    if (!route.requiresPermission) return true;
    return permissions[route.requiresPermission] === true;
  });

  return { studentRoutes: filteredStudentRoutes, teacherRoutes };
};

export const SidebarRoutes = () => {
  const pathname = usePathname();
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch('/api/user/permissions');
        if (response.ok) {
          const data = await response.json();
          setPermissions(data);
        }
      } catch (error) {
        console.error('Failed to fetch user permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const startTrial = async () => {
    try {
      const response = await fetch('/api/user/start-trial', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('تم تفعيل التجربة المجانية!');
        // Refresh permissions
        const permissionsResponse = await fetch('/api/user/permissions');
        if (permissionsResponse.ok) {
          const data = await permissionsResponse.json();
          setPermissions(data);
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'فشل في تفعيل التجربة المجانية');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تفعيل التجربة المجانية');
    }
  };

  if (loading || !permissions) {
    return (
      <div className="flex w-full flex-col space-y-1">
        <div className="h-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  const isTeacherPage = pathname?.startsWith('/teacher');
  const { studentRoutes, teacherRoutes } = getAllRoutes(permissions);

  const routes = isTeacherPage ? teacherRoutes : studentRoutes;

  // Show different states based on access type
  if (!permissions.isTeacher) {
    // No access - show trial option
    if (permissions.accessType === 'NO_ACCESS') {
      return (
        <div className="flex w-full flex-col space-y-4 p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">مرحباً بك!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                لا يمكنك الوصول إلى محتوى المنصة حالياً
              </div>

              {permissions.canStartTrial && (
                <div className="space-y-3">
                  <div className="text-center">
                    <Clock className="mx-auto mb-2 h-8 w-8 text-blue-500" />
                    <h3 className="font-medium">تجربة مجانية لمدة 3 أيام</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">جرب جميع ميزات المنصة مجاناً</p>
                  </div>
                  <Button onClick={startTrial} className="w-full">
                    بدء التجربة المجانية
                  </Button>
                </div>
              )}

              <div className="space-y-2 border-t pt-3">
                <div className="text-center">
                  <CreditCard className="mx-auto mb-2 h-8 w-8 text-green-500" />
                  <h3 className="font-medium">للحصول على الوصول الكامل</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">تواصل معنا عبر واتساب للاشتراك</p>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <a href="https://wa.me/YOUR_WHATSAPP_NUMBER" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    تواصل عبر واتساب
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Trial active
    if (permissions.accessType === 'FREE_TRIAL' && !permissions.isTrialExpired) {
      return (
        <div className="flex w-full flex-col space-y-1">
          <div className="mb-2 p-3">
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    التجربة المجانية - {permissions.trialDaysLeft} أيام متبقية
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          {routes.map((route) => (
            <SidebarItem key={route.href} icon={route.icon} label={route.label} href={route.href} />
          ))}
        </div>
      );
    }

    // Trial expired
    if (permissions.accessType === 'FREE_TRIAL' && permissions.isTrialExpired) {
      return (
        <div className="flex w-full flex-col space-y-4 p-4">
          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
            <CardHeader>
              <CardTitle className="text-center text-yellow-800 dark:text-yellow-200">انتهت التجربة المجانية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-sm text-yellow-700 dark:text-yellow-300">
                لقد انتهت فترة التجربة المجانية. للمتابعة، يرجى الاشتراك في إحدى الخطط
              </div>

              <div className="space-y-2">
                <div className="text-center">
                  <MessageCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
                  <h3 className="font-medium">للاشتراك</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    تواصل معنا عبر واتساب لاختيار الخطة المناسبة
                  </p>
                </div>
                <Button className="w-full" asChild>
                  <a href="https://wa.me/YOUR_WHATSAPP_NUMBER" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    تواصل للاشتراك
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // Normal navigation for teachers or paid students
  return (
    <div className="flex w-full flex-col space-y-1">
      {/* Show access type badge for paid students */}
      {!permissions.isTeacher &&
        (permissions.accessType === 'FULL_ACCESS' || permissions.accessType === 'LIMITED_ACCESS') && (
          <div className="mb-2 p-3">
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <UserCheck className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {permissions.accessType === 'FULL_ACCESS' ? 'اشتراك كامل' : 'اشتراك محدود'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      {routes.map((route) => (
        <SidebarItem key={route.href} icon={route.icon} label={route.label} href={route.href} />
      ))}
    </div>
  );
};
