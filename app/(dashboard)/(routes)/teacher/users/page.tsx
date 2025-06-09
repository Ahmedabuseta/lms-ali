import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { Users, Shield, Clock, CheckCircle } from 'lucide-react';
import { UserManagement } from './_components/user-management';
import { db } from '@/lib/db';
import { isTeacher } from '@/lib/user';
import { IconBadge } from '@/components/icon-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StudentAccessType, UserRole } from '@/lib/types';

const UsersPage = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect('/');
  }

  // const teacherCheck = await isTeacher()
  // if (!teacherCheck) {
  //   return redirect('/dashboard')
  // }

  // Mock users data for testing - replace with actual database query later
  const users = [
    {
      id: '1',
      userId: 'user_1',
      name: 'أحمد محمد',
      email: 'ahmed@example.com',
      role: UserRole.STUDENT,
      accessType: StudentAccessType.FULL_ACCESS,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      trialStartDate: null,
      trialEndDate: null,
      isTrialUsed: false,
      paymentReceived: true,
      paymentAmount: 250,
      paymentNotes: 'تم الدفع عبر تحويل بنكي',
      accessGrantedAt: new Date('2024-01-15'),
      accessGrantedBy: 'teacher_1',
    },
    {
      id: '2',
      userId: 'user_2',
      name: 'فاطمة علي',
      email: 'fatima@example.com',
      role: UserRole.STUDENT,
      accessType: StudentAccessType.FREE_TRIAL,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
      trialStartDate: new Date('2024-01-20'),
      trialEndDate: new Date('2024-02-20'),
      isTrialUsed: true,
      paymentReceived: false,
      paymentAmount: null,
      paymentNotes: null,
      accessGrantedAt: null,
      accessGrantedBy: null,
    },
    {
      id: '3',
      userId: 'user_3',
      name: 'محمد سعد',
      email: 'mohamed@example.com',
      role: UserRole.STUDENT,
      accessType: StudentAccessType.LIMITED_ACCESS,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
      trialStartDate: null,
      trialEndDate: null,
      isTrialUsed: false,
      paymentReceived: true,
      paymentAmount: 150,
      paymentNotes: 'دفع جزئي - وصول محدود',
      accessGrantedAt: new Date('2024-01-10'),
      accessGrantedBy: 'teacher_1',
    },
    {
      id: '4',
      userId: 'user_4',
      name: 'نورا أحمد',
      email: 'nora@example.com',
      role: UserRole.STUDENT,
      accessType: StudentAccessType.NO_ACCESS,
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-01-25'),
      trialStartDate: null,
      trialEndDate: null,
      isTrialUsed: false,
      paymentReceived: false,
      paymentAmount: null,
      paymentNotes: null,
      accessGrantedAt: null,
      accessGrantedBy: null,
    },
    {
      id: '5',
      userId: 'user_5',
      name: 'علي حسن - معلم',
      email: 'ali@example.com',
      role: UserRole.TEACHER,
      accessType: StudentAccessType.FULL_ACCESS,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      trialStartDate: null,
      trialEndDate: null,
      isTrialUsed: false,
      paymentReceived: true,
      paymentAmount: null,
      paymentNotes: 'حساب معلم - أنت',
      accessGrantedAt: new Date('2024-01-01'),
      accessGrantedBy: null,
    },
    {
      id: '6',
      userId: 'user_6',
      name: 'سارة محمود',
      email: 'sara@example.com',
      role: UserRole.STUDENT,
      accessType: StudentAccessType.FREE_TRIAL,
      createdAt: new Date('2024-01-28'),
      updatedAt: new Date('2024-01-28'),
      trialStartDate: new Date('2024-01-28'),
      trialEndDate: new Date('2024-01-25'), // Expired trial
      isTrialUsed: true,
      paymentReceived: false,
      paymentAmount: null,
      paymentNotes: null,
      accessGrantedAt: null,
      accessGrantedBy: null,
    },
    {
      id: '7',
      userId: 'user_7',
      name: 'خالد عبدالله',
      email: 'khalid@example.com',
      role: UserRole.STUDENT,
      accessType: StudentAccessType.FULL_ACCESS,
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-12'),
      trialStartDate: null,
      trialEndDate: null,
      isTrialUsed: false,
      paymentReceived: true,
      paymentAmount: 300,
      paymentNotes: 'تم الدفع كاملاً - واتساب',
      accessGrantedAt: new Date('2024-01-12'),
      accessGrantedBy: 'teacher_1',
    },
    {
      id: '8',
      userId: 'user_8',
      name: 'مريم يوسف',
      email: 'mariam@example.com',
      role: UserRole.STUDENT,
      accessType: StudentAccessType.NO_ACCESS,
      createdAt: new Date('2024-01-30'),
      updatedAt: new Date('2024-01-30'),
      trialStartDate: null,
      trialEndDate: null,
      isTrialUsed: false,
      paymentReceived: false,
      paymentAmount: null,
      paymentNotes: null,
      accessGrantedAt: null,
      accessGrantedBy: null,
    },
    {
      id: '9',
      userId: 'user_9',
      name: 'د. أمين العلي - معلم مساعد',
      email: 'amin@example.com',
      role: UserRole.TEACHER,
      accessType: StudentAccessType.FULL_ACCESS,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-05'),
      trialStartDate: null,
      trialEndDate: null,
      isTrialUsed: false,
      paymentReceived: true,
      paymentAmount: null,
      paymentNotes: 'حساب معلم مساعد',
      accessGrantedAt: new Date('2024-01-05'),
      accessGrantedBy: null,
    },
  ];

  // Uncomment below for actual database query
  // const users = await db.user.findMany({
  //   select: {
  //     id: true,
  //     userId: true,
  //     name: true,
  //     email: true,
  //     role: true,
  //     accessType: true,
  //     createdAt: true,
  //     updatedAt: true,
  //     trialStartDate: true,
  //     trialEndDate: true,
  //     isTrialUsed: true,
  //     paymentReceived: true,
  //     paymentAmount: true,
  //     paymentNotes: true,
  //     accessGrantedAt: true,
  //   },
  //   orderBy: {
  //     createdAt: 'desc'
  //   },
  //   take: 100,
  // })

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
