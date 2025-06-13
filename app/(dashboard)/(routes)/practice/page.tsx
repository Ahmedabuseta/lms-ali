import { redirect } from 'next/navigation';
import { PracticeClient } from './_components/practice-client';
import { db } from '@/lib/db';
import { PageProtection } from '@/components/page-protection';
import { getCurrentUser } from '@/lib/auth-helpers';

const PracticePage = async () => {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  // Get all courses that have questions in question banks
  const courses = await db.course.findMany({
    where: {
      questionBanks: {
        some: {
          questions: {
            some: {},
          },
        },
      },
    },
    select: {
      id: true,
      title: true,
      chapters: {
        where: {
          isPublished: true,
          // Only include chapters that have questions in question banks
          questionBanks: {
            some: {
              questions: {
                some: {},
              },
            },
          },
        },
        select: {
          id: true,
          title: true,
          _count: {
            select: {
              questionBanks: {
                where: {
                  questions: {
                    some: {},
                  },
                },
              },
            },
          },
        },
        orderBy: {
          position: 'asc',
        },
      },
      _count: {
        select: {
          questionBanks: {
            where: {
              questions: {
                some: {},
              },
            },
          },
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
      <PageProtection requiredPermission="canAccessPractice">
        <div className="p-4 sm:p-6" dir="rtl">
          <div className="flex h-48 flex-col items-center justify-center text-center sm:h-60">
            <h2 className="mb-2 text-xl font-bold sm:text-2xl font-arabic">لا توجد أسئلة تدريبية متاحة</h2>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400 sm:mb-6 sm:text-base font-arabic">
              لا توجد أسئلة تدريبية متاحة في بنك الأسئلة حتى الآن
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 font-arabic">
              يمكن للمدرسين إضافة أسئلة من خلال بنك الأسئلة
            </p>
          </div>
        </div>
      </PageProtection>
    );
  }

  return (
    <PageProtection requiredPermission="canAccessPractice">
      <div className="p-4 sm:p-6" dir="rtl">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl font-bold sm:text-2xl font-arabic text-gray-900 dark:text-white">
            الأسئلة التدريبية
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 sm:text-base font-arabic">
            اختبر معرفتك من خلال الأسئلة التدريبية من بنك الأسئلة
          </p>
        </div>

        <PracticeClient courses={courses} />
      </div>
    </PageProtection>
  );
};

export default PracticePage;
