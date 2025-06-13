import { requireAuth } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { CreatePassageForm } from './_components/create-passage-form';

const CreatePassagePage = async () => { await requireAuth();

  // Get all courses for the dropdown
  const courses = await db.course.findMany({
    select: {
      id: true,
      title: true, },
    orderBy: { title: 'asc', },
  });

  if (courses.length === 0) {
    redirect('/teacher/courses');
  }

  return (
    <div className="p-6">
      <div className="mb-8" dir="rtl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-arabic">
          إنشاء قطعة جديدة
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300 font-arabic">
          أنشئ قطعة قراءة مع الأسئلة المرتبطة بها
        </p>
      </div>

      <CreatePassageForm courses={courses} />
    </div>
  );
};

export default CreatePassagePage;
