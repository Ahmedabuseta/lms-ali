import { requireAuth } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { Users, Shield, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { UserManagement } from './_components/user-management-simplified';
import { db } from '@/lib/db';
import { isTeacher } from '@/lib/user';
import { IconBadge } from '@/components/icon-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StudentAccessType, UserRole } from '@/lib/types';
import { Suspense } from 'react';

// Loading component for better UX
const UsersPageSkeleton = () => (
  <div className="min-h-screen p-4 space-y-6">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-muted rounded animate-pulse" />
      <div>
        <div className="h-6 w-32 bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
      </div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-2">
            <div className="h-4 w-20 bg-muted rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-12 bg-muted rounded mb-2" />
            <div className="h-3 w-16 bg-muted rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
    <Card>
      <CardHeader>
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-10 w-full bg-muted rounded animate-pulse" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 w-full bg-muted rounded animate-pulse" />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Error component
const ErrorDisplay = ({ error }: { error: string }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <Card className="max-w-md w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          خطأ في تحميل البيانات
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{error}</p>
      </CardContent>
    </Card>
  </div>
);

// Optimized data fetching function
async function fetchUsersData() {
  try {
    const dbUsers = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        accessType: true,
        createdAt: true,
        updatedAt: true,
        trialStartDate: true,
        trialEndDate: true,
        isTrialUsed: true,
        paymentReceived: true,
        paymentAmount: true,
        paymentNotes: true,
        accessGrantedAt: true,
        accessGrantedBy: true,
        banned: true,
        banReason: true,
        banExpires: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 1000, // Limit results for performance
    });

    // Transform database users to match the User interface
    return dbUsers.map(user => ({
      ...user,
      userId: user.id, // Add userId field that the interface expects
      paymentAmount: user.paymentAmount || null,
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('فشل في تحميل بيانات المستخدمين');
  }
}

const UsersPageContent = async () => {
  const { session } = await requireAuth();

  if (!session) {
    redirect('/sign-in');
  }

  // Check if user is a teacher
  const teacherCheck = await isTeacher();
  if (!teacherCheck) {
    redirect('/dashboard');
  }

  let users: any[] = [];
  let error: string | null = null;

  try {
    users = await fetchUsersData();
  } catch (err) {
    error = err instanceof Error ? err.message : 'خطأ غير معروف';
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  // Calculate stats efficiently
  const studentUsers = users.filter((user) => user.role === UserRole.STUDENT);
  const totalStudents = studentUsers.length;

  const activeStudents = studentUsers.filter(
    (user) => user.accessType === StudentAccessType.FULL_ACCESS || user.accessType === StudentAccessType.LIMITED_ACCESS,
  ).length;

  const trialStudents = studentUsers.filter((user) => user.accessType === StudentAccessType.FREE_TRIAL).length;

  const noAccessStudents = studentUsers.filter((user) => user.accessType === StudentAccessType.NO_ACCESS).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <IconBadge icon={Users} variant="success" />
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">إدارة المستخدمين</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              إدارة صلاحيات وموافقات المستخدمين وتتبع حالة الاشتراكات
            </p>
          </div>
        </div>

        {/* Stats Overview - Mobile Responsive */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden bg-card/60 backdrop-blur-sm transition-all duration-200 hover:shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5" />
            <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">إجمالي الطلاب</CardTitle>
                <IconBadge icon={Users} variant="info" size="sm" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">مسجل في النظام</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-card/60 backdrop-blur-sm transition-all duration-200 hover:shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5" />
            <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">الطلاب النشطين</CardTitle>
                <IconBadge icon={CheckCircle} variant="success" size="sm" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeStudents}</div>
              <p className="text-xs text-muted-foreground">
                {totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0}% من المجموع
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-card/60 backdrop-blur-sm transition-all duration-200 hover:shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5" />
            <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-orange-500 to-amber-500" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">فترة التجربة</CardTitle>
                <IconBadge icon={Clock} variant="warning" size="sm" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trialStudents}</div>
              <p className="text-xs text-muted-foreground">في فترة التجربة المجانية</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-card/60 backdrop-blur-sm transition-all duration-200 hover:shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-gray-500/5" />
            <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-slate-500 to-gray-500" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">بدون صلاحية</CardTitle>
                <IconBadge icon={Shield} variant="default" size="sm" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{noAccessStudents}</div>
              <p className="text-xs text-muted-foreground">في انتظار الموافقة</p>
            </CardContent>
          </Card>
        </div>

        {/* User Management Component - Simplified */}
        <Card className="overflow-hidden bg-card/60 backdrop-blur-sm">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center gap-3">
              <IconBadge icon={Users} variant="info" size="sm" />
              <div>
                <CardTitle className="text-lg sm:text-xl font-semibold">قائمة المستخدمين</CardTitle>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  إدارة حالة وصلاحيات جميع المستخدمين
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <UserManagement users={users} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const UsersPage = () => {
  return (
    <Suspense fallback={<UsersPageSkeleton />}>
      <UsersPageContent />
    </Suspense>
  );
};

export default UsersPage;
