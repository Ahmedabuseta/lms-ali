import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { BasicExamForm } from './_components/basic-exam-form';

interface PageProps {
  params: {
    examId: string;
  };
}

export default async function ExamBasicPage({ params }: PageProps) {
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
  /*if (exam.course.createdById !== userId) {
    return redirect('/teacher/exam')
  }*/

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
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="w-full">
          <Link
            href={`/teacher/exam/${params.examId}`}
            className="mb-6 flex items-center text-sm transition hover:opacity-75"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to exam
          </Link>
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col gap-y-2">
              <h1 className="text-2xl font-bold">Basic Settings</h1>
              <p className="text-sm text-slate-600">Edit your exam&apos;s general information</p>
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
