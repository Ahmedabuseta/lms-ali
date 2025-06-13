'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

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

interface PageProtectionProps {
  children: React.ReactNode;
  requiredPermission?: keyof UserPermissions;
  requiredRole?: 'TEACHER' | 'STUDENT';
  allowTeachers?: boolean;
  fallbackUrl?: string;
  customMessage?: {
    title: string;
    description: string;
    icon?: React.ComponentType<{ className?: string }>;
  };
}

export function PageProtection({
  children,
  requiredPermission,
  requiredRole,
  allowTeachers = true,
  fallbackUrl = '/dashboard',
  customMessage,
}: PageProtectionProps) {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch('/api/user/permissions');
        if (response.status === 401) {
          router.push('/sign-in');
          return;
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch permissions');
        }
        
        const data = await response.json();
        setPermissions(data);
      } catch (error) {
        console.error('Failed to fetch user permissions:', error);
        setError('Failed to load permissions');
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-muted-foreground font-arabic">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (error || !permissions) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="font-arabic">خطأ في التحقق من الصلاحيات</CardTitle>
            <CardDescription className="font-arabic">
              حدث خطأ أثناء التحقق من صلاحياتك. يرجى المحاولة مرة أخرى.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full font-arabic"
            >
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check role-based access
  if (requiredRole) {
    const isTeacher = permissions.isTeacher;
    
    if (requiredRole === 'TEACHER' && !isTeacher) {
      return (
        <AccessDeniedCard
          title="وصول مقيد للمعلمين"
          description="هذه الصفحة متاحة للمعلمين فقط."
          icon={Shield}
          fallbackUrl={fallbackUrl}
        />
      );
    }
    
    if (requiredRole === 'STUDENT' && isTeacher && !allowTeachers) {
      return (
        <AccessDeniedCard
          title="صفحة الطلاب"
          description="هذه الصفحة مخصصة للطلاب فقط."
          icon={Shield}
          fallbackUrl="/teacher"
        />
      );
    }
  }

  // Check permission-based access
  if (requiredPermission) {
    const hasPermission = permissions[requiredPermission];
    
    if (!hasPermission) {
      // Show custom message if provided
      if (customMessage) {
        return (
          <AccessDeniedCard
            title={customMessage.title}
            description={customMessage.description}
            icon={customMessage.icon || Lock}
            fallbackUrl={fallbackUrl}
          />
        );
      }

      // Default messages based on permission type
      const permissionMessages = {
        canAccessVideos: {
          title: 'الوصول للفيديوهات غير متاح',
          description: 'تحتاج إلى اشتراك كامل للوصول إلى الفيديوهات التعليمية.',
          icon: Lock,
        },
        canAccessCourses: {
          title: 'الوصول للدورات غير متاح',
          description: 'تحتاج إلى اشتراك للوصول إلى محتوى الدورات.',
          icon: Lock,
        },
        canAccessExams: {
          title: 'الوصول للاختبارات غير متاح',
          description: 'تحتاج إلى اشتراك أو تجربة مجانية للوصول إلى الاختبارات.',
          icon: Lock,
        },
        canAccessFlashcards: {
          title: 'الوصول للبطاقات التعليمية غير متاح',
          description: 'تحتاج إلى اشتراك أو تجربة مجانية للوصول إلى البطاقات التعليمية.',
          icon: Lock,
        },
        canAccessPractice: {
          title: 'الوصول للتمارين غير متاح',
          description: 'تحتاج إلى اشتراك أو تجربة مجانية للوصول إلى التمارين.',
          icon: Lock,
        },
        canAccessAI: {
          title: 'الوصول للمدرس الذكي غير متاح',
          description: 'تحتاج إلى اشتراك كامل للوصول إلى المدرس الذكي.',
          icon: Lock,
        },
      };

      const message = permissionMessages[requiredPermission];
      
      return (
        <AccessDeniedCard
          title={message?.title || 'الوصول غير مسموح'}
          description={message?.description || 'ليس لديك الصلاحية للوصول إلى هذه الصفحة.'}
          icon={message?.icon || Lock}
          fallbackUrl={fallbackUrl}
          permissions={permissions}
        />
      );
    }
  }

  // All checks passed, render children
  return <>{children}</>;
}

interface AccessDeniedCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  fallbackUrl: string;
  permissions?: UserPermissions;
}

function AccessDeniedCard({ 
  title, 
  description, 
  icon: Icon, 
  fallbackUrl, 
  permissions 
}: AccessDeniedCardProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-white/20">
        <CardHeader className="text-center">
          <Icon className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <CardTitle className="font-arabic text-xl">{title}</CardTitle>
          <CardDescription className="font-arabic text-base">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Show trial option if available */}
          {permissions?.canStartTrial && (
            <Button 
              onClick={() => router.push('/dashboard?startTrial=true')} 
              className="w-full font-arabic bg-blue-600 hover:bg-blue-700"
            >
              <Clock className="mr-2 h-4 w-4" />
              بدء التجربة المجانية
            </Button>
          )}
          
          {/* Show trial status if active */}
          {permissions?.accessType === 'FREE_TRIAL' && !permissions.isTrialExpired && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-arabic text-center">
                <Clock className="inline mr-1 h-4 w-4" />
                متبقي من التجربة المجانية: {permissions.trialDaysLeft} أيام
              </p>
            </div>
          )}
          
          {/* Show upgrade options */}
          <Button 
            onClick={() => router.push('/pricing')} 
            variant="outline" 
            className="w-full font-arabic"
          >
            عرض خطط الاشتراك
          </Button>
          
          <Button 
            onClick={() => router.push(fallbackUrl)} 
            variant="ghost" 
            className="w-full font-arabic"
          >
            العودة للوحة التحكم
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 