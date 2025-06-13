'use client';

import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  FileQuestion, 
  Activity,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RecentActivityProps {
  activities: Array<{
    type: string;
    title: string;
    date: Date;
    completed?: boolean;
  }>;
  userRole: string;
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string, completed?: boolean) => {
    switch (type) {
      case 'course':
        return <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'exam':
        return <FileQuestion className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'completion':
        return <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'progress':
        return completed 
          ? <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          : <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      default:
        return <Activity className="h-4 w-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  const getActivityColor = (type: string, completed?: boolean) => {
    switch (type) {
      case 'course':
        return 'bg-blue-50/80 border-blue-200/50 dark:bg-blue-900/20 dark:border-blue-800/30';
      case 'exam':
        return 'bg-emerald-50/80 border-emerald-200/50 dark:bg-emerald-900/20 dark:border-emerald-800/30';
      case 'completion':
        return 'bg-emerald-50/80 border-emerald-200/50 dark:bg-emerald-900/20 dark:border-emerald-800/30';
      case 'progress':
        return completed 
          ? 'bg-emerald-50/80 border-emerald-200/50 dark:bg-emerald-900/20 dark:border-emerald-800/30'
          : 'bg-orange-50/80 border-orange-200/50 dark:bg-orange-900/20 dark:border-orange-800/30';
      default:
        return 'bg-slate-50/80 border-slate-200/50 dark:bg-slate-900/20 dark:border-slate-800/30';
    }
  };

  const getActivityLabel = (type: string, completed?: boolean) => {
    switch (type) {
      case 'course':
        return 'دورة';
      case 'exam':
        return 'امتحان';
      case 'completion':
        return 'مكتمل';
      case 'progress':
        return completed ? 'مكتمل' : 'قيد التقدم';
      default:
        return 'نشاط';
    }
  };

  return (
    <Card className="relative overflow-hidden border border-slate-200/50 bg-gradient-to-br from-slate-50/80 to-gray-50/60 backdrop-blur-sm dark:border-slate-700/30 dark:from-slate-800/50 dark:to-gray-800/30">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-slate-200">
          <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          النشاط الأخير
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <ScrollArea className="h-[400px] pr-4">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Activity className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">لا توجد أنشطة حديثة</p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                ابدأ بالتسجيل في دورة جديدة أو خوض امتحان
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 rounded-lg border p-3 transition-all duration-200 hover:shadow-sm ${getActivityColor(activity.type, activity.completed)}`}
                >
                  <div className="flex-shrink-0 rounded-full bg-white/80 dark:bg-slate-800/80 p-2 shadow-sm">
                    {getActivityIcon(activity.type, activity.completed)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-slate-800 dark:text-slate-200 leading-tight">
                          {activity.title}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {formatDistanceToNow(new Date(activity.date), {
                            addSuffix: true,
                            locale: ar,
                          })}
                        </p>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="flex-shrink-0 text-xs bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                      >
                        {getActivityLabel(activity.type, activity.completed)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 