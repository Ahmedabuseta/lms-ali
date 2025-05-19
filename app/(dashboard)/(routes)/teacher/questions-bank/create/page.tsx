import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ArrowLeft } from 'lucide-react';
import { QuestionForm } from './_components/question-form';

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
    where: {
      //createdById: userId,
    },
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
  console.log(chapters)

  return (
    <div className="p-6">
      <div className="flex flex-col gap-y-2 mb-6">
        <Link
          href="/teacher/questions-bank"
          className="flex items-center text-sm hover:opacity-75 transition mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Question Bank
        </Link>
        <h1 className="text-2xl font-bold">Create Practice Question</h1>
        <p className="text-sm text-slate-600">
          Add a new question to your practice question bank
        </p>
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