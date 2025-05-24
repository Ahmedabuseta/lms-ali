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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Enhanced decorative elements for both themes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-10 top-20 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/5 blur-3xl dark:from-blue-400/10 dark:to-indigo-400/5"></div>
        <div
          className="absolute bottom-1/4 left-20 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/5 blur-3xl dark:from-purple-400/10 dark:to-pink-400/5"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute left-1/3 top-1/2 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/5 blur-3xl dark:from-cyan-400/10 dark:to-blue-400/5"
          style={{ animationDelay: '4s' }}
        ></div>
      </div>

      <div className="relative z-10">
        {!course.isPublished && (
          <div className="p-4">
            <Banner label="هذه الدورة غير منشورة. لن تكون مرئية للطلاب." />
          </div>
        )}

        <div className="space-y-8 p-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-foreground">إعداد الدورة</h1>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">أكمل جميع الحقول</span>
                <span className="rounded-md bg-primary/10 px-2 py-1 text-sm font-medium text-primary">
                  {completionText}
                </span>
              </div>
            </div>
            <Actions disabled={!isComplete} courseId={params.courseId} isPublished={course.isPublished} />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left Column - Course Customization */}
            <div className="space-y-6">
              <div className="rounded-lg border border-border/50 bg-card/60 p-6 shadow-lg backdrop-blur-sm">
                <div className="mb-6 flex items-center gap-3">
                  <IconBadge icon={LayoutDashboard} variant="info" />
                  <h2 className="text-xl font-semibold text-foreground">تخصيص دورتك</h2>
                </div>
                <div className="space-y-6">
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
              <div className="rounded-lg border border-border/50 bg-card/60 p-6 shadow-lg backdrop-blur-sm">
                <div className="mb-6 flex items-center gap-3">
                  <IconBadge icon={ListChecks} variant="success" />
                  <h2 className="text-xl font-semibold text-foreground">فصول الدورة</h2>
                </div>
                <ChaptersForm initialData={course} courseId={course.id} />
              </div>

              {/* Course Pricing */}
              <div className="rounded-lg border border-border/50 bg-card/60 p-6 shadow-lg backdrop-blur-sm">
                <div className="mb-6 flex items-center gap-3">
                  <IconBadge icon={CircleDollarSign} variant="warning" />
                  <h2 className="text-xl font-semibold text-foreground">بيع دورتك</h2>
                </div>
                <PriceForm initialData={course} courseId={course.id} />
              </div>

              {/* Resources & Attachments */}
              <div className="rounded-lg border border-border/50 bg-card/60 p-6 shadow-lg backdrop-blur-sm">
                <div className="mb-6 flex items-center gap-3">
                  <IconBadge icon={File} variant="default" />
                  <h2 className="text-xl font-semibold text-foreground">الموارد والمرفقات</h2>
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
