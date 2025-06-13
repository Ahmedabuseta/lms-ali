import { requireTeacher } from '@/lib/auth-helpers';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { QuestionForm } from '../_components/question-form';
import { db } from '@/lib/db';

interface PageProps { params: {
    examId: string; };
}

export default async function CreateQuestionPage({ params }: PageProps) { const user = await requireTeacher();

  const exam = await db.exam.findUnique({
    where: {
      id: params.examId, },
    include: { course: {
        select: {
          id: true,
          title: true, },
      },
    },
  });

  if (!exam) {
    return redirect('/teacher/exam');
  }

  // Don't allow adding questions to published exams
  if (exam.isPublished) {
    return redirect(`/teacher/exam/${params.examId}/questions`);
  }

  // Get the current highest position using ExamQuestion junction table
  const questionsCount = await db.examQuestion.count({
    where: {
      examId: params.examId,
    },
  });

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="w-full">
          <Link
            href={`/teacher/exam/${params.examId}/questions`}
            className="mb-6 flex items-center text-sm transition hover:opacity-75 font-arabic"
          >
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة إلى الأسئلة
          </Link>
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col gap-y-2">
              <h1 className="text-2xl font-bold font-arabic">إضافة سؤال جديد</h1>
              <span className="text-sm text-slate-600 dark:text-slate-400 font-arabic">
                إنشاء سؤال جديد للاختبار "{exam.title}"
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 max-w-4xl">
        <QuestionForm
          examId={params.examId}
          nextPosition={questionsCount + 1}
        />
      </div>
    </div>
  );
}
