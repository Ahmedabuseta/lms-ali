'use client';

import { BarChart,
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
  MessageCircle, } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { SidebarItem } from './sidebar-item';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermissions } from '@/hooks/use-permissions';

interface SidebarRoutesProps { collapsed?: boolean; }

const getAllRoutes = (permissions: any) => { const studentRoutes = [
    {
      icon: Layout,
      label: 'لوحة التحكم',
      href: '/dashboard',
      requiresPermission: null, },
    { icon: Compass,
      label: 'استكشاف الدورات',
      href: '/search',
      requiresPermission: 'canAccessCourses', },
    { icon: FileQuestion,
      label: 'الاختبارات',
      href: '/exam',
      requiresPermission: 'canAccessExams', },
    { icon: MemoryStick,
      label: 'البطاقات التعليمية',
      href: '/flashcards',
      requiresPermission: 'canAccessFlashcards', },
    { icon: Dumbbell,
      label: 'التمارين',
      href: '/practice',
      requiresPermission: 'canAccessPractice', },
    { icon: Bot,
      label: 'المدرس الذكي',
      href: '/ai-tutor',
      requiresPermission: 'canAccessAI', },
  ];

  const teacherRoutes = [
    { icon: List,
      label: 'الدورات',
      href: '/teacher/courses',
      requiresPermission: null, },
    { icon: BarChart,
      label: 'التحليلات',
      href: '/teacher/analytics',
      requiresPermission: null, },
    { icon: FileQuestion,
      label: 'الاختبارات',
      href: '/teacher/exam',
      requiresPermission: null, },
    { icon: MemoryStick,
      label: 'البطاقات التعليمية',
      href: '/teacher/flashcards',
      requiresPermission: null, },
    { icon: Dumbbell,
      label: 'بنك الأسئلة',
      href: '/teacher/questions-bank',
      requiresPermission: null, },
    { icon: Users,
      label: 'إدارة المستخدمين',
      href: '/teacher/users',
      requiresPermission: null, },
  ];

  // Filter routes based on permissions
  const filteredStudentRoutes = studentRoutes.filter((route) => {
    if (!route.requiresPermission) return true;
    return permissions && permissions[route.requiresPermission] === true;
  });

  return { studentRoutes: filteredStudentRoutes, teacherRoutes };
};

export const SidebarRoutes = ({ collapsed = false }: SidebarRoutesProps) => { const pathname = usePathname();
  const {
    permissions,
    loading,
    error,
    refresh,
    canStartTrial,
    getTrialDaysLeft,
    isTrialExpired,
    getAccessType } = usePermissions();

  const startTrial = async () => { try {
      const response = await fetch('/api/user/start-trial', {
        method: 'POST', });

      if (response.ok) {
        toast.success('تم تفعيل التجربة المجانية!');
        // Refresh permissions to get updated data
        await refresh();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'فشل في تفعيل التجربة المجانية');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تفعيل التجربة المجانية');
    }
  };

  if (loading) { return (
      <div className="flex w-full flex-col space-y-1">
        <div className="h-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    ); }

  if (error || !permissions) { return (
      <div className="p-4">
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <p className="text-sm text-red-600 dark:text-red-400 font-arabic mb-2">
              خطأ في تحميل الصلاحيات
            </p>
            <Button
              onClick={() => refresh() }
              size="sm"
              variant="outline"
              className="font-arabic"
            >
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isTeacherPage = pathname?.startsWith('/teacher');
  const { studentRoutes, teacherRoutes } = getAllRoutes(permissions);

  const routes = permissions.isTeacher && isTeacherPage ? teacherRoutes : studentRoutes;

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex w-full flex-col space-y-1">
        {routes.map((route) => (
          <SidebarItem
            key={route.href}
            icon={route.icon}
            label={route.label}
            href={route.href}
            collapsed={collapsed}
          />
        ))}
      </div>

      {/* Trial and Access Cards */}
      {!permissions.isTeacher && (
        <div className="mt-auto space-y-3 p-3">
          {/* Free Trial Card */}
          { canStartTrial() && (
            <Card className="border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <CardTitle className="text-sm font-arabic text-blue-800 dark:text-blue-200">
                    جرب مجاناً
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-3 font-arabic">
                  احصل على 3 أيام تجربة مجانية
                </p>
                <Button
                  onClick={startTrial }
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 font-arabic"
                >
                  بدء التجربة
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Active Trial Status */}
          { getAccessType() === 'FREE_TRIAL' && !isTrialExpired() && (
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200 font-arabic">
                    التجربة المجانية
                  </span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 font-arabic">
                  متبقي: {getTrialDaysLeft() } أيام
                </p>
              </CardContent>
            </Card>
          )}

          {/* Upgrade Card */}
          { (getAccessType() === 'NO_ACCESS' || isTrialExpired()) && (
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-amber-600" />
                  <CardTitle className="text-sm font-arabic text-amber-800 dark:text-amber-200">
                    ترقية الحساب
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-amber-700 dark:text-amber-300 mb-3 font-arabic">
                  احصل على وصول كامل لجميع الميزات
                </p>
                <Button
                  asChild
                  size="sm"
                  className="w-full bg-amber-600 hover:bg-amber-700 font-arabic"
                >
                  <a href="/pricing">عرض الخطط</a>
                </Button>
              </CardContent>
            </Card>
          ) }
        </div>
      )}
    </div>
  );
};
