import { requireTeacher } from '@/lib/auth-helpers';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { QuestionForm } from '../../_components/question-form';
import { db } from '@/lib/db';

interface PageProps {
  params: {
    examId: string;
    questionId: string;
  };
}

export default async function EditQuestionPage({ params }: PageProps) {
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
    },
  });

  if (!exam) {
    return redirect('/teacher/exam');
  }

  // Don't allow editing questions in published exams
  if (exam.isPublished) {
    return redirect(`/teacher/exam/${params.examId}/questions`);
  }

  const question = await db.question.findUnique({
    where: {
      id: params.questionId,
      examQuestions: {
        some: {
          examId: params.examId,
        },
      },
    },
    include: {
      options: {
        orderBy: {
          id: 'asc',
        },
      },
    },
  });

  if (!question) {
    return redirect(`/teacher/exam/${params.examId}/questions`);
  }

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
              <h1 className="text-2xl font-bold font-arabic">تحرير السؤال</h1>
              <span className="text-sm text-slate-600 dark:text-slate-400 font-arabic">
                تحرير سؤال في الاختبار "{exam.title}"
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 max-w-4xl">
        <QuestionForm
          initialData={{
            id: question.id,
            text: question.text,
            type: question.type as 'MULTIPLE_CHOICE' | 'TRUE_FALSE',
            options: question.options.map(option => ({
              id: option.id,
              text: option.text,
              isCorrect: option.isCorrect,
            })),
          }}
          examId={params.examId}
        />
      </div>
    </div>
  );
}
