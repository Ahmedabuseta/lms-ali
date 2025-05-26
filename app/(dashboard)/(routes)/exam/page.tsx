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
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6" dir="rtl">
      <div>
        <h1 className="text-right text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">الامتحانات</h1>
        <p className="text-right text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
          اختبر معلوماتك مع امتحانات المقررات بتاعتك
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Course Filter Cards */}
        <div>
          <h2 className="mb-2 text-right text-base font-medium text-slate-900 dark:text-slate-100 sm:mb-3 sm:text-lg">تصفية حسب الكورس</h2>
          <CourseCards courses={courses} currentCourseId={searchParams.courseId} />
        </div>

        <Separator className="bg-slate-200 dark:bg-slate-800" />

        {/* Exams Display */}
        <div className="space-y-3 sm:space-y-4">
          {exams.length === 0 ? (
            <div className="flex h-48 w-full flex-col items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/50 sm:h-60 sm:p-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 sm:h-12 sm:w-12">
                <FileQuestion className="h-5 w-5 text-slate-500 dark:text-slate-400 sm:h-6 sm:w-6" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100 sm:mt-4 sm:text-lg">مفيش امتحانات</h3>
              <p className="mb-3 mt-2 text-xs text-slate-500 dark:text-slate-400 sm:mb-4 sm:text-sm">
                حالياً مفيش امتحانات متاحة للكورسات بتاعتك.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
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
