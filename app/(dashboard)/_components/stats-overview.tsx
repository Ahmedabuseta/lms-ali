'use client';

import { 
  BookOpen, 
  CheckCircle,
  FileQuestion, 
  Trophy,
  Target,
  Star,
  Award,
  Activity,
  GraduationCap,
  Brain
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface StatsOverviewProps {
  stats: {
    totalCourses?: number;
    totalStudents?: number;
    totalExams?: number;
    totalQuestions?: number;
    enrolledCourses?: number;
    completedCourses?: number;
    examAttempts?: number;
    averageScore?: number;
    recentActivity?: Array<{
      id: string;
      type: string;
      title: string;
      timestamp: Date;
      status?: string;
    }>;
  };
  userRole: string;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const studentStats = [
    {
      title: 'الدورات المسجل بها',
      value: stats.enrolledCourses || 0,
      icon: BookOpen,
      color: 'blue',
      bgGradient: 'from-blue-50/80 to-indigo-50/60',
      borderColor: 'border-0',
      iconBg: 'from-blue-500/20 to-indigo-500/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      textColor: 'text-blue-600 dark:text-blue-400',
      description: 'دورة نشطة',
      cardBg: 'bg-white/80 dark:bg-gray-800/80'
    },
    {
      title: 'الدورات المكتملة',
      value: stats.completedCourses || 0,
      icon: CheckCircle,
      color: 'emerald',
      bgGradient: 'from-emerald-50/80 to-teal-50/60',
      borderColor: 'border-0',
      iconBg: 'from-emerald-500/20 to-teal-500/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      description: 'دورة مكتملة',
      cardBg: 'bg-white/80 dark:bg-gray-800/80'
    },
    {
      title: 'محاولات الامتحان',
      value: stats.examAttempts || 0,
      icon: FileQuestion,
      color: 'purple',
      bgGradient: 'from-purple-50/80 to-pink-50/60',
      borderColor: 'border-0',
      iconBg: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      textColor: 'text-purple-600 dark:text-purple-400',
      description: 'محاولة امتحان',
      cardBg: 'bg-white/80 dark:bg-gray-800/80'
    },
    {
      title: 'متوسط الدرجات',
      value: `${stats.averageScore || 0}%`,
      icon: Trophy,
      color: 'orange',
      bgGradient: 'from-orange-50/80 to-amber-50/60',
      borderColor: 'border-0',
      iconBg: 'from-orange-500/20 to-amber-500/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
      textColor: 'text-orange-600 dark:text-orange-400',
      description: 'معدل الأداء',
      cardBg: 'bg-white/80 dark:bg-gray-800/80'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 sm:gap-6">
      {studentStats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={index}
            className={`group relative overflow-hidden ${stat.borderColor} ${stat.cardBg} backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-${stat.color}-500/10`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient}`} />
            <CardContent className="relative p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-2xl font-bold ${stat.textColor} transition-colors sm:text-3xl`}>
                      {stat.value}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    {stat.description}
                  </p>
                </div>
                <div className={`rounded-lg bg-gradient-to-br ${stat.iconBg} p-3 transition-all duration-300 group-hover:scale-110`}>
                  <Icon className={`h-5 w-5 ${stat.iconColor} sm:h-6 sm:w-6`} />
                </div>
              </div>
              
              {/* Progress indicator for average score */}
              {stat.title === 'متوسط الدرجات' && (
                <div className="mt-4">
                  <Progress 
                    value={stats.averageScore || 0} 
                    className="h-2 bg-slate-200/50 dark:bg-slate-700/50"
                  />
                  <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}
              
              {/* Completion rate for enrolled courses */}
              {stat.title === 'الدورات المسجل بها' && stats.enrolledCourses && stats.completedCourses && stats.enrolledCourses > 0 && (
                <div className="mt-4">
                  <Progress 
                    value={(stats.completedCourses / stats.enrolledCourses) * 100} 
                    className="h-2 bg-slate-200/50 dark:bg-slate-700/50"
                  />
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    معدل الإكمال: {Math.round((stats.completedCourses / stats.enrolledCourses) * 100)}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 