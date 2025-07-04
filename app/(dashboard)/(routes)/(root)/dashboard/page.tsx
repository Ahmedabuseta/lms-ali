import React from 'react';
import { redirect } from 'next/navigation';
import { BookOpen,
  FileQuestion,
  TrendingUp,
  Clock,
  CheckCircle,
  Brain,
  Trophy,
  Target,
  Sparkles,
  Award,
  Activity,
  Calendar,
  Star,
  Zap,
  GraduationCap,
  PlayCircle,
  BookmarkPlus,
  Search,
  Filter } from 'lucide-react';

import { getCurrentUser } from '@/lib/auth-helpers';
import { getDashboardStats, getQuickActionsData } from '@/actions/dashboard-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { QuickActionsSection } from '@/app/(dashboard)/_components/quick-actions-section';
import { StatsOverview } from '@/app/(dashboard)/_components/stats-overview';
import { RecentActivity } from '@/app/(dashboard)/_components/recent-activity';
import Link from 'next/link';

const Dashboard = React.memo(async function Dashboard() {
  const user = await getCurrentUser();

  if (!user) {
    return redirect('/sign-in');
  }

  // Get dashboard data
  const [statsResult, quickActionsResult] = await Promise.all([
    getDashboardStats(),
    getQuickActionsData(),
  ]);

  const stats = statsResult.success ? statsResult.data : null;
  const quickActionsData = quickActionsResult.success ? quickActionsResult.data : null;

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Removed heavy animated/blurred/gradient background elements for performance */}

      {/* Student Stats Overview */}
      {stats && <StatsOverview stats={stats} userRole="STUDENT" />}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3 sm:gap-8">
        {/* Student Quick Actions */}
        <div className="lg:col-span-2">
          {quickActionsData && (
            <QuickActionsSection
              data={quickActionsData}
              userRole="STUDENT"
            />
          )}
        </div>

        {/* Student Recent Activity */}
        <div className="lg:col-span-1">
          {stats?.recentActivity && (
            <RecentActivity
              activities={stats.recentActivity.map(activity => ({
                type: activity.type,
                title: activity.title,
                date: activity.timestamp,
                completed: activity.status === 'completed'
              }))}
              userRole="STUDENT"
            />
          )}
        </div>
      </div>

      {/* Student Learning Features */}
      <Card className="border-0 bg-white dark:bg-gray-800 shadow-none">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
            <BookOpen className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" />
            أدوات التعلم
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="group relative overflow-hidden border-0 bg-blue-50 dark:bg-blue-900/20 shadow-none transition-all duration-300">
              <CardContent className="relative p-4 sm:p-6">
                <div className="mb-4 flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 p-3 transition-all duration-300 group-hover:from-blue-500/30 group-hover:to-indigo-500/30">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 transition-colors group-hover:text-blue-600 dark:text-slate-200 dark:group-hover:text-blue-400">
                      دوراتي التعليمية
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      تابع تقدمك في الدورات
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  className="w-full border-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-lg"
                >
                  <Link href="/search">
                    <PlayCircle className="mr-2 h-4 w-4" />
                    استكشف الدورات
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 bg-emerald-50 dark:bg-emerald-900/20 shadow-none transition-all duration-300">
              <CardContent className="relative p-4 sm:p-6">
                <div className="mb-4 flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-3 transition-all duration-300 group-hover:from-emerald-500/30 group-hover:to-teal-500/30">
                    <FileQuestion className="h-5 w-5 text-emerald-600 dark:text-emerald-400 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 transition-colors group-hover:text-emerald-600 dark:text-slate-200 dark:group-hover:text-emerald-400">
                      الامتحانات والاختبارات
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      اختبر معلوماتك ومهاراتك
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  className="w-full border-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg"
                >
                  <Link href="/exam">
                    <Target className="mr-2 h-4 w-4" />
                    ابدأ امتحان
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 bg-purple-50 dark:bg-purple-900/20 shadow-none transition-all duration-300">
              <CardContent className="relative p-4 sm:p-6">
                <div className="mb-4 flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-3 transition-all duration-300 group-hover:from-purple-500/30 group-hover:to-pink-500/30">
                    <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 transition-colors group-hover:text-purple-600 dark:text-slate-200 dark:group-hover:text-purple-400">
                      المدرس الذكي
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      مساعدة ذكية بالذكاء الاصطناعي
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  className="w-full border-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg"
                >
                  <Link href="/ai-tutor">
                    <Sparkles className="mr-2 h-4 w-4" />
                    ابدأ المحادثة
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 bg-orange-50 dark:bg-amber-900/20 shadow-none transition-all duration-300">
              <CardContent className="relative p-4 sm:p-6">
                <div className="mb-4 flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 p-3 transition-all duration-300 group-hover:from-orange-500/30 group-hover:to-amber-500/30">
                    <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 transition-colors group-hover:text-orange-600 dark:text-slate-200 dark:group-hover:text-orange-400">
                      البطاقات التعليمية
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      مراجعة سريعة وفعالة
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  className="w-full border-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-lg"
                >
                  <Link href="/flashcards">
                    <BookmarkPlus className="mr-2 h-4 w-4" />
                    ابدأ المراجعة
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Student Progress Section */}
      <Card className="border-0 bg-white dark:bg-gray-800 shadow-none">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
            <TrendingUp className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" />
            تقدمك الأكاديمي
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-2xl font-bold text-blue-600 dark:text-blue-400 sm:text-3xl">
                {stats?.enrolledCourses || 0}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">دورة مسجل بها</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400 sm:text-3xl">
                {stats?.completedCourses || 0}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">دورة مكتملة</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-2xl font-bold text-purple-600 dark:text-purple-400 sm:text-3xl">
                {stats?.examAttempts || 0}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">محاولة امتحان</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default Dashboard;
