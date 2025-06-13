import { requireAuth } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { Users, Shield, Clock, CheckCircle } from 'lucide-react';
import { UserManagement } from './_components/user-management';
import { db } from '@/lib/db';
import { isTeacher } from '@/lib/user';
import { IconBadge } from '@/components/icon-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StudentAccessType, UserRole } from '@/lib/types';

const UsersPage = async () => {
  requireAuth();

  // Check if user is a teacher
  const teacherCheck = await isTeacher();
  if (!teacherCheck) {
    return redirect('/dashboard');
  }

  // Fetch real users from database
  let users: any[] = [];

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
    });

    // Transform database users to match the User interface
    users = dbUsers.map(user => ({
      ...user,
      userId: user.id, // Add userId field that the interface expects
      paymentAmount: user.paymentAmount || null,
    }));

    console.log(`Loaded ${users.length} users from database`);
  } catch (error) {
    console.error('Error fetching users:', error);
    // users remains empty array if database query fails
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Enhanced decorative elements for both themes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-10 top-20 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/5 blur-3xl dark:from-blue-400/10 dark:to-indigo-400/5" />
        <div
          className="absolute bottom-1/4 left-20 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/5 blur-3xl dark:from-purple-400/10 dark:to-pink-400/5"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute right-1/3 top-1/2 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-green-500/10 to-emerald-500/5 blur-3xl dark:from-green-400/10 dark:to-emerald-400/5"
          style={{ animationDelay: '4s' }}
        />
      </div>

      <div className="relative z-10 space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <IconBadge icon={Users} variant="success" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">إدارة المستخدمين</h1>
            <p className="text-muted-foreground">إدارة صلاحيات وموافقات المستخدمين وتتبع حالة الاشتراكات</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden border border-border/50 bg-card/60 shadow-lg backdrop-blur-sm transition-shadow duration-200 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/5 dark:from-blue-400/10 dark:to-indigo-400/5" />
            <div className="absolute right-0 top-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">إجمالي الطلاب</CardTitle>
              <IconBadge icon={Users} variant="info" size="sm" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-foreground">{totalStudents}</div>
              <p className="mt-1 text-xs text-muted-foreground">مسجل في النظام</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border border-border/50 bg-card/60 shadow-lg backdrop-blur-sm transition-shadow duration-200 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/5 dark:from-green-400/10 dark:to-emerald-400/5" />
            <div className="absolute right-0 top-0 h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">الطلاب النشطين</CardTitle>
              <IconBadge icon={CheckCircle} variant="success" size="sm" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-foreground">{activeStudents}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0}% من المجموع
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border border-border/50 bg-card/60 shadow-lg backdrop-blur-sm transition-shadow duration-200 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/5 dark:from-orange-400/10 dark:to-amber-400/5" />
            <div className="absolute right-0 top-0 h-1 w-full bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-400 dark:to-amber-400" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">فترة التجربة</CardTitle>
              <IconBadge icon={Clock} variant="warning" size="sm" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-foreground">{trialStudents}</div>
              <p className="mt-1 text-xs text-muted-foreground">في فترة التجربة المجانية</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border border-border/50 bg-card/60 shadow-lg backdrop-blur-sm transition-shadow duration-200 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 via-transparent to-gray-500/5 dark:from-slate-400/10 dark:to-gray-400/5" />
            <div className="absolute right-0 top-0 h-1 w-full bg-gradient-to-r from-slate-500 to-gray-500 dark:from-slate-400 dark:to-gray-400" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">بدون صلاحية</CardTitle>
              <IconBadge icon={Shield} variant="default" size="sm" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-foreground">{noAccessStudents}</div>
              <p className="mt-1 text-xs text-muted-foreground">في انتظار الموافقة</p>
            </CardContent>
          </Card>
        </div>

        {/* User Management Component */}
        <Card className="overflow-hidden border border-border/50 bg-card/60 shadow-lg backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/5 via-transparent to-muted/10" />
          <CardHeader className="relative border-b border-border/50 bg-muted/20">
            <div className="flex items-center gap-3">
              <IconBadge icon={Users} variant="info" size="sm" />
              <div>
                <CardTitle className="text-xl font-semibold text-foreground">قائمة المستخدمين</CardTitle>
                <p className="text-sm text-muted-foreground">إدارة حالة وصلاحيات جميع المستخدمين (بيانات تجريبية)</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative p-6">
            <UserManagement users={users} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UsersPage;
