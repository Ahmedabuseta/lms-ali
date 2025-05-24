import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { CheckCircle, Clock, BookOpen, Trophy, Brain, Target, Sparkles, TrendingUp, Award, Users } from 'lucide-react';
import CoursesList from '@/components/course-list';
import { getDashboardCourses } from '@/actions/get-dashboard-courses';
import { InfoCard } from './_components/info-card';
import { LearningInsights } from './_components/learning-insights';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default async function Dashboard() {
  const { userId } = auth();

  if (!userId) {
    return redirect('/');
  }

  const { completedCourses, coursesInProgress } = await getDashboardCourses(userId);

  // Add chaptersLength property to each course
  const coursesWithChaptersLength = [...coursesInProgress, ...completedCourses].map((course) => ({
    ...course,
    chaptersLength: course.chapters.length,
  }));

  // Mock data for the learning insights component
  const mockRecentActivity = [
    { type: 'course', title: 'مقدمة في تعلم الآلة', date: 'قبل ساعتين', progress: 45 },
    { type: 'exam', title: 'اختبار أساسيات رياكت', date: 'أمس', progress: 100 },
    { type: 'completion', title: 'أساسيات جافاسكريبت', date: 'قبل 3 أيام' },
    { type: 'course', title: 'تقنيات CSS متقدمة', date: 'الأسبوع الماضي', progress: 68 },
  ];

  // Calculate total hours based on courses
  const totalHours = completedCourses.length * 5 + coursesInProgress.length * 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="space-y-8 p-6">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white">
          <div className="relative z-10">
            <h1 className="animate-slide-up mb-2 text-3xl font-bold md:text-4xl">مرحباً بك في رحلة التعلم! 🎓</h1>
            <p className="animate-slide-up animation-delay-200 mb-6 text-lg text-blue-100">
              استمر في تطوير مهاراتك وحقق أهدافك التعليمية
            </p>
            <div className="animate-slide-up animation-delay-400 flex flex-wrap gap-4">
              <Button
                size="lg"
                className="transform border border-white/20 bg-white/20 text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/30"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                متابعة التعلم
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="transform border-white/30 text-white transition-all duration-300 hover:scale-105 hover:bg-white/10"
              >
                <Trophy className="mr-2 h-5 w-5" />
                عرض الإنجازات
              </Button>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="animate-float absolute right-4 top-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div className="animate-float animation-delay-1000 absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <Award className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Learning Insights */}
        <div className="transform transition-all duration-300 hover:scale-[1.02]">
          <LearningInsights
            totalCourses={completedCourses.length + coursesInProgress.length}
            completedCourses={completedCourses.length}
            totalHours={totalHours}
            studyStreak={7}
            recentActivity={mockRecentActivity}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="group transform overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-indigo-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardContent className="relative p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 transition-transform duration-300 group-hover:scale-110">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">قيد التقدم</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{coursesInProgress.length}</p>
                </div>
              </div>
              <div className="absolute right-2 top-2 h-8 w-8 animate-pulse rounded-full bg-blue-500/20"></div>
            </CardContent>
          </Card>

          <Card className="group transform overflow-hidden border-0 bg-gradient-to-br from-green-50 to-emerald-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:from-green-900/20 dark:to-emerald-900/20">
            <CardContent className="relative p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 transition-transform duration-300 group-hover:scale-110">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">مكتمل</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{completedCourses.length}</p>
                </div>
              </div>
              <div className="animation-delay-200 absolute right-2 top-2 h-8 w-8 animate-pulse rounded-full bg-green-500/20"></div>
            </CardContent>
          </Card>

          <Card className="group transform overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-pink-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:from-purple-900/20 dark:to-pink-900/20">
            <CardContent className="relative p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 transition-transform duration-300 group-hover:scale-110">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">ساعات التعلم</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalHours}</p>
                </div>
              </div>
              <div className="animation-delay-400 absolute right-2 top-2 h-8 w-8 animate-pulse rounded-full bg-purple-500/20"></div>
            </CardContent>
          </Card>

          <Card className="group transform overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-red-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:from-orange-900/20 dark:to-red-900/20">
            <CardContent className="relative p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-red-500 transition-transform duration-300 group-hover:scale-110">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">معدل الإنجاز</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {Math.round(
                      (completedCourses.length / (completedCourses.length + coursesInProgress.length)) * 100,
                    ) || 0}
                    %
                  </p>
                </div>
              </div>
              <div className="animation-delay-600 absolute right-2 top-2 h-8 w-8 animate-pulse rounded-full bg-orange-500/20"></div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 shadow-lg dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
              <Target className="h-6 w-6 text-indigo-600" />
              إجراءات سريعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Button
                size="lg"
                className="flex h-auto transform flex-col gap-2 bg-gradient-to-r from-blue-600 to-purple-600 p-6 transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700"
              >
                <BookOpen className="h-8 w-8" />
                <span className="text-lg font-semibold">استكشف الدورات</span>
                <span className="text-sm opacity-90">اكتشف دورات جديدة</span>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="flex h-auto transform flex-col gap-2 border-2 border-purple-600 p-6 text-purple-600 transition-all duration-300 hover:scale-105 hover:bg-purple-600 hover:text-white"
              >
                <Brain className="h-8 w-8" />
                <span className="text-lg font-semibold">المدرس الذكي</span>
                <span className="text-sm opacity-90">احصل على مساعدة فورية</span>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="flex h-auto transform flex-col gap-2 border-2 border-indigo-600 p-6 text-indigo-600 transition-all duration-300 hover:scale-105 hover:bg-indigo-600 hover:text-white"
              >
                <Trophy className="h-8 w-8" />
                <span className="text-lg font-semibold">التمارين</span>
                <span className="text-sm opacity-90">اختبر معلوماتك</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Courses Section */}
        <Card className="border-0 bg-white shadow-lg backdrop-blur-sm dark:bg-gray-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
              <BookOpen className="h-6 w-6 text-blue-600" />
              دوراتي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CoursesList items={coursesWithChaptersLength} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
