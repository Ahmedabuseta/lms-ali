import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import DataCard from './_components/data-card';
import Chart from './_components/chart';
import { getAnalytics } from '@/actions/get-analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconBadge } from '@/components/icon-badge';
import { db } from '@/lib/db';
import { BarChart3, Users, BookOpen, TrendingUp, DollarSign, FileQuestion, Eye, Clock } from 'lucide-react';

export default async function Analytics() {
  const { userId } = auth();

  if (!userId) {
    return redirect('/');
  }

  const { data, totalRevenue, totalSales } = await getAnalytics(userId);

  // Get additional analytics data
  const [totalCourses, publishedCourses, totalStudents, recentEnrollments] = await Promise.all([
    db.course.count(),
    db.course.count({
      where: {
        isPublished: true,
      },
    }),
    db.user.count({
      where: { role: 'STUDENT' },
    }),
    db.user.count({
      where: {
        role: 'STUDENT',
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    }),
  ]);

  return (
    <div className="min-h-screen space-y-8 bg-gradient-to-br from-background via-muted/30 to-background p-6">
      {/* Enhanced decorative elements for both themes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-10 top-20 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-primary/5 to-secondary/5 blur-3xl"></div>
        <div
          className="absolute bottom-1/4 left-20 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-accent/5 to-primary/5 blur-3xl"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute right-1/3 top-1/2 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-secondary/5 to-accent/5 blur-3xl"
          style={{ animationDelay: '4s' }}
        ></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <IconBadge icon={BarChart3} variant="info" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">التحليلات والإحصائيات</h1>
            <p className="text-muted-foreground">تابع أداء دوراتك ومبيعاتك بالتفصيل</p>
          </div>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DataCard
          label="إجمالي الإيرادات"
          value={totalRevenue}
          shouldFormat
          variant="success"
          icon={DollarSign}
          trend={{
            value: 12.5,
            isPositive: true,
          }}
        />
        <DataCard
          label="إجمالي المبيعات"
          value={totalSales}
          variant="info"
          icon={TrendingUp}
          trend={{
            value: 8.2,
            isPositive: true,
          }}
        />
        <DataCard label="الدورات المنشورة" value={publishedCourses} variant="warning" icon={BookOpen} />
        <DataCard
          label="إجمالي الطلاب"
          value={totalStudents}
          variant="default"
          icon={Users}
          trend={{
            value: recentEnrollments,
            isPositive: true,
          }}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="relative overflow-hidden border-l-4 border-l-purple-500 bg-card/60 backdrop-blur-sm dark:border-l-purple-400">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-indigo-500/5 dark:from-purple-400/10 dark:to-indigo-400/5" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">إجمالي الدورات</CardTitle>
            <IconBadge icon={BookOpen} variant="default" size="sm" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-foreground">{totalCourses}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {publishedCourses} منشورة من أصل {totalCourses}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-cyan-500 bg-card/60 backdrop-blur-sm dark:border-l-cyan-400">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/5 dark:from-cyan-400/10 dark:to-blue-400/5" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">متوسط السعر</CardTitle>
            <IconBadge icon={DollarSign} variant="info" size="sm" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-foreground">
              {totalSales > 0 ? `$${(totalRevenue / totalSales).toFixed(0)}` : '$0'}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">لكل عملية بيع</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-emerald-500 bg-card/60 backdrop-blur-sm dark:border-l-emerald-400">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-green-500/5 dark:from-emerald-400/10 dark:to-green-400/5" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">التسجيلات الحديثة</CardTitle>
            <IconBadge icon={Users} variant="success" size="sm" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-foreground">{recentEnrollments}</div>
            <p className="mt-1 text-xs text-muted-foreground">في آخر 30 يوم</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="relative z-10 overflow-hidden bg-card/60 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/5 via-transparent to-muted/10" />
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <IconBadge icon={BarChart3} variant="info" size="sm" />
            <div>
              <CardTitle className="text-xl font-semibold text-foreground">مخطط الإيرادات</CardTitle>
              <p className="text-sm text-muted-foreground">تطور الإيرادات عبر الدورات</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <Chart data={data} />
        </CardContent>
      </Card>

      {/* Performance Insights */}
      {data.length > 0 && (
        <Card className="relative z-10 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <IconBadge icon={TrendingUp} variant="warning" size="sm" />
              رؤى الأداء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">أفضل الدورات أداءً</h4>
                <div className="space-y-2">
                  {data
                    .sort((a, b) => b.total - a.total)
                    .slice(0, 3)
                    .map((course, index) => (
                      <div key={course.name} className="flex items-center justify-between rounded bg-muted/50 p-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-xs font-medium text-primary">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium text-foreground">{course.name}</span>
                        </div>
                        <span className="text-sm font-medium text-foreground">${course.total}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-foreground">إحصائيات سريعة</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded bg-muted/50 p-2">
                    <span className="text-sm text-muted-foreground">معدل النجاح</span>
                    <span className="text-sm font-medium text-foreground">
                      {publishedCourses > 0 ? Math.round((publishedCourses / totalCourses) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded bg-muted/50 p-2">
                    <span className="text-sm text-muted-foreground">متوسط الطلاب لكل دورة</span>
                    <span className="text-sm font-medium text-foreground">
                      {publishedCourses > 0 ? Math.round(totalStudents / publishedCourses) : 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded bg-muted/50 p-2">
                    <span className="text-sm text-muted-foreground">معدل الالتحاق الشهري</span>
                    <span className="text-sm font-medium text-foreground">{recentEnrollments}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
