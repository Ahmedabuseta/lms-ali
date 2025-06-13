import { requireAuth } from '@/lib/auth-helpers';
import { MathRenderer } from '@/components/math-renderer';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Brain, BookOpen, Target } from 'lucide-react';
import { CourseWithQuestionsCount } from './types';
import { QuestionsEmptyState } from './_components/questions-empty-state';
import { CourseQuestionsList } from './_components/course-questions-list';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';

const QuestionsPage = async () => {
  await requireAuth();

  const courses = await db.course.findMany({
    include: {
      chapters: {
        select: {
          id: true,
          title: true,
          questionBanks: {
            include: {
              _count: {
                select: {
                  questions: true,
                },
              },
              questions: {
                select: {
                  id: true,
                  type: true,
                  passage: {
                    select: {
                      id: true,
                      title: true,
                    },
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
      questionBanks: {
        include: {
          _count: {
            select: {
              questions: true,
            },
          },
          questions: {
            select: {
              id: true,
              type: true,
              passage: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const coursesWithQuestions: CourseWithQuestionsCount[] = courses.map((course) => {
    // Calculate question type counts for the course
    const allQuestions = course.questionBanks.flatMap(qb => qb.questions);
    const multipleChoiceCount = allQuestions.filter(q => q.type === 'MULTIPLE_CHOICE').length;
    const trueFalseCount = allQuestions.filter(q => q.type === 'TRUE_FALSE').length;
    const passageCount = allQuestions.filter(q => q.type === 'PASSAGE').length;
    const passageQuestionCount = allQuestions.filter(q => q.passage).length;

    return {
      id: course.id,
      title: course.title,
      chapters: course.chapters.map(chapter => {
        const chapterQuestions = chapter.questionBanks.flatMap(qb => qb.questions);
        return {
          id: chapter.id,
          title: chapter.title,
          _count: {
            questions: chapter.questionBanks.reduce((acc, qb) => acc + qb._count.questions, 0)
          },
          questionTypes: {
            multipleChoice: chapterQuestions.filter(q => q.type === 'MULTIPLE_CHOICE').length,
            trueFalse: chapterQuestions.filter(q => q.type === 'TRUE_FALSE').length,
            passage: chapterQuestions.filter(q => q.type === 'PASSAGE').length,
            passageQuestions: chapterQuestions.filter(q => q.passage).length,
          }
        };
      }),
      questionCount: course.questionBanks.reduce((acc, qb) => acc + qb._count.questions, 0),
      questionTypes: {
        multipleChoice: multipleChoiceCount,
        trueFalse: trueFalseCount,
        passage: passageCount,
        passageQuestions: passageQuestionCount,
      }
    };
  });

  const totalQuestions = coursesWithQuestions.reduce((acc, course) => acc + course.questionCount, 0);
  const totalPassages = coursesWithQuestions.reduce((acc, course) => acc + course.questionTypes.passage, 0);
  const totalPassageQuestions = coursesWithQuestions.reduce((acc, course) => acc + course.questionTypes.passageQuestions, 0);
  const totalMultipleChoice = coursesWithQuestions.reduce((acc, course) => acc + course.questionTypes.multipleChoice, 0);
  const totalTrueFalse = coursesWithQuestions.reduce((acc, course) => acc + course.questionTypes.trueFalse, 0);

  return (
    <div className="p-6 space-y-8">
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 shadow-lg dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-arabic">بنك الأسئلة</h1>
                  <p className="text-gray-600 dark:text-gray-300 font-arabic">إدارة وتنظيم أسئلة الاختبارات والممارسة والقطع</p>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-arabic">
                    {coursesWithQuestions.length} دورة
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-arabic">
                    {totalQuestions} سؤال
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-arabic">
                    {totalMultipleChoice} متعدد الخيارات
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-orange-500"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-arabic">
                    {totalTrueFalse} صح أو خطأ
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-indigo-500"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-arabic">
                    {totalPassages} قطعة ({totalPassageQuestions} سؤال)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="bg-white border-gray-300 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200 font-arabic"
              >
                <Link href="/teacher/questions-bank/explore">
                  <Target className="ml-2 h-5 w-5" />
                  استكشاف الأسئلة
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md transition-all duration-200 font-arabic"
              >
                <Link href="/teacher/questions-bank/create">
                  <Plus className="ml-2 h-5 w-5" />
                  إضافة سؤال جديد
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 shadow-sm hover:shadow-md transition-all duration-200 font-arabic"
              >
                <Link href="/teacher/questions-bank/create-passage">
                  <Plus className="ml-2 h-5 w-5" />
                  إضافة قطعة جديدة
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="space-y-6">
      {coursesWithQuestions.length === 0 ? (
        <QuestionsEmptyState />
      ) : (
        <div className="space-y-6">
          {coursesWithQuestions.map((course) => (
            <CourseQuestionsList key={course.id} course={course} />
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default QuestionsPage;
