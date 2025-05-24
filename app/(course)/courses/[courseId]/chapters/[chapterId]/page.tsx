import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { Banner } from '@/components/banner';
import { Preview } from '@/components/preview';
import { VideoPlayer } from './_components/video-player';
import { getChapter } from '@/actions/get-chapter';
import CourseEnrollButton from './_components/course-enroll-button';
import { Separator } from '@/components/ui/separator';
import { CourseProgressButton } from './_components/course-progress-button';
import { File } from 'lucide-react';

export default async function ChapterDetails({ params }: { params: { courseId: string; chapterId: string } }) {
  const { userId } = auth();
  if (!userId) {
    return redirect('/');
  }

  const { chapter, course, muxData, attachments, nextChapter, userProgress, purchase } = await getChapter({
    userId,
    ...params,
  });

  if (!chapter || !course) {
    return redirect('/');
  }

  const isLocked = !chapter.isFree && !purchase;
  const completedOnEnd = !!purchase && !userProgress?.isCompleted;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Enhanced decorative elements for both themes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="from-blue-500/8 to-indigo-500/4 dark:from-blue-400/8 dark:to-indigo-400/4 absolute right-10 top-20 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br blur-3xl"></div>
        <div
          className="from-purple-500/8 to-pink-500/4 dark:from-purple-400/8 dark:to-pink-400/4 absolute bottom-1/4 left-20 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br blur-3xl"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="from-green-500/8 to-emerald-500/4 dark:from-green-400/8 dark:to-emerald-400/4 absolute left-1/3 top-1/2 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br blur-3xl"
          style={{ animationDelay: '4s' }}
        ></div>
      </div>

      <div className="relative z-10">
        {/* Status Banners */}
        <div className="space-y-2">
          {userProgress?.isCompleted && (
            <div className="p-4">
              <Banner label="لقد أكملت هذا الفصل بالفعل" variant="success" />
            </div>
          )}
          {isLocked && (
            <div className="p-4">
              <Banner label="تحتاج إلى شراء هذه الدورة لمشاهدة هذا الفصل" />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-6xl pb-20">
          {/* Video Player Section */}
          <div className="p-4">
            <div className="overflow-hidden rounded-lg border border-border/50 bg-card/60 shadow-lg backdrop-blur-sm">
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

          {/* Chapter Info & Actions */}
          <div className="space-y-6 px-4">
            <div className="rounded-lg border border-border/50 bg-card/60 p-6 shadow-lg backdrop-blur-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-2xl font-bold text-foreground">{chapter.title}</h2>
                <div className="flex-shrink-0">
                  {purchase ? (
                    <CourseProgressButton
                      chapterId={params.chapterId}
                      courseId={params.courseId}
                      nextChapterId={nextChapter?.id}
                      isCompleted={!!userProgress?.isCompleted}
                    />
                  ) : (
                    <CourseEnrollButton courseId={params.courseId} price={course.price!} />
                  )}
                </div>
              </div>
            </div>

            {/* Chapter Description */}
            {chapter.description && (
              <div className="rounded-lg border border-border/50 bg-card/60 p-6 shadow-lg backdrop-blur-sm">
                <div className="prose dark:prose-invert max-w-none">
                  <Preview value={chapter.description} />
                </div>
              </div>
            )}

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="rounded-lg border border-border/50 bg-card/60 p-6 shadow-lg backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-2">
                  <File className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground">المرفقات</h3>
                </div>
                <div className="space-y-3">
                  {attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex w-full items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-4 text-foreground transition-all duration-200 hover:bg-muted/50 hover:text-primary"
                    >
                      <File className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                      <span className="font-medium">{attachment.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
