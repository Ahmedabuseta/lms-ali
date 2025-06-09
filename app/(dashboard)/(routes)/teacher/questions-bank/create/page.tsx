import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { QuestionForm } from './_components/question-form';
import { db } from '@/lib/db';

interface PageProps {
  searchParams: {
    courseId?: string;
    chapterId?: string;
  };
}

const CreateQuestionPage = async ({ searchParams }: PageProps) => {
  const { userId } = auth();

  if (!userId) {
    return redirect('/');
  }

  // Fetch all courses owned by the teacher
  const courses = await db.course.findMany({
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      title: 'asc',
    },
  });

  if (courses.length === 0) {
    return redirect('/teacher/courses');
  }

  // Select the course from the URL or default to the first course
  const selectedCourseId = searchParams.courseId || courses[0].id;

  // Fetch chapters for the selected course
  const chapters = await db.chapter.findMany({
    where: {
      courseId: selectedCourseId,
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      position: 'asc',
    },
  });
  console.log(chapters);

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-y-2">
        <Link href="/teacher/questions-bank" className="mb-6 flex items-center text-sm transition hover:opacity-75">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Question Bank
        </Link>
        <h1 className="text-2xl font-bold">Create Practice Question</h1>
        <p className="text-sm text-slate-600">Add a new question to your practice question bank</p>
      </div>

      <QuestionForm
        courseId={selectedCourseId}
        chapterId={searchParams.chapterId}
        courses={courses}
        chapters={chapters}
      />
    </div>
  );
};

export default CreateQuestionPage;
