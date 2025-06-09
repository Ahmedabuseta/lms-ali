import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { PracticeClient } from './_components/practice-client';
import { db } from '@/lib/db';

const PracticePage = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect('/');
  }

  // Get all courses that the user has access to (purchased or created)
  const courses = await db.course.findMany({
    where: {
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
  console.log(courses);
  if (courses.length === 0) {
    return (
      <div className="p-4 sm:p-6" dir="rtl">
        <div className="flex h-48 flex-col items-center justify-center text-center sm:h-60">
          <h2 className="mb-2 text-xl font-bold sm:text-2xl">لا توجد أسئلة تدريبية متاحة</h2>
          <p className="mb-4 text-sm text-slate-600 sm:mb-6 sm:text-base">لا توجد أسئلة تدريبية متاحة لدوراتك حتى الآن</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6" dir="rtl">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl font-bold sm:text-2xl">الأسئلة التدريبية</h1>
        <p className="text-sm text-slate-600 sm:text-base">اختبر معرفتك من خلال الأسئلة التدريبية من دوراتك</p>
      </div>

      <PracticeClient courses={courses} />
    </div>
  );
};

export default PracticePage;
