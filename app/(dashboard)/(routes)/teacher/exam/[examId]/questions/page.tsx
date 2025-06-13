import { requireTeacher } from '@/lib/auth-helpers';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { QuestionsList } from './_components/questions-list';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: {
    examId: string;
  };
}

export default async function ExamQuestionsPage({ params }: PageProps) {
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
        },
      },
      examQuestions: {
        include: {
          question: {
            include: {
              options: true,
            },
          },
        },
        orderBy: {
          position: 'asc',
        },
      },
    },
  });

  if (!exam) {
    return redirect('/teacher/exam');
  }

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div className="w-full">
          <Link
            href={`/teacher/exam/${params.examId}`}
            className="mb-6 flex items-center text-sm transition hover:opacity-75 font-arabic"
          >
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة إلى تفاصيل الاختبار
          </Link>
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col gap-y-2">
              <h1 className="text-2xl font-bold font-arabic">أسئلة الاختبار</h1>
              <span className="text-sm text-slate-600 dark:text-slate-400 font-arabic">
                إدارة أسئلة الاختبار "{exam.title}"
              </span>
            </div>
            {!exam.isPublished && (
              <Link href={`/teacher/exam/${params.examId}/questions/create`}>
                <Button className="font-arabic">
                  <PlusCircle className="ml-2 h-4 w-4" />
                  إضافة سؤال
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <QuestionsList
          initialItems={exam.examQuestions}
          examId={params.examId}
        />
      </div>
    </div>
  );
}
