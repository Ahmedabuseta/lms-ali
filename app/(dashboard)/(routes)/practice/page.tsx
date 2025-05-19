import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { PracticeClient } from './_components/practice-client';

const PracticePage = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect('/');
  }

  // Get all courses that the user has access to (purchased or created)
  const courses = await db.course.findMany({
    where: {
      OR: [
        {
          purchases: {
            some: {
              userId,
            },
          },
        },
        {
          //createdById: userId,
        },
      ],
      // Only include courses that have practice questions
      PracticeQuestion: {
        some: {},
      },
    },
    select: {
      id: true,
      title: true,
      chapters: {
        where: {
          isPublished: true,
          // Only include chapters that have practice questions
          PracticeQuestion: {
            some: {},
          },
        },
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
      title: 'asc',
    },
  });

  if (courses.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-60 text-center">
          <h2 className="text-2xl font-bold mb-2">No Practice Questions Available</h2>
          <p className="text-slate-600 mb-6">
            There are no practice questions available for your courses yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Practice Questions</h1>
        <p className="text-slate-600">
          Test your knowledge with practice questions from your courses
        </p>
      </div>

      <PracticeClient courses={courses} />
    </div>
  );
};

export default PracticePage;