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
      <div className="p-6" dir="rtl">
        <div className="flex h-60 flex-col items-center justify-center text-center">
          <h2 className="mb-2 text-2xl font-bold">لا توجد أسئلة تدريبية متاحة</h2>
          <p className="mb-6 text-slate-600">لا توجد أسئلة تدريبية متاحة لدوراتك حتى الآن</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">الأسئلة التدريبية</h1>
        <p className="text-slate-600">اختبر معرفتك من خلال الأسئلة التدريبية من دوراتك</p>
      </div>

      <PracticeClient courses={courses} />
    </div>
  );
};

export default PracticePage;
