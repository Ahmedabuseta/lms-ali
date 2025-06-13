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

export default async function Dashboard() {
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
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 via-white to-indigo-50/60 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Enhanced decorative elements matching theme */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="to-indigo-300/15 absolute left-10 top-16 h-56 w-56 animate-pulse rounded-full bg-gradient-to-br from-blue-200/20 blur-3xl" />
        <div className="to-indigo-300/15 animation-delay-2000 absolute bottom-1/3 right-20 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-purple-200/20 blur-3xl" />
        <div className="to-blue-300/15 animation-delay-4000 absolute left-1/3 top-1/2 h-40 w-40 animate-pulse rounded-full bg-gradient-to-br from-indigo-200/20 blur-3xl" />
      </div>

      <div className="relative z-10 space-y-6 p-4 sm:space-y-8 sm:p-6">
        {/* Student Welcome Header - Matching theme */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 text-white shadow-2xl sm:rounded-3xl sm:p-8">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="animate-slide-up mb-2 flex items-center gap-3 text-2xl font-bold sm:text-3xl md:text-4xl">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm sm:h-12 sm:w-12">
                    <GraduationCap className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                  </div>
                  أهلاً وسهلاً، {user.name || user.email}! 🎓
                </h1>
            <p className="animate-slide-up animation-delay-200 mb-4 text-base text-blue-100 sm:mb-6 sm:text-lg">
                  استمر في رحلتك التعليمية وحقق أهدافك الأكاديمية
                </p>
              </div>
            </div>

            {/* Student Quick Navigation */}
            <div className="animate-slide-up animation-delay-400 mt-6 flex flex-wrap gap-3">
              <Button asChild variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
                <Link href="/search">
                  <BookOpen className="mr-2 h-4 w-4" />
                  استكشف الدورات
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
                <Link href="/exam">
                  <FileQuestion className="mr-2 h-4 w-4" />
                  الامتحانات
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
                <Link href="/ai-tutor">
                  <Brain className="mr-2 h-4 w-4" />
                  المدرس الذكي
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
                <Link href="/flashcards">
                  <Zap className="mr-2 h-4 w-4" />
                  البطاقات التعليمية
                </Link>
              </Button>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="animate-float absolute right-2 top-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 sm:right-4 sm:top-4 sm:h-16 sm:w-16">
            <Sparkles className="h-6 w-6 text-white sm:h-8 sm:w-8" />
          </div>
          <div className="animate-float animation-delay-1000 absolute bottom-2 left-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 sm:bottom-4 sm:left-4 sm:h-12 sm:w-12">
            <Award className="h-5 w-5 text-white sm:h-6 sm:w-6" />
          </div>
        </div>

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
        <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
              <BookOpen className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" />
              أدوات التعلم
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-50/80 to-indigo-50/60 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 dark:from-blue-900/20 dark:to-indigo-900/20">
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

              <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-emerald-50/80 to-teal-50/60 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 dark:from-emerald-900/20 dark:to-teal-900/20">
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

              <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-purple-50/80 to-pink-50/60 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 dark:from-purple-900/20 dark:to-pink-900/20">
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

              <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-orange-50/80 to-amber-50/60 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 dark:from-orange-900/20 dark:to-amber-900/20">
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
        <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
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
    </div>
  );
}
