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
  Eye } from 'lucide-react';
import { PracticeChapterSelection } from './practice-chapter-selection';

interface Chapter { id: string;
  title: string;
  description: string | null;
  position: number;
  totalQuestions: number;
  practiceCount: number;
  averageScore: number;
  hasPractice: boolean; }

interface CourseStats { totalChapters: number;
  totalQuestions: number;
  practicedChapters: number;
  totalAttempts: number;
  averageScore: number; }

interface PracticeModeSelectionProps { courseId: string;
  chapters: Chapter[];
  courseStats: CourseStats; }

type PracticeMode = 'selection' | 'exam' | 'free';

export const PracticeModeSelection = ({ courseId,
  chapters,
  courseStats }: PracticeModeSelectionProps) => { const [selectedMode, setSelectedMode] = useState<PracticeMode>('selection');

  if (selectedMode === 'exam') {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => setSelectedMode('selection') }
          className="mb-4"
        >
          ← العودة لاختيار النوع
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
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => setSelectedMode('selection')}
          className="mb-4"
        >
          ← العودة لاختيار النوع
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">اختر نوع التدريب</h2>
        <p className="text-gray-600">نوفر لك نوعين من التدريب حسب احتياجاتك</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Exam Practice Mode */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Timer className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl text-blue-900">تدريب امتحاني</CardTitle>
            <CardDescription className="text-gray-600">
              محاكاة امتحان حقيقي مع تقييم وتوقيت
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>مدة الامتحان: 45 دقيقة</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-gray-500" />
                <span>عدد الأسئلة: 20 سؤال</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-gray-500" />
                <span>تتبع الدرجات والتقدم</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-gray-500" />
                <span>واجهة امتحان رسمية</span>
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={() => setSelectedMode('exam')}
                className="w-full"
                size="lg"
              >
                بدء التدريب الامتحاني
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Free Practice Mode */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-green-500">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-xl text-green-900">تدريب حر</CardTitle>
            <CardDescription className="text-gray-600">
              دراسة الأسئلة والأجوبة دون ضغط الوقت
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Eye className="h-4 w-4 text-gray-500" />
                <span>عرض الإجابات عند الطلب</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Timer className="h-4 w-4 text-gray-500" />
                <span>لا توجد قيود زمنية</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-gray-500" />
                <span>تنقل حر بين الأسئلة</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Brain className="h-4 w-4 text-gray-500" />
                <span>مناسب للمراجعة والدراسة</span>
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={() => setSelectedMode('free')}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                بدء التدريب الحر
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5" />
          إحصائيات الدورة
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{courseStats.totalChapters}</div>
            <div className="text-sm text-gray-600">فصل متاح</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {courseStats.totalQuestions}
            </div>
            <div className="text-sm text-gray-600">سؤال متاح</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {courseStats.practicedChapters}
            </div>
            <div className="text-sm text-gray-600">فصل تم التدرب عليه</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {courseStats.totalAttempts}
            </div>
            <div className="text-sm text-gray-600">محاولة سابقة</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {Math.round(courseStats.averageScore)}%
            </div>
            <div className="text-sm text-gray-600">متوسط الدرجات</div>
          </div>
        </div>
      </div>
    </div>
  );
};
