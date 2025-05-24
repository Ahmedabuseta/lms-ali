import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { Clock, File, FileQuestion } from 'lucide-react';

import { getExams } from '@/actions/get-exams';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getCourses } from '@/actions/get-courses';
import { ExamCard } from './_components/exam-card';
import { CourseCards } from './_components/course-cards';

interface PageProps {
  searchParams: {
    courseId?: string;
    chapterId?: string;
  };
}

export default async function ExamPage({ searchParams }: PageProps) {
  const { userId } = auth();

  if (!userId) {
    return redirect('/');
  }

  const result = await getExams({
    userId,
    courseId: searchParams.courseId,
    chapterId: searchParams.chapterId,
  });
  const exams = result?.exams ? result.exams : [];

  const courses = await getCourses({
    userId,
    ...searchParams,
  });

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div>
        <h1 className="text-right text-2xl font-bold text-slate-900 dark:text-slate-100">الامتحانات</h1>
        <p className="text-right text-sm text-slate-600 dark:text-slate-400">
          اختبر معلوماتك مع امتحانات المقررات بتاعتك
        </p>
      </div>

      <div className="space-y-6">
        {/* Course Filter Cards */}
        <div>
          <h2 className="mb-3 text-right text-lg font-medium text-slate-900 dark:text-slate-100">تصفية حسب الكورس</h2>
          <CourseCards courses={courses} currentCourseId={searchParams.courseId} />
        </div>

        <Separator className="bg-slate-200 dark:bg-slate-800" />

        {/* Exams Display */}
        <div className="space-y-4">
          {exams.length === 0 ? (
            <div className="flex h-60 w-full flex-col items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <FileQuestion className="h-6 w-6 text-slate-500 dark:text-slate-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">مفيش امتحانات</h3>
              <p className="mb-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                حالياً مفيش امتحانات متاحة للكورسات بتاعتك.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {exams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
