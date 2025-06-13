import { redirect } from 'next/navigation';
import { ArrowLeft, Info, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { CreateExamForm } from './_components/create-exam-form';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { requireTeacher } from '@/lib/auth-helpers';

interface PageProps { searchParams: {
    courseId?: string;
    chapterId?: string; };
}

export default async function CreateExamPage({ searchParams }: PageProps) { const user = await requireTeacher();

  // Get all courses created by this teacher
  const courses = await db.course.findMany({
    where: { },
    orderBy: { title: 'asc', },
    select: { id: true,
      title: true,
      chapters: {
        where: {
          isPublished: true, },
        select: { id: true,
          title: true, },
        orderBy: { position: 'asc', },
      },
    },
  });

  if (courses.length === 0) {
    return (
      <div className="p-6" dir="rtl">
        <div className="mb-6">
          <Button variant="ghost" asChild className="ml-2">
            <Link href="/teacher/exam">
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة إلى الاختبارات
            </Link>
          </Button>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="font-arabic text-center">لا توجد دورات متاحة</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-amber-500 mx-auto" />
            <p className="text-gray-600 font-arabic">
              يجب أن تقوم بإنشاء دورة أولاً قبل إنشاء اختبار
            </p>
            <Button asChild className="font-arabic">
              <Link href="/teacher/courses/create">
                إنشاء دورة جديدة
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedCourse = searchParams.courseId
    ? courses.find((course) => course.id === searchParams.courseId)
    : null;

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6">
        <div className="flex items-center">
          <Button variant="ghost" asChild className="ml-2">
            <Link href="/teacher/exam">
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة إلى الاختبارات
            </Link>
          </Button>
        </div>
        <h1 className="mt-4 text-2xl font-bold font-arabic">إنشاء اختبار جديد</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-arabic">
          إنشاء اختبار جديد لدورتك وإضافة الأسئلة
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CreateExamForm
            courses={courses}
            selectedCourseId={selectedCourse?.id}
            selectedChapterId={searchParams.chapterId}
          />
        </div>

        <div className="space-y-6">
          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800 dark:text-blue-200 font-arabic">نصائح سريعة</AlertTitle>
            <AlertDescription className="text-sm text-blue-700 dark:text-blue-300">
              <ul className="mt-2 list-disc space-y-2 pr-4 font-arabic">
                <li>اختر عنواناً واضحاً ووصفياً للاختبار</li>
                <li>حدد وقتاً مناسباً لتعقيد الأسئلة</li>
                <li>يمكنك ربط الاختبار بفصل معين أو تركه عاماً</li>
                <li>بعد إنشاء الاختبار، ستتمكن من إضافة الأسئلة</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-arabic">إنشاء اختبار فعال</CardTitle>
              <CardDescription className="font-arabic">أفضل الممارسات لإنشاء الاختبارات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium font-arabic">1. حدد أهداف التعلم بوضوح</h3>
                <p className="text-slate-600 font-arabic">
                  تأكد من أن اختبارك يتماشى مع نتائج التعلم للدورة أو الفصل
                </p>
              </div>
              <div>
                <h3 className="font-medium font-arabic">2. وازن بين أنواع الأسئلة</h3>
                <p className="text-slate-600 font-arabic">
                  استخدم مزيجاً من أسئلة صح/خطأ والاختيار المتعدد لاختبار مستويات فهم مختلفة
                </p>
              </div>
              <div>
                <h3 className="font-medium font-arabic">3. اضبط مستوى الصعوبة المناسب</h3>
                <p className="text-slate-600 font-arabic">
                  نوع صعوبة الأسئلة لتحدي الطلاب مع ضمان عدالة الاختبار
                </p>
              </div>
              <div>
                <h3 className="font-medium font-arabic">4. راجع واختبر</h3>
                <p className="text-slate-600 font-arabic">
                  تحقق من جميع الأسئلة والإجابات للوضوح والدقة قبل النشر
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
