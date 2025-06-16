'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock,
  BookOpen,
  Target,
  Brain,
  Timer,
  CheckCircle2,
  Eye,
  ArrowLeft,
  TrendingUp,
  Award,
  Zap } from 'lucide-react';
import { PracticeChapterSelection } from './practice-chapter-selection';
import { cn } from '@/lib/utils';

interface Chapter {
  id: string;
  title: string;
  description: string | null;
  position: number;
  totalQuestions: number;
  practiceCount: number;
  uniqueQuestionsAttempted: number;
  correctAttempts: number;
  averageScore: number;
  totalPointsEarned: number;
  timeSpent: number; // in minutes
  completionPercentage: number;
  hasPractice: boolean;
}

interface CourseStats {
  totalChapters: number;
  totalQuestions: number;
  practicedChapters: number;
  totalAttempts: number;
  averageScore: number;
  totalPointsEarned: number;
  uniqueQuestionsAttempted: number;
  totalTimeSpent: number; // in minutes
  averageTimePerQuestion: number; // in minutes
  totalPracticeSessions: number;
  recentAttempts: number; // last 7 days
  monthlyAttempts: number; // last 30 days
  currentStreak: number; // consecutive days
  lastPracticeDate: Date | null;
}

type PracticeMode = 'selection' | 'exam' | 'free';

interface PracticeModeSelectionProps { courseId: string;
  chapters: Chapter[];
  courseStats: CourseStats; }

