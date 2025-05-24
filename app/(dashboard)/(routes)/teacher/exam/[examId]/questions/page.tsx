import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuestionsList } from './_components/questions-list';

interface PageProps {
  params: {
    examId: string;
  };
}

export default async function QuestionsPage({ params }: PageProps) {
  const { userId } = auth();

  if (!userId) {
    return redirect('/');
  }

  const exam = await db.exam.findUnique({
    where: {
      id: params.examId,
    },
    include: {
      course: {
        select: {
          /*createdById: true,*/
          title: true,
        },
      },
      chapter: {
        select: {
          title: true,
        },
      },
      questions: {
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          id: true,
          text: true,
          type: true,
          options: {
            select: {
              id: true,
              text: true,
              isCorrect: true,
            },
          },
        },
      },
    },
  });

  if (!exam) {
    return redirect('/teacher/exam');
  }

  // Verify ownership
  /*if (exam.course.createdById !== userId) {
    return redirect('/teacher/exam')
  }*/

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/teacher/exam/${params.examId}`}
            className="mb-6 flex items-center text-sm transition hover:opacity-75"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to exam settings
          </Link>
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-bold">Exam Questions</h1>
            <div className="text-sm text-slate-600">
              <p>Course: {exam.course.title}</p>
              {exam.chapter && <p>Chapter: {exam.chapter.title}</p>}
              <p>Total Questions: {exam.questions.length}</p>
            </div>
          </div>
        </div>
        {!exam.isPublished && (
          <Link href={`/teacher/exam/${params.examId}/questions/create`}>
            <Button className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </Link>
        )}
      </div>
      <div className="mt-8">
        <QuestionsList examId={params.examId} questions={exam.questions} isLocked={exam.isPublished} />
      </div>
    </div>
  );
}
