import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CourseWithQuestionsCount } from './types';
import { QuestionsEmptyState } from './_components/questions-empty-state';
import { CourseQuestionsList } from './_components/course-questions-list';

const QuestionsPage = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect('/');
  }

  const courses = await db.course.findMany({
    include: {
      chapters: {
        select: {
          id: true,
          title: true,
          _count: {
            select: {
              PracticeQuestion: true,
            },
          },
        },
        orderBy: {
          position: 'asc',
        },
      },
      _count: {
        select: {
          PracticeQuestion: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const coursesWithQuestions: CourseWithQuestionsCount[] = courses.map((course) => ({
    id: course.id,
    title: course.title,
    chapters: course.chapters,
    questionCount: course._count.PracticeQuestion,
  }));

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Question Bank</h1>
        <Button asChild>
          <Link href="/teacher/questions-bank/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Link>
        </Button>
      </div>

      {coursesWithQuestions.length === 0 ? (
        <QuestionsEmptyState />
      ) : (
        <div className="space-y-6">
          {coursesWithQuestions.map((course) => (
            <CourseQuestionsList key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionsPage;