export const PracticeModeSelection = ({ courseId,
  chapters,
  courseStats }: PracticeModeSelectionProps) => { const [selectedMode, setSelectedMode] = useState<PracticeMode>('selection');

  if (selectedMode === 'exam') {
    return (
      <div className="space-y-6 animate-fade-in">
        <Button
          variant="outline"
          onClick={() => setSelectedMode('selection')}
          className="mb-4 font-arabic group hover:bg-primary hover:text-primary-foreground transition-all duration-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          العودة لاختيار النوع
        </Button>
        <PracticeChapterSelection
          courseId={courseId}
          chapters={chapters}
          mode="exam"
        />
      </div>
    );
  }

  if (selectedMode === 'free') {
    return (
      <div className="space-y-6 animate-fade-in">
        <Button
          variant="outline"
          onClick={() => setSelectedMode('selection')}
          className="mb-4 font-arabic group hover:bg-primary hover:text-primary-foreground transition-all duration-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          العودة لاختيار النوع
        </Button>
        <PracticeChapterSelection
          courseId={courseId}
          chapters={chapters}
          mode="free"
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in" dir="rtl">
      <div className="text-center mb-12 space-y-4">
        <div className="relative">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent font-arabic-heading">
            اختر نوع التدريب
          </h2>
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-50"></div>
        </div>
        <p className="text-muted-foreground text-lg font-arabic max-w-2xl mx-auto">
          نوفر لك نوعين من التدريب المتميزين حسب احتياجاتك التعليمية
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Exam Practice Mode */}
        <Card className={cn(
          "group cursor-pointer transition-all duration-300 hover:shadow-2xl",
          "border-2 hover:border-blue-500/50 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-indigo-50/50",
          "dark:hover:from-blue-950/20 dark:hover:to-indigo-950/20",
          "hover:-translate-y-2 hover:scale-[1.02]",
          "relative overflow-hidden bg-gradient-to-br from-background to-blue-50/30 dark:to-blue-950/10"
        )}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <CardHeader className="text-center pb-6 relative z-10">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <Timer className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl text-blue-900 dark:text-blue-100 font-arabic-heading group-hover:text-blue-700 dark:group-hover:text-blue-200 transition-colors">
              تدريب امتحاني
            </CardTitle>
            <CardDescription className="text-muted-foreground font-arabic text-base">
              محاكاة امتحان حقيقي مع تقييم شامل وتوقيت دقيق
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 relative z-10">
            <div className="grid gap-4">
              {[
                { icon: Clock, text: "مدة الامتحان: 45 دقيقة", color: "text-orange-600" },
                { icon: Target, text: "عدد الأسئلة: 20 سؤال", color: "text-blue-600" },
                { icon: CheckCircle2, text: "تتبع الدرجات والتقدم", color: "text-green-600" },
                { icon: BookOpen, text: "واجهة امتحان رسمية", color: "text-purple-600" }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 text-sm font-arabic p-3 rounded-lg bg-white/60 dark:bg-card/60 border border-border/50 transition-all duration-200 hover:bg-white dark:hover:bg-card hover:shadow-sm"
                >
                  <item.icon className={cn("h-5 w-5", item.color)} />
                  <span className="text-foreground">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 space-y-3">
              <Button
                onClick={() => setSelectedMode('exam')}
                className={cn(
                  "w-full h-12 text-lg font-arabic-heading",
                  "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
                  "shadow-lg hover:shadow-xl transition-all duration-300",
                  "group-hover:scale-105"
                )}
                size="lg"
              >
                <Zap className="mr-2 h-5 w-5" />
                بدء التدريب الامتحاني
              </Button>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-arabic">
                <Award className="h-3 w-3" />
                <span>تقييم شامل للأداء</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Free Practice Mode */}
        <Card className={cn(
          "group cursor-pointer transition-all duration-300 hover:shadow-2xl",
          "border-2 hover:border-green-500/50 hover:bg-gradient-to-br hover:from-green-50/50 hover:to-emerald-50/50",
          "dark:hover:from-green-950/20 dark:hover:to-emerald-950/20",
          "hover:-translate-y-2 hover:scale-[1.02]",
          "relative overflow-hidden bg-gradient-to-br from-background to-green-50/30 dark:to-green-950/10"
        )}>
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <CardHeader className="text-center pb-6 relative z-10">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <Brain className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl text-green-900 dark:text-green-100 font-arabic-heading group-hover:text-green-700 dark:group-hover:text-green-200 transition-colors">
              تدريب حر
            </CardTitle>
            <CardDescription className="text-muted-foreground font-arabic text-base">
              دراسة مرنة للأسئلة والأجوبة دون ضغط الوقت
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 relative z-10">
            <div className="grid gap-4">
              {[
                { icon: Eye, text: "عرض الإجابات عند الطلب", color: "text-blue-600" },
                { icon: Timer, text: "لا توجد قيود زمنية", color: "text-green-600" },
                { icon: BookOpen, text: "تنقل حر بين الأسئلة", color: "text-purple-600" },
                { icon: Brain, text: "مناسب للمراجعة والدراسة", color: "text-orange-600" }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 text-sm font-arabic p-3 rounded-lg bg-white/60 dark:bg-card/60 border border-border/50 transition-all duration-200 hover:bg-white dark:hover:bg-card hover:shadow-sm"
                >
                  <item.icon className={cn("h-5 w-5", item.color)} />
                  <span className="text-foreground">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 space-y-3">
              <Button
                onClick={() => setSelectedMode('free')}
                className={cn(
                  "w-full h-12 text-lg font-arabic-heading",
                  "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
                  "shadow-lg hover:shadow-xl transition-all duration-300",
                  "group-hover:scale-105"
                )}
                size="lg"
              >
                <Brain className="mr-2 h-5 w-5" />
                بدء التدريب الحر
              </Button>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-arabic">
                <BookOpen className="h-3 w-3" />
                <span>تعلم بالسرعة التي تناسبك</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Stats Summary */}
      <Card className="bg-gradient-to-r from-background to-blue-50/50 dark:to-blue-950/20 border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-arabic-heading flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            إحصائيات الدورة التفصيلية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { value: courseStats.totalChapters, label: "فصل متاح", color: "from-blue-500 to-blue-600", icon: BookOpen },
              { value: courseStats.totalQuestions, label: "سؤال متاح", color: "from-green-500 to-green-600", icon: Target },
              { value: courseStats.uniqueQuestionsAttempted, label: "سؤال تم حله", color: "from-purple-500 to-purple-600", icon: CheckCircle2 },
              { value: `${courseStats.averageScore}%`, label: "متوسط الدقة", color: "from-indigo-500 to-indigo-600", icon: Award },
              { value: `${Math.floor(courseStats.totalTimeSpent / 60)}س ${courseStats.totalTimeSpent % 60}د`, label: "الوقت المستغرق", color: "from-orange-500 to-orange-600", icon: Clock },
              { value: courseStats.currentStreak, label: "أيام متتالية", color: "from-red-500 to-red-600", icon: TrendingUp },
              { value: courseStats.totalPracticeSessions, label: "جلسة تدريب", color: "from-emerald-500 to-emerald-600", icon: Zap },
              { value: courseStats.totalPointsEarned, label: "نقطة مكتسبة", color: "from-pink-500 to-pink-600", icon: Award }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-3">
                  <div className={cn(
                    "w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r shadow-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl",
                    stat.color
                  )}>
                    <stat.icon className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent font-arabic-heading">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-arabic mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Time Analytics */}
        <Card className="bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200/50 dark:border-orange-800/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-arabic-heading flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              تحليل الوقت المستغرق
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/60 dark:bg-card/60 rounded-lg border border-border/50">
                <div className="text-2xl font-bold text-orange-600 font-arabic-heading">
                  {courseStats.averageTimePerQuestion.toFixed(1)}د
                </div>
                <div className="text-sm text-muted-foreground font-arabic">متوسط الوقت لكل سؤال</div>
              </div>
              <div className="text-center p-4 bg-white/60 dark:bg-card/60 rounded-lg border border-border/50">
                <div className="text-2xl font-bold text-red-600 font-arabic-heading">
                  {courseStats.totalPracticeSessions}
                </div>
                <div className="text-sm text-muted-foreground font-arabic">إجمالي جلسات التدريب</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-card/60 rounded-lg border border-border/50">
                <span className="text-sm font-arabic text-muted-foreground">الوقت الإجمالي</span>
                <span className="font-bold text-orange-600 font-arabic-heading">
                  {Math.floor(courseStats.totalTimeSpent / 60)} ساعة {courseStats.totalTimeSpent % 60} دقيقة
                </span>
              </div>
              
              {courseStats.lastPracticeDate && (
                <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-card/60 rounded-lg border border-border/50">
                  <span className="text-sm font-arabic text-muted-foreground">آخر جلسة تدريب</span>
                  <span className="font-bold text-red-600 font-arabic-heading">
                    {new Date(courseStats.lastPracticeDate).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Analytics */}
        <Card className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50 dark:border-green-800/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-arabic-heading flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              تحليل الأداء والتقدم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/60 dark:bg-card/60 rounded-lg border border-border/50">
                <div className="text-2xl font-bold text-green-600 font-arabic-heading">
                  {courseStats.recentAttempts}
                </div>
                <div className="text-sm text-muted-foreground font-arabic">محاولات الأسبوع الماضي</div>
              </div>
              <div className="text-center p-4 bg-white/60 dark:bg-card/60 rounded-lg border border-border/50">
                <div className="text-2xl font-bold text-emerald-600 font-arabic-heading">
                  {courseStats.monthlyAttempts}
                </div>
                <div className="text-sm text-muted-foreground font-arabic">محاولات الشهر الماضي</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-card/60 rounded-lg border border-border/50">
                <span className="text-sm font-arabic text-muted-foreground">السلسلة الحالية</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-green-600 font-arabic-heading">
                    {courseStats.currentStreak} يوم
                  </span>
                  {courseStats.currentStreak > 0 && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-card/60 rounded-lg border border-border/50">
                <span className="text-sm font-arabic text-muted-foreground">معدل التقدم</span>
                <span className="font-bold text-emerald-600 font-arabic-heading">
                  {courseStats.totalQuestions > 0 
                    ? Math.round((courseStats.uniqueQuestionsAttempted / courseStats.totalQuestions) * 100)
                    : 0}%
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-card/60 rounded-lg border border-border/50">
                <span className="text-sm font-arabic text-muted-foreground">متوسط النقاط لكل سؤال</span>
                <span className="font-bold text-green-600 font-arabic-heading">
                  {courseStats.totalAttempts > 0 
                    ? (courseStats.totalPointsEarned / courseStats.totalAttempts).toFixed(1)
                    : 0} نقطة
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
