'use client';

import { useState } from 'react';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Calendar,
  ChevronRight,
  Award,
  LineChart,
  BrainCircuit,
  BarChart,
  PieChart,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { showNotification } from '@/components/ui/notifications';

interface LearningInsightsProps {
  totalCourses: number;
  completedCourses: number;
  totalHours: number;
  studyStreak: number;
  recentActivity: {
    type: string;
    title: string;
    date: string;
    progress?: number;
  }[];
  recommendedCourses?: {
    id: string;
    title: string;
    category: string;
  }[];
}

export function LearningInsights({
  totalCourses,
  completedCourses,
  totalHours,
  studyStreak,
  recentActivity,
}: LearningInsightsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const overallProgress = Math.round((completedCourses / totalCourses) * 100) || 0;

  const handleNotification = () => {
    showNotification.achievement(
      'تم الوصول إلى إنجاز دراسي!',
      `لقد درست لمدة ${totalHours} ساعة. استمر في العمل الرائع!`,
      { duration: 8000 },
    );
  };

  return (
    <Card className="w-full overflow-hidden border-0 bg-gradient-to-br from-white via-blue-50 to-purple-50 shadow-2xl backdrop-blur-sm dark:from-gray-800 dark:via-blue-900/20 dark:to-purple-900/20">
      <CardHeader className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-4 text-white sm:p-6">
        <div className="relative z-10">
          <CardTitle className="flex items-center gap-2 text-xl font-bold sm:gap-3 sm:text-2xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm sm:h-10 sm:w-10">
              <BrainCircuit className="h-5 w-5 text-white sm:h-6 sm:w-6" />
            </div>
            رحلة التعلم الخاصة بك
          </CardTitle>
          <CardDescription className="text-base text-blue-100 sm:text-lg">
            تتبع تقدمك، وحافظ على حماسك، وحقق أهداف التعلم الخاصة بك
          </CardDescription>
        </div>

        {/* Floating Elements */}
        <div className="absolute right-2 top-2 h-6 w-6 animate-pulse rounded-full bg-white/10 sm:h-8 sm:w-8" />
        <div className="animation-delay-1000 absolute bottom-2 left-2 h-4 w-4 animate-pulse rounded-full bg-white/10 sm:h-6 sm:w-6" />
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b border-gray-200 bg-white/50 px-3 py-3 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50 sm:px-6 sm:py-4">
          <TabsList className="w-full justify-start border-0 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50">
            <TabsTrigger
              value="overview"
              className="text-xs font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white sm:text-sm"
            >
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="text-xs font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white sm:text-sm"
            >
              النشاط الأخير
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="text-xs font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white sm:text-sm"
            >
              تحليلات التعلم
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="m-0 p-0">
          <CardContent className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:gap-6 sm:p-6 lg:grid-cols-4">
            <div className="group flex transform flex-col gap-2 rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-indigo-100 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-blue-700/50 dark:from-blue-900/20 dark:to-indigo-900/20 sm:gap-3 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-300 sm:text-sm">تقدم الدورة</div>
                <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-2 py-1 text-xs font-bold text-white shadow-lg sm:px-3">
                  {overallProgress}%
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white sm:text-3xl">
                {completedCourses}/{totalCourses}
              </div>
              <Progress value={overallProgress} className="h-2 bg-gray-200 dark:bg-gray-700 sm:h-3" />
              <div className="absolute right-2 top-2 h-4 w-4 animate-pulse rounded-full bg-blue-500/20 sm:h-6 sm:w-6" />
            </div>

            <div className="group flex transform items-start gap-3 rounded-2xl border border-purple-200/50 bg-gradient-to-br from-purple-50 to-pink-100 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-purple-700/50 dark:from-purple-900/20 dark:to-pink-900/20 sm:gap-4 sm:p-6">
              <div className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 p-2 transition-transform duration-300 group-hover:scale-110 sm:p-3">
                <Clock className="h-5 w-5 text-white sm:h-6 sm:w-6" />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-300 sm:text-sm">إجمالي التعلم</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white sm:text-3xl">{totalHours} ساعة</div>
              </div>
            </div>

            <div className="group flex transform items-start gap-3 rounded-2xl border border-green-200/50 bg-gradient-to-br from-green-50 to-emerald-100 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-green-700/50 dark:from-green-900/20 dark:to-emerald-900/20 sm:gap-4 sm:p-6">
              <div className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 p-2 transition-transform duration-300 group-hover:scale-110 sm:p-3">
                <Calendar className="h-5 w-5 text-white sm:h-6 sm:w-6" />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-300 sm:text-sm">تتابع الدراسة</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white sm:text-3xl">{studyStreak} أيام</div>
              </div>
            </div>

            <div className="group flex transform items-start gap-3 rounded-2xl border border-orange-200/50 bg-gradient-to-br from-orange-50 to-red-100 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-orange-700/50 dark:from-orange-900/20 dark:to-red-900/20 sm:gap-4 sm:p-6">
              <div className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 p-2 transition-transform duration-300 group-hover:scale-110 sm:p-3">
                <Award className="h-5 w-5 text-white sm:h-6 sm:w-6" />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-300 sm:text-sm">الإنجازات</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white sm:text-3xl">3 جديد</div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t border-gray-200 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 px-4 py-3 dark:border-gray-700 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-indigo-900/10 sm:px-6 sm:py-4">
            <Button
              variant="outline"
              size="lg"
              className="mr-auto transform border-2 border-blue-600 text-xs text-blue-600 transition-all duration-300 hover:scale-105 hover:bg-blue-600 hover:text-white sm:text-sm"
              onClick={handleNotification}
            >
              <LineChart className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              عرض الإحصائيات التفصيلية
            </Button>
          </CardFooter>
        </TabsContent>

        <TabsContent value="activity" className="m-0 p-0">
          <CardContent className="space-y-3 p-4 sm:space-y-4 sm:p-6">
            <div className="mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-base font-bold text-transparent sm:mb-4 sm:text-lg">
              أنشطتك الأخيرة
            </div>
            {recentActivity.map((activity, i) => (
              <div
                key={i}
                className="group flex transform items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-blue-600 sm:gap-4 sm:p-4"
              >
                <div
                  className={`rounded-xl p-2 transition-transform duration-300 group-hover:scale-110 sm:p-3 ${
                    activity.type === 'course'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                      : activity.type === 'exam'
                        ? 'bg-gradient-to-r from-orange-500 to-red-500'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500'
                  }`}
                >
                  {activity.type === 'course' ? (
                    <BookOpen className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                  ) : activity.type === 'exam' ? (
                    <Clock className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-gray-800 dark:text-white sm:text-base">{activity.title}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">{activity.date}</div>
                  {activity.progress !== undefined && <Progress value={activity.progress} className="mt-2 h-1.5 sm:mt-3 sm:h-2" />}
                </div>
              </div>
            ))}
          </CardContent>

          <CardFooter className="border-t border-gray-200 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 px-4 py-3 dark:border-gray-700 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-indigo-900/10 sm:px-6 sm:py-4">
            <Button
              variant="outline"
              size="lg"
              className="mr-auto transform border-2 border-purple-600 text-purple-600 transition-all duration-300 hover:scale-105 hover:bg-purple-600 hover:text-white"
            >
              عرض جميع الأنشطة
              <ChevronRight className="mr-2 h-5 w-5 rotate-180 transform" />
            </Button>
          </CardFooter>
        </TabsContent>

        <TabsContent value="analytics" className="m-0 p-0">
          <CardContent className="space-y-8 p-6">
            <div className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-lg font-bold text-transparent">
              تحليلات التعلم
            </div>

            <div className="space-y-8">
              <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:from-indigo-900/20 dark:to-purple-900/20">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500">
                    <BarChart className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">توزيع الوقت حسب الموضوع</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'تطوير الويب', hours: 8, color: 'from-blue-500 to-cyan-500' },
                    { name: 'علوم البيانات', hours: 6, color: 'from-purple-500 to-pink-500' },
                    { name: 'الذكاء الاصطناعي', hours: 4, color: 'from-green-500 to-emerald-500' },
                    { name: 'التصميم', hours: 2, color: 'from-orange-500 to-red-500' },
                  ].map((subject, index) => (
                    <div key={index} className="group">
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{subject.name}</span>
                        <span className="text-gray-600 dark:text-gray-400">{subject.hours} ساعات</span>
                      </div>
                      <div className="relative">
                        <Progress value={(subject.hours / 8) * 100} className="h-3" />
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${subject.color} rounded-full transition-all duration-300 group-hover:shadow-lg`}
                          style={{ width: `${(subject.hours / 8) * 100}%` }}
                         />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:from-blue-900/20 dark:to-indigo-900/20">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500">
                    <PieChart className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">تفضيلات التعلم</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-white p-4 text-center shadow-sm transition-all duration-300 hover:shadow-md dark:bg-gray-800">
                    <div className="text-2xl font-bold text-blue-600">65%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">محتوى مرئي</div>
                  </div>
                  <div className="rounded-xl bg-white p-4 text-center shadow-sm transition-all duration-300 hover:shadow-md dark:bg-gray-800">
                    <div className="text-2xl font-bold text-purple-600">35%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">محتوى نصي</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t border-gray-200 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 px-6 py-4 dark:border-gray-700 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-indigo-900/10">
            <Button
              variant="outline"
              size="lg"
              className="mr-auto transform border-2 border-indigo-600 text-indigo-600 transition-all duration-300 hover:scale-105 hover:bg-indigo-600 hover:text-white"
            >
              <BarChart className="ml-2 h-5 w-5" />
              تحليل تفصيلي للأداء
            </Button>
          </CardFooter>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
