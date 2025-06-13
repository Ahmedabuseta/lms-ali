import { requireAuth } from '@/lib/auth-helpers';

import { redirect } from 'next/navigation';
import { File, Clock, BookOpen, Award, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { VideoPlayer } from './_components/video-player';
import { CourseProgressButton } from './_components/course-progress-button';
import { CoursePlaylist } from './_components/course-playlist';
import { ChapterQuiz } from './_components/chapter-quiz';
import { Banner } from '@/components/banner';
import { Preview } from '@/components/preview';
import { getChapter } from '@/actions/get-chapter';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { getProgress } from '@/actions/get-progress';
export default async function ChapterDetails({ params }: { params: { courseId: string; chapterId: string } }) {
  const {session} = await requireAuth();
  if (!session.userId) {
    return redirect('/');
  }

  const { chapter, course, muxData, attachments, nextChapter, userProgress, purchase, hasChapterAccess, chapterQuiz } = await getChapter({ userId: session.userId,
    ...params, });

  if (!chapter || !course) {
    return redirect('/');
  }

  // Get full course data with chapters for the playlist
  const fullCourse = await db.course.findUnique({ where: { id: params.courseId },
    include: { chapters: {
        where: { isPublished: true },
        include: { userProgress: {
            where: { userId: session.userId },
          },
        },
        orderBy: { position: 'asc' },
      },
    },
  });

  if (!fullCourse) {
    return redirect('/');
  }

  const progressCount = await getProgress(session.userId, params.courseId);
  // Use the new access control instead of just checking isFree and purchase
  const isLocked = !hasChapterAccess;
  const completedOnEnd = !!hasChapterAccess && !userProgress?.isCompleted;

  // Get current chapter index for navigation
  const currentChapterIndex = fullCourse.chapters.findIndex(ch => ch.id === chapter.id);
  const previousChapter = currentChapterIndex > 0 ? fullCourse.chapters[currentChapterIndex - 1] : null;

  // Check if quiz is required for completion and if user has passed it
  const hasQuizRequirement = chapterQuiz && chapterQuiz.quizQuestions.length > 0;
  const hasPassedQuiz = hasQuizRequirement ?
    chapterQuiz.attempts.some(attempt => attempt.isPassed) : true;

  // Chapter is considered completed if user progress shows completion AND they passed the quiz (if required)
  const isChapterFullyCompleted = userProgress?.isCompleted && hasPassedQuiz;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background" dir="rtl">
      {/* Enhanced decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-10 top-20 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-blue-500/8 to-indigo-500/4 dark:from-blue-400/8 dark:to-indigo-400/4 blur-3xl" />
        <div
          className="absolute bottom-1/4 left-20 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-purple-500/8 to-pink-500/4 dark:from-purple-400/8 dark:to-pink-400/4 blur-3xl"
          style={ { animationDelay: '2s' }}
         />
        <div
          className="absolute left-1/3 top-1/2 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-green-500/8 to-emerald-500/4 dark:from-green-400/8 dark:to-emerald-400/4 blur-3xl"
          style={ { animationDelay: '4s' }}
         />
      </div>

      <div className="relative z-10">
        {/* Status Banners */}
        <div className="space-y-2">
          { isChapterFullyCompleted && (
            <div className="p-2 md:p-4">
              <Banner
                label="🎉 تهانينا! لقد أكملت هذا الفصل بنجاح"
                variant="success"
              />
            </div>
          ) }
          { userProgress?.isCompleted && hasQuizRequirement && !hasPassedQuiz && (
            <div className="p-2 md:p-4">
              <Banner
                label="📝 يجب عليك اجتياز اختبار هذا الفصل لإكمال الدورة"
                variant="warning"
              />
            </div>
          ) }
          { isLocked && (
            <div className="p-2 md:p-4">
              <Banner
                label="🔒 هذا الفصل مقفل. تحتاج إلى صلاحيات للوصول إليه"
                variant="warning"
              />
            </div>
          ) }
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl pb-6 md:pb-20">
          {/* Chapter Header */}
          <div className="p-2 md:p-4 mb-3 md:mb-6">
            <div className="rounded-xl border border-border/50 bg-gradient-to-r from-card/80 to-card/60 p-4 md:p-6 shadow-lg backdrop-blur-sm">
              <div className="flex flex-col gap-4">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Link
                    href={`/courses/${fullCourse.id}`}
                    className="hover:text-foreground transition-colors font-arabic truncate"
                  >
                    {fullCourse.title}
                  </Link>
                  <ArrowLeft className="h-4 w-4 rotate-180 flex-shrink-0" />
                  <span className="font-arabic truncate">{chapter.title}</span>
                </div>

                {/* Chapter Title and Info */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground font-arabic leading-relaxed mb-2">
                      {chapter.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span className="font-arabic">الفصل {currentChapterIndex + 1}</span>
                      </div>
                      {chapter.videoUrl && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span className="font-arabic">فيديو تعليمي</span>
                        </div>
                      )}
                      {userProgress?.isCompleted && (
                        <div className="flex items-center gap-1 text-green-600">
                          <Award className="h-4 w-4" />
                          <span className="font-arabic">مكتمل</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Button */}
                  {purchase && (
                    <div className="flex-shrink-0">
                      <CourseProgressButton
                        chapterId={params.chapterId}
                        courseId={params.courseId}
                        nextChapterId={nextChapter?.id}
                        isCompleted={!!userProgress?.isCompleted}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Video and Playlist Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6 px-2 md:px-4">
            { /* Video Player - Full width on mobile, 2/3 on desktop */ }
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-xl border border-border/50 bg-card/60 shadow-lg backdrop-blur-sm">
                <VideoPlayer
                  chapterId={chapter.id}
                  title={chapter.title}
                  courseId={params.courseId}
                  nextChapterId={nextChapter?.id}
                  playbackId={muxData?.playbackId!}
                  isLocked={isLocked}
                  completeOnEnd={completedOnEnd}
                />
              </div>
            </div>

            { /* YouTube-style Playlist - Full width on mobile, 1/3 on desktop */ }
            <div className="lg:col-span-1">
              <CoursePlaylist
                courseId={params.courseId}
                courseTitle={fullCourse.title}
                chapters={fullCourse.chapters}
                currentChapterId={chapter.id}
                progressCount={progressCount}
                hasPurchase={!!purchase}
              />
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-4 md:space-y-6 px-2 md:px-4 mt-4 md:mt-6">
            {/* Chapter Description */}
            { chapter.description && (
              <div className="rounded-xl border border-border/50 bg-card/60 p-4 md:p-6 shadow-lg backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-foreground font-arabic">محتوى الفصل</h3>
                </div>
                <div className="prose dark:prose-invert max-w-none font-arabic">
                  <Preview value={chapter.description } />
                </div>
              </div>
            )}

            {/* Attachments */}
            { attachments.length > 0 && (
              <div className="rounded-xl border border-border/50 bg-card/60 p-4 md:p-6 shadow-lg backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-2">
                  <File className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-foreground font-arabic">المرفقات والموارد</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {attachments.map((attachment) => (
                    <a
                      key={attachment.id }
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-4 text-foreground transition-all duration-200 hover:bg-muted/50 hover:text-primary hover:shadow-md"
                    >
                      <File className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary flex-shrink-0" />
                      <span className="font-medium font-arabic truncate">{attachment.name}</span>
                      <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary ml-auto rotate-180" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Chapter Quiz */}
            { chapterQuiz && hasChapterAccess && (
              <ChapterQuiz
                quiz={{
                  id: chapterQuiz.id,
                  title: chapterQuiz.title,
                  description: chapterQuiz.description ?? undefined,
                  timeLimit: chapterQuiz.timeLimit ?? undefined,
                  requiredScore: chapterQuiz.requiredScore,
                  freeAttempts: chapterQuiz.freeAttempts,
                  quizQuestions: chapterQuiz.quizQuestions.map(q => ({
                    id: q.id,
                    position: q.position,
                    question: {
                      id: q.question.id,
                      text: q.question.text,
                      type: q.question.type as "MULTIPLE_CHOICE" | "TRUE_FALSE",
                      points: q.question.points,
                                             explanation: q.question.explanation ?? undefined,
                      options: q.question.options.map(o => ({
                        id: o.id,
                        text: o.text,
                        isCorrect: o.isCorrect }))
                    }
                  })),
                                     attempts: chapterQuiz.attempts.map(a => ({ id: a.id,
                     score: a.score ?? undefined,
                     isPassed: a.isPassed,
                     completedAt: a.completedAt ?? undefined }))
                }}
                courseId={params.courseId}
                chapterId={params.chapterId}
              />
            )}

            {/* Navigation */}
            <div className="rounded-xl border border-border/50 bg-card/60 p-4 md:p-6 shadow-lg backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Previous Chapter */}
                <div className="w-full sm:flex-1">
                  {previousChapter && (
                    <Link href={`/courses/${fullCourse.id}/chapters/${previousChapter.id}`}>
                      <Button variant="outline" className="group font-arabic w-full sm:w-auto">
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        الفصل السابق
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Course Overview */}
                <div className="flex-shrink-0">
                  <Link href={`/courses/${fullCourse.id}`}>
                    <Button variant="ghost" size="sm" className="font-arabic">
                      نظرة عامة على الدورة
                    </Button>
                  </Link>
                </div>

                {/* Next Chapter */}
                <div className="w-full sm:flex-1 flex justify-end">
                  {nextChapter && (
                    <Link href={`/courses/${fullCourse.id}/chapters/${nextChapter.id}`}>
                      <Button className="group font-arabic w-full sm:w-auto">
                        الفصل التالي
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform rotate-180" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
