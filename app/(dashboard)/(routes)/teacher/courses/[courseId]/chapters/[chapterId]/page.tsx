import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, LayoutDashboard, Video } from 'lucide-react';

import { db } from '@/lib/db';
import { IconBadge } from '@/components/icon-badge';
import { Banner } from '@/components/banner';

import { ChapterTitleForm } from './_components/chapter-title-form';
import { ChapterDescriptionForm } from './_components/chapter-description-form';
import { ChapterAccessForm } from './_components/chapter-access-form';
import { ChapterVideoForm } from './_components/chapter-video-form';
import { ChapterActions } from './_components/chapter-actions';

const ChapterIdPage = async ({ params }: { params: { courseId: string; chapterId: string } }) => {
  const { userId } = auth();

  if (!userId) {
    return redirect('/');
  }

  const chapter = await db.chapter.findUnique({
    where: {
      id: params.chapterId,
      courseId: params.courseId,
    },
    include: {
      muxData: true,
    },
  });

  if (!chapter) {
    return redirect('/');
  }

  const requiredFields = [chapter.title, chapter.description, chapter.videoUrl];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionText = `(${completedFields}/${totalFields})`;

  const isComplete = requiredFields.every(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Enhanced decorative elements for both themes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-10 top-20 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-green-500/10 to-emerald-500/5 blur-3xl dark:from-green-400/10 dark:to-emerald-400/5"></div>
        <div
          className="absolute bottom-1/4 left-20 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/5 blur-3xl dark:from-blue-400/10 dark:to-cyan-400/5"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute left-1/3 top-1/2 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/5 blur-3xl dark:from-purple-400/10 dark:to-pink-400/5"
          style={{ animationDelay: '4s' }}
        ></div>
      </div>

      <div className="relative z-10">
        {!chapter.isPublished && (
          <div className="p-4">
            <Banner variant="warning" label="هذا الفصل غير منشور. لن يكون مرئياً في الدورة" />
          </div>
        )}

        <div className="space-y-8 p-6">
          {/* Navigation & Header */}
          <div className="space-y-6">
            <Link
              href={`/teacher/courses/${params.courseId}`}
              className="group inline-flex items-center text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
              العودة إلى إعداد الدورة
            </Link>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-foreground">إنشاء الفصل</h1>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">أكمل جميع الحقول</span>
                  <span className="rounded-md bg-primary/10 px-2 py-1 text-sm font-medium text-primary">
                    {completionText}
                  </span>
                </div>
              </div>
              <ChapterActions
                disabled={!isComplete}
                courseId={params.courseId}
                chapterId={params.chapterId}
                isPublished={chapter.isPublished}
              />
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Chapter Customization */}
              <div className="rounded-lg border border-border/50 bg-card/60 p-6 shadow-lg backdrop-blur-sm">
                <div className="mb-6 flex items-center gap-3">
                  <IconBadge icon={LayoutDashboard} variant="info" />
                  <h2 className="text-xl font-semibold text-foreground">تخصيص الفصل</h2>
                </div>
                <div className="space-y-6">
                  <ChapterTitleForm initialData={chapter} courseId={params.courseId} chapterId={params.chapterId} />
                  <ChapterDescriptionForm
                    initialData={chapter}
                    courseId={params.courseId}
                    chapterId={params.chapterId}
                  />
                </div>
              </div>

              {/* Access Settings */}
              <div className="rounded-lg border border-border/50 bg-card/60 p-6 shadow-lg backdrop-blur-sm">
                <div className="mb-6 flex items-center gap-3">
                  <IconBadge icon={Eye} variant="success" />
                  <h2 className="text-xl font-semibold text-foreground">إعدادات الوصول</h2>
                </div>
                <ChapterAccessForm initialData={chapter} courseId={params.courseId} chapterId={params.chapterId} />
              </div>
            </div>

            {/* Right Column - Video */}
            <div className="space-y-6">
              <div className="rounded-lg border border-border/50 bg-card/60 p-6 shadow-lg backdrop-blur-sm">
                <div className="mb-6 flex items-center gap-3">
                  <IconBadge icon={Video} variant="warning" />
                  <h2 className="text-xl font-semibold text-foreground">إضافة فيديو</h2>
                </div>
                <ChapterVideoForm initialData={chapter} chapterId={params.chapterId} courseId={params.courseId} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterIdPage;
