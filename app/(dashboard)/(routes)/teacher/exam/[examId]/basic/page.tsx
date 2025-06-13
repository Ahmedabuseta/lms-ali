import { requireTeacher } from '@/lib/auth-helpers';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BasicExamForm } from './_components/basic-exam-form';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: {
    examId: string;
  };
}

export default async function ExamBasicPage({ params }: PageProps) {
  const user = await requireTeacher();

  const exam = await db.exam.findUnique({
    where: {
      id: params.examId,
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          /* createdById: true, */
        },
      },
      chapter: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (!exam) {
    return redirect('/teacher/exam');
  }

  // Verify ownership
  /* if (exam.course.createdById !== userId) {
    return redirect('/teacher/exam')
  } */

  // Get course chapters for the chapter selection dropdown
  const chapters = await db.chapter.findMany({
    where: {
      courseId: exam.courseId,
      isPublished: true,
    },
    orderBy: {
      position: 'asc',
    },
  });

  const initialData = {
    title: exam.title,
    description: exam.description || '',
    chapterId: exam.chapterId || '',
    timeLimit: exam.timeLimit || undefined,
  };

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="w-full">
          <Link
            href={`/teacher/exam/${params.examId}`}
            className="mb-6 flex items-center text-sm transition hover:opacity-75 font-arabic"
          >
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة إلى الاختبار
          </Link>
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col gap-y-2">
              <h1 className="text-2xl font-bold font-arabic">الإعدادات الأساسية</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-arabic">تحرير المعلومات العامة للاختبار</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <BasicExamForm initialData={initialData} examId={params.examId} courseId={exam.courseId} chapters={chapters} />
      </div>
    </div>
  );
}
