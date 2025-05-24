import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { IconBadge } from '@/components/icon-badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart, Clock, LayoutDashboard, ListChecks, Settings, FileQuestion, Eye } from 'lucide-react';

import { ExamActions } from './_components/exam-actions';
import { Badge } from '@/components/ui/badge';
import { Banner } from '@/components/banner';
import { Separator } from '@/components/ui/separator';

interface PageProps {
  params: {
    examId: string;
  };
}

export default async function ExamDetailPage({ params }: PageProps) {
  const { userId } = auth();

  if (!userId) {
    return redirect('/');
  }

  const exam = await db.exam.findUnique({
    where: {
      id: params.examId,
    },
    include: {
      course: true,
      chapter: true,
      _count: {
        select: { questions: true },
      },
    },
  });

  if (!exam) {
    return redirect('/teacher/exam');
  }

  // Get count of past attempts for this exam
  const attemptCount = await db.examAttempt.count({
    where: {
      examId: params.examId,
      completedAt: {
        not: null,
      },
    },
  });

  const requiredFields = [exam.title, exam._count.questions > 0];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `${completedFields}/${totalFields}`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!exam.isPublished && (
        <Banner variant="warning" label="This exam is unpublished. It will not be visible to students." />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col gap-y-2">
                <Link href="/teacher/exam" className="mb-6 flex items-center text-sm transition hover:opacity-75">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to exams
                </Link>
                <div className="flex items-center gap-x-2">
                  <h1 className="text-2xl font-bold">{exam.title}</h1>
                  <Badge variant={exam.isPublished ? 'default' : 'outline'}>
                    {exam.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500">
                  {exam.course.title}
                  {exam.chapter && ` • ${exam.chapter.title}`}
                </p>
              </div>
              <ExamActions examId={params.examId} isPublished={exam.isPublished} disabled={!isComplete} />
            </div>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize your exam</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Link href={`/teacher/exam/${exam.id}/basic`}>
                <div className="flex h-full flex-col rounded-md border bg-slate-50 p-4 transition hover:border-sky-500">
                  <div className="mb-2 flex items-center gap-x-2">
                    <Settings className="h-5 w-5 text-slate-500" />
                    <h3 className="font-medium">Basic settings</h3>
                  </div>
                  <p className="text-xs text-slate-500">Edit the title, description, and time limit for the exam.</p>
                </div>
              </Link>
              <Link href={`/teacher/exam/${exam.id}/questions`}>
                <div className="flex h-full flex-col rounded-md border bg-slate-50 p-4 transition hover:border-sky-500">
                  <div className="mb-2 flex items-center gap-x-2">
                    <ListChecks className="h-5 w-5 text-slate-500" />
                    <h3 className="font-medium">Questions</h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Add and edit questions for this exam. {exam._count.questions} question
                    {exam._count.questions !== 1 ? 's' : ''} so far.
                  </p>
                </div>
              </Link>
              <Link href={`/teacher/exam/${exam.id}/statistics`}>
                <div className="flex h-full flex-col rounded-md border bg-slate-50 p-4 transition hover:border-sky-500">
                  <div className="mb-2 flex items-center gap-x-2">
                    <BarChart className="h-5 w-5 text-slate-500" />
                    <h3 className="font-medium">Statistics</h3>
                    {attemptCount > 0 && (
                      <Badge className="ml-auto" variant="secondary">
                        {attemptCount}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">View performance analytics and student results.</p>
                </div>
              </Link>
            </div>
          </div>
          <div>
            <div className="mb-4 flex items-center gap-x-2">
              <IconBadge icon={FileQuestion} />
              <h2 className="text-xl">Exam Status</h2>
            </div>
            <div className="rounded-md border bg-slate-50">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Completion</p>
                  <div className="text-sm text-slate-500">{completionText}</div>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full ${isComplete ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${(completedFields / totalFields) * 100}%` }}
                  />
                </div>
              </div>
              <Separator />
              <div className="space-y-4 p-4">
                <div className="flex items-center gap-x-2">
                  <div className="rounded-full border border-green-500 p-0.5">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  </div>
                  <div className="text-sm font-medium">Title {exam.title ? '✓' : '✗'}</div>
                </div>
                <div className="flex items-center gap-x-2">
                  <div
                    className={`rounded-full border p-0.5 ${
                      exam._count.questions > 0 ? 'border-green-500' : 'border-slate-200'
                    }`}
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${exam._count.questions > 0 ? 'bg-green-500' : 'bg-slate-200'}`}
                    />
                  </div>
                  <div className={`text-sm font-medium ${exam._count.questions > 0 ? '' : 'text-slate-500'}`}>
                    Questions {exam._count.questions > 0 ? '✓' : '✗'}
                  </div>
                </div>
              </div>
              <Separator />
              <div className="p-4">
                <div className="flex items-center gap-4">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!isComplete || !exam.isPublished}
                    className="w-full"
                    asChild
                  >
                    <Link href={`/exam/${exam.id}`} target="_blank">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-6 rounded-md border border-sky-100 bg-sky-50 p-4">
              <div className="flex items-center gap-x-2">
                <div className="rounded-full bg-sky-200 p-2">
                  <Clock className="h-4 w-4 text-sky-700" />
                </div>
                <h3 className="font-semibold text-sky-700">Time Limit</h3>
              </div>
              <p className="mt-2 text-sm text-sky-700">
                {exam.timeLimit
                  ? `This exam has a time limit of ${exam.timeLimit} minute${exam.timeLimit !== 1 ? 's' : ''}.`
                  : 'This exam has no time limit.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
