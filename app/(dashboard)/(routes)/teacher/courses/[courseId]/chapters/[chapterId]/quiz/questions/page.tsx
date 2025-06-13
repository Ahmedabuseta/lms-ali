import { requireAuth } from '@/lib/auth-helpers';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, PlusCircle, FileQuestion } from 'lucide-react';

import { QuizQuestionsForm } from './_components/quiz-questions-form';
import { QuizQuestionsList } from './_components/quiz-questions-list';
import { QuizSettings } from './_components/quiz-settings';
import { Banner } from '@/components/banner';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';

interface PageProps { params: {
    courseId: string;
    chapterId: string; };
}

export default async function ChapterQuizQuestionsPage({ params }: PageProps) { requireAuth()

  // Get chapter and quiz data
  const chapter = await db.chapter.findUnique({
    where: {
      id: params.chapterId,
      courseId: params.courseId, },
    include: { course: {
        select: {
          title: true, },
      },
    },
  });

  if (!chapter) {
    return redirect('/teacher/courses');
  }

  // Get or create quiz for this chapter
  let quiz = await db.quiz.findFirst({ where: {
      chapterId: params.chapterId, },
    include: { quizQuestions: {
        include: {
          question: {
            include: {
              options: true, },
          },
        },
        orderBy: { position: 'asc', },
      },
    },
  });

  // Create quiz if it doesn't exist
  if (!quiz) { quiz = await db.quiz.create({
      data: {
        title: `${chapter.title } Quiz`,
        chapterId: params.chapterId,
        requiredScore: 100,
        freeAttempts: -1,
      },
      include: { quizQuestions: {
          include: {
            question: {
              include: {
                options: true, },
            },
          },
          orderBy: { position: 'asc', },
        },
      },
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50/50 to-indigo-50/30 dark:from-slate-900 dark:via-purple-900/30 dark:to-indigo-900/20">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-10 top-20 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-purple-400/25 to-violet-400/15 blur-3xl dark:from-purple-400/40 dark:to-violet-400/25" />
        <div
          className="absolute bottom-1/4 left-20 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-indigo-400/25 to-blue-400/15 blur-3xl dark:from-indigo-400/40 dark:to-blue-400/25"
          style={ { animationDelay: '2s' }}
         />
      </div>

      <div className="relative z-10">
        {!quiz.isPublished && (
          <div className="p-4">
            <Banner
              variant="warning"
              label="هذا الاختبار غير منشور. لن يكون مرئياً للطلاب"
            />
          </div>
        )}

        <div className="space-y-8 p-6">
          {/* Navigation & Header */}
          <div className="space-y-6">
            <Link
              href={`/teacher/courses/${params.courseId}/chapters/${params.chapterId}`}
              className="group inline-flex items-center rounded-lg bg-white/70 px-4 py-2 text-purple-700 backdrop-blur-xl transition-all duration-300 hover:bg-white/90 hover:text-purple-900 hover:shadow-md dark:bg-white/10 dark:text-purple-300 dark:hover:bg-white/20 dark:hover:text-purple-100 font-arabic"
            >
              <ArrowLeft className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              العودة إلى إعداد الفصل
            </Link>

            <div className="rounded-2xl border border-purple-200/60 bg-white/90 backdrop-blur-2xl p-8 shadow-xl dark:border-purple-400/20 dark:bg-purple-900/10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-4">
                  <h1 className="text-4xl font-bold text-purple-900 dark:text-purple-100 font-arabic">
                    إدارة أسئلة الاختبار
                  </h1>
                  <div className="text-purple-700 dark:text-purple-300 font-arabic">
                    <p className="font-semibold">{chapter.course.title}</p>
                    <p>{chapter.title}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-purple-700 dark:text-purple-300 font-arabic">
                      عدد الأسئلة الحالية
                    </span>
                    <div className="rounded-lg bg-purple-100/90 px-4 py-2 text-sm font-semibold text-purple-800 shadow-md backdrop-blur-xl dark:bg-purple-500/30 dark:text-purple-200 font-arabic">
                      {quiz.quizQuestions.length} أسئلة
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quiz Settings */}
          <div className="space-y-6">
            <QuizSettings
              courseId={params.courseId}
              chapterId={params.chapterId}
              quiz={quiz}
            />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            {/* Left Column - Add Question Form */}
            <div className="space-y-6">
              <div className="group rounded-2xl border border-purple-200/60 bg-purple-50/80 backdrop-blur-2xl p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:bg-purple-50/90 dark:border-purple-400/20 dark:bg-purple-900/10 dark:hover:bg-purple-900/15">
                <div className="mb-8 flex items-center gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 p-3 shadow-lg">
                    <PlusCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100 font-arabic">
                      إضافة سؤال جديد
                    </h2>
                    <p className="text-purple-700 dark:text-purple-300 font-arabic">
                      أنشئ أسئلة اختيار من متعدد أو صح وخطأ
                    </p>
                  </div>
                </div>
                <QuizQuestionsForm
                  courseId={params.courseId}
                  chapterId={params.chapterId}
                  quizId={quiz.id}
                />
              </div>
            </div>

            {/* Right Column - Questions List */}
            <div className="space-y-6">
              <div className="group rounded-2xl border border-indigo-200/60 bg-indigo-50/80 backdrop-blur-2xl p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:bg-indigo-50/90 dark:border-indigo-400/20 dark:bg-indigo-900/10 dark:hover:bg-indigo-900/15">
                <div className="mb-8 flex items-center gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 p-3 shadow-lg">
                    <FileQuestion className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 font-arabic">
                      الأسئلة الحالية
                    </h2>
                    <p className="text-indigo-700 dark:text-indigo-300 font-arabic">
                      عرض وتعديل الأسئلة الموجودة
                    </p>
                  </div>
                </div>
                <QuizQuestionsList
                  courseId={params.courseId}
                  chapterId={params.chapterId}
                  quizId={quiz.id}
                  questions={ quiz.quizQuestions
                    .filter(q => q.question.type !== 'PASSAGE')
                    .map(q => ({
                      id: q.id,
                      position: q.position,
                      question: {
                        id: q.question.id,
                        text: q.question.text,
                        type: q.question.type as 'MULTIPLE_CHOICE' | 'TRUE_FALSE',
                        difficulty: q.question.difficulty,
                        points: q.question.points,
                        explanation: q.question.explanation ?? undefined,
                        options: q.question.options.map(o => ({
                          id: o.id,
                          text: o.text,
                          isCorrect: o.isCorrect }))
                      }
                    }))
                  }
                  isLocked={quiz.isPublished}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
