'use client';

import { BookOpen, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface QuickActionsSectionProps {
  data: {
    inProgressCourses?: Array<{ id: string; title: string; chapters: Array<{ id: string; title: string }> }>;
    availableExams?: Array<{ id: string; title: string; course: { title: string }; _count: { attempts: number } }>;
  };
  userRole: string;
}

export function QuickActionsSection({ data }: QuickActionsSectionProps) {
  return (
    <Card className="relative overflow-hidden border border-slate-200/50 bg-gradient-to-br from-slate-50/80 to-gray-50/60 backdrop-blur-sm dark:border-slate-700/30 dark:from-slate-800/50 dark:to-gray-800/30">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-slate-200">
          <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          متابعة التعلم
        </CardTitle>
      </CardHeader>
      <CardContent className="relative space-y-6">
        {/* Continue Learning */}
        {data.inProgressCourses && data.inProgressCourses.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">استكمل دوراتك</h3>
            <div className="space-y-3">
              {data.inProgressCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between rounded-lg border border-blue-200/30 bg-blue-50/50 p-3 dark:border-blue-800/30 dark:bg-blue-900/20">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{course.title}</p>
                    {course.chapters[0] && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">التالي: {course.chapters[0].title}</p>
                    )}
                  </div>
                  <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Link href={`/courses/${course.id}`}>
                      متابعة
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Exams */}
        {data.availableExams && data.availableExams.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">امتحانات متاحة</h3>
            <div className="space-y-3">
              {data.availableExams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between rounded-lg border border-emerald-200/30 bg-emerald-50/50 p-3 dark:border-emerald-800/30 dark:bg-emerald-900/20">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{exam.title}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{exam.course.title}</p>
                    {exam._count.attempts > 0 && (
                      <Badge variant="secondary" className="mt-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                        {exam._count.attempts} محاولة سابقة
                      </Badge>
                    )}
                  </div>
                  <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Link href={`/exam/${exam.id}`}>
                      ابدأ الامتحان
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid gap-3 md:grid-cols-2">
          <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4 border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-300">
            <Link href="/search">
              <BookOpen className="h-6 w-6" />
              <span>استكشف الدورات</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4 border-purple-200 bg-purple-50/50 hover:bg-purple-100/70 text-purple-700 dark:border-purple-800 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 dark:text-purple-300">
            <Link href="/flashcards">
              <Zap className="h-6 w-6" />
              <span>البطاقات التعليمية</span>
            </Link>
          </Button>
        </div>

        {/* Empty State */}
        {(!data.inProgressCourses || data.inProgressCourses.length === 0) && 
         (!data.availableExams || data.availableExams.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900/30 mb-4">
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
              ابدأ رحلتك التعليمية
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
              استكشف الدورات المتاحة وابدأ في تعلم مهارات جديدة أو اختبر معلوماتك من خلال الامتحانات
            </p>
            <div className="flex gap-3">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/search">
                  <BookOpen className="mr-2 h-4 w-4" />
                  استكشف الدورات
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/exam">
                  ابدأ امتحان
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 