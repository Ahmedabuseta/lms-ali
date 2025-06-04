import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { CircleDollarSign, File, LayoutDashboard, ListChecks } from 'lucide-react';

import { db } from '@/lib/db';
import { IconBadge } from '@/components/icon-badge';
import { TitleForm } from './_components/title-form';
import { DescriptionForm } from './_components/description-form';
import { ImageForm } from './_components/image-form';
import CategoryForm from './_components/category-form';
import { PriceForm } from './_components/price-form';
import { AttachmentForm } from './_components/attachment-form';
import { ChaptersForm } from './_components/chapters-form';
import { Banner } from '@/components/banner';
import Actions from './_components/actions';

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  const { userId } = auth();

  if (!userId) {
    return redirect('/');
  }

  const course = await db.course.findUnique({
    where: { id: params.courseId },
    include: { attachments: { orderBy: { createdAt: 'desc' } }, chapters: { orderBy: { position: 'asc' } } },
  });

  if (!course) {
    return redirect('/');
  }

  const categories = await db.category.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  const requiredFields = [
    course.title,
    course.description,
    course.imageUrl,
    course.price,
    course.categoryId,
    course.chapters.some((chapter) => chapter.isPublished),
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionText = `(${completedFields}/${totalFields})`;

  const isComplete = requiredFields.every(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 dark:from-slate-900 dark:via-blue-900/30 dark:to-indigo-900/20">
      {/* Enhanced decorative elements with cohesive blue/indigo theme */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-10 top-20 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-blue-400/25 to-indigo-400/15 blur-3xl dark:from-blue-400/40 dark:to-indigo-400/25"></div>
        <div
          className="absolute bottom-1/4 left-20 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-purple-400/25 to-pink-400/15 blur-3xl dark:from-purple-400/40 dark:to-pink-400/25"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute left-1/3 top-1/2 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-cyan-400/25 to-blue-400/15 blur-3xl dark:from-cyan-400/40 dark:to-blue-400/25"
          style={{ animationDelay: '4s' }}
        ></div>
        <div
          className="absolute right-1/3 bottom-1/3 h-40 w-40 animate-pulse rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/12 blur-3xl dark:from-indigo-400/35 dark:to-purple-400/20"
          style={{ animationDelay: '1s' }}
        ></div>
      </div>

      <div className="relative z-10">
        {!course.isPublished && (
          <div className="p-4">
            <Banner label="هذه الدورة غير منشورة. لن تكون مرئية للطلاب." />
          </div>
        )}

        <div className="space-y-8 p-6">
          {/* Enhanced Header with blue theme */}
          <div className="rounded-2xl border border-blue-200/60 bg-white/90 backdrop-blur-2xl p-8 shadow-xl dark:border-blue-400/20 dark:bg-blue-900/10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-4">
                <h1 className="text-4xl font-bold text-blue-900 dark:text-blue-100 font-arabic">إعداد الدورة التدريبية</h1>
                <div className="flex items-center gap-3">
                  <span className="text-blue-700 dark:text-blue-300 font-arabic">أكمل جميع الحقول المطلوبة</span>
                  <div className="rounded-lg bg-blue-100/90 px-4 py-2 text-sm font-semibold text-blue-800 shadow-md backdrop-blur-xl dark:bg-blue-500/30 dark:text-blue-200 font-arabic">
                    {completionText}
                  </div>
                </div>
                <div className="h-2 w-64 overflow-hidden rounded-full bg-blue-200/60 backdrop-blur-xl dark:bg-blue-800/30">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                    style={{ width: `${(completedFields / totalFields) * 100}%` }}
                  ></div>
                </div>
              </div>
              <Actions disabled={!isComplete} courseId={params.courseId} isPublished={course.isPublished} />
            </div>
          </div>

          {/* Enhanced Content Grid with cohesive theme */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left Column - Course Customization */}
            <div className="space-y-6">
              <div className="group rounded-2xl border border-blue-200/60 bg-blue-50/80 backdrop-blur-2xl p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:bg-blue-50/90 dark:border-blue-400/20 dark:bg-blue-900/10 dark:hover:bg-blue-900/15">
                <div className="mb-8 flex items-center gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 shadow-lg">
                    <LayoutDashboard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 font-arabic">تخصيص المحتوى</h2>
                    <p className="text-blue-700 dark:text-blue-300 font-arabic">قم بإعداد المعلومات الأساسية للدورة</p>
                  </div>
                </div>
                <div className="space-y-8">
                  <TitleForm initialData={course} courseId={course.id} />
                  <DescriptionForm initialData={course} courseId={course.id} />
                  <ImageForm initialData={course} courseId={course.id} />
                  <CategoryForm
                    initialData={course}
                    courseId={course.id}
                    options={categories.map((category) => ({
                      label: category.name,
                      value: category.id,
                    }))}
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Additional Settings */}
            <div className="space-y-6">
              {/* Course Chapters */}
              <div className="group rounded-2xl border border-indigo-200/60 bg-indigo-50/80 backdrop-blur-2xl p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:bg-indigo-50/90 dark:border-indigo-400/20 dark:bg-indigo-900/10 dark:hover:bg-indigo-900/15">
                <div className="mb-8 flex items-center gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-3 shadow-lg">
                    <ListChecks className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 font-arabic">فصول الدورة</h2>
                    <p className="text-indigo-700 dark:text-indigo-300 font-arabic">تنظيم وترتيب محتوى الدورة</p>
                  </div>
                </div>
                <ChaptersForm initialData={course} courseId={course.id} />
              </div>

              {/* Course Pricing */}
              <div className="group rounded-2xl border border-purple-200/60 bg-purple-50/80 backdrop-blur-2xl p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:bg-purple-50/90 dark:border-purple-400/20 dark:bg-purple-900/10 dark:hover:bg-purple-900/15">
                <div className="mb-8 flex items-center gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-3 shadow-lg">
                    <CircleDollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100 font-arabic">التسعير والمبيعات</h2>
                    <p className="text-purple-700 dark:text-purple-300 font-arabic">تحديد سعر الدورة وإعدادات البيع</p>
                  </div>
                </div>
                <PriceForm initialData={course} courseId={course.id} />
              </div>

              {/* Resources & Attachments */}
              <div className="group rounded-2xl border border-cyan-200/60 bg-cyan-50/80 backdrop-blur-2xl p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:bg-cyan-50/90 dark:border-cyan-400/20 dark:bg-cyan-900/10 dark:hover:bg-cyan-900/15">
                <div className="mb-8 flex items-center gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-3 shadow-lg">
                    <File className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-cyan-900 dark:text-cyan-100 font-arabic">الموارد والمرفقات</h2>
                    <p className="text-cyan-700 dark:text-cyan-300 font-arabic">ملفات إضافية لدعم التعلم</p>
                  </div>
                </div>
                <AttachmentForm initialData={course} courseId={course.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseIdPage;
