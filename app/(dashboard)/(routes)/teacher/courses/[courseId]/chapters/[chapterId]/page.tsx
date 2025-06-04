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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50/50 to-teal-50/30 dark:from-slate-900 dark:via-emerald-900/30 dark:to-teal-900/20">
      {/* Enhanced decorative elements with emerald/green theme */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-10 top-20 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-emerald-400/25 to-green-400/15 blur-3xl dark:from-emerald-400/40 dark:to-green-400/25"></div>
        <div
          className="absolute bottom-1/4 left-20 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-teal-400/25 to-cyan-400/15 blur-3xl dark:from-teal-400/40 dark:to-cyan-400/25"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute left-1/3 top-1/2 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-green-400/25 to-emerald-400/15 blur-3xl dark:from-green-400/40 dark:to-emerald-400/25"
          style={{ animationDelay: '4s' }}
        ></div>
        <div
          className="absolute right-1/3 bottom-1/3 h-40 w-40 animate-pulse rounded-full bg-gradient-to-br from-mint-400/20 to-teal-400/12 blur-3xl dark:from-mint-400/35 dark:to-teal-400/20"
          style={{ animationDelay: '1s' }}
        ></div>
      </div>

      <div className="relative z-10">
        {!chapter.isPublished && (
          <div className="p-4">
            <Banner variant="warning" label="هذا الفصل غير منشور. لن يكون مرئياً في الدورة" />
          </div>
        )}

        <div className="space-y-8 p-6">
          {/* Enhanced Navigation & Header */}
          <div className="space-y-6">
            <Link
              href={`/teacher/courses/${params.courseId}`}
              className="group inline-flex items-center rounded-lg bg-white/70 px-4 py-2 text-emerald-700 backdrop-blur-xl transition-all duration-300 hover:bg-white/90 hover:text-emerald-900 hover:scale-105 hover:shadow-md dark:bg-white/10 dark:text-emerald-300 dark:hover:bg-white/20 dark:hover:text-emerald-100 font-arabic"
            >
              <ArrowLeft className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              العودة إلى إعداد الدورة
            </Link>

            <div className="rounded-2xl border border-emerald-200/60 bg-white/90 backdrop-blur-2xl p-8 shadow-xl dark:border-emerald-400/20 dark:bg-emerald-900/10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-4">
                  <h1 className="text-4xl font-bold text-emerald-900 dark:text-emerald-100 font-arabic">إعداد فصل الدورة</h1>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-700 dark:text-emerald-300 font-arabic">أكمل جميع الحقول المطلوبة</span>
                    <div className="rounded-lg bg-emerald-100/90 px-4 py-2 text-sm font-semibold text-emerald-800 shadow-md backdrop-blur-xl dark:bg-emerald-500/30 dark:text-emerald-200 font-arabic">
                      {completionText}
                    </div>
                  </div>
                  <div className="h-2 w-64 overflow-hidden rounded-full bg-emerald-200/60 backdrop-blur-xl dark:bg-emerald-800/30">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 ease-out"
                      style={{ width: `${(completedFields / totalFields) * 100}%` }}
                    ></div>
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
          </div>

          {/* Enhanced Content Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Chapter Customization */}
              <div className="group rounded-2xl border border-emerald-200/60 bg-emerald-50/80 backdrop-blur-2xl p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:bg-emerald-50/90 dark:border-emerald-400/20 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/15">
                <div className="mb-8 flex items-center gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-3 shadow-lg">
                    <LayoutDashboard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 font-arabic">محتوى الفصل</h2>
                    <p className="text-emerald-700 dark:text-emerald-300 font-arabic">العنوان والوصف الأساسي</p>
                  </div>
                </div>
                <div className="space-y-8">
                  <ChapterTitleForm initialData={chapter} courseId={params.courseId} chapterId={params.chapterId} />
                  <ChapterDescriptionForm
                    initialData={chapter}
                    courseId={params.courseId}
                    chapterId={params.chapterId}
                  />
                </div>
              </div>

              {/* Access Settings */}
              <div className="group rounded-2xl border border-teal-200/60 bg-teal-50/80 backdrop-blur-2xl p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:bg-teal-50/90 dark:border-teal-400/20 dark:bg-teal-900/10 dark:hover:bg-teal-900/15">
                <div className="mb-8 flex items-center gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 p-3 shadow-lg">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-teal-900 dark:text-teal-100 font-arabic">إعدادات الوصول</h2>
                    <p className="text-teal-700 dark:text-teal-300 font-arabic">تحكم في إمكانية الوصول للفصل</p>
                  </div>
                </div>
                <ChapterAccessForm initialData={chapter} courseId={params.courseId} chapterId={params.chapterId} />
              </div>
            </div>

            {/* Right Column - Video */}
            <div className="space-y-6">
              <div className="group rounded-2xl border border-rose-200/60 bg-rose-50/80 backdrop-blur-2xl p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:bg-rose-50/90 dark:border-rose-400/20 dark:bg-rose-900/10 dark:hover:bg-rose-900/15">
                <div className="mb-8 flex items-center gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 p-3 shadow-lg">
                    <Video className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-rose-900 dark:text-rose-100 font-arabic">محتوى الفيديو</h2>
                    <p className="text-rose-700 dark:text-rose-300 font-arabic">رفع وإدارة فيديو الفصل</p>
                  </div>
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
