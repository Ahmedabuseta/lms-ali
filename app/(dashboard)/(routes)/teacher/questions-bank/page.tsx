import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Brain, BookOpen, Target } from 'lucide-react';
import { CourseWithQuestionsCount } from './types';
import { QuestionsEmptyState } from './_components/questions-empty-state';
import { CourseQuestionsList } from './_components/course-questions-list';

const QuestionsPage = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect('/');
  }

  const courses = await db.course.findMany({
    include: {
      chapters: {
        select: {
          id: true,
          title: true,
          _count: {
            select: {
              PracticeQuestion: true,
            },
          },
        },
        orderBy: {
          position: 'asc',
        },
      },
      _count: {
        select: {
          PracticeQuestion: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const coursesWithQuestions: CourseWithQuestionsCount[] = courses.map((course) => ({
    id: course.id,
    title: course.title,
    chapters: course.chapters,
    questionCount: course._count.PracticeQuestion,
  }));

  const totalQuestions = coursesWithQuestions.reduce((acc, course) => acc + course.questionCount, 0);

  return (
    <div className="p-6 space-y-8">
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 shadow-lg dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25"></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-arabic">بنك الأسئلة</h1>
                  <p className="text-gray-600 dark:text-gray-300 font-arabic">إدارة وتنظيم أسئلة الاختبارات والممارسة</p>
                </div>
              </div>
              
              {/* Statistics */}
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-arabic">
                    {coursesWithQuestions.length} دورة تدريبية
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-arabic">
                    {totalQuestions} سؤال
                  </span>
                </div>
              </div>
            </div>
            
            <Button 
              asChild 
              size="lg"
              className="transform bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl font-arabic"
            >
          <Link href="/teacher/questions-bank/create">
                <Plus className="ml-2 h-5 w-5" />
                إضافة سؤال جديد
          </Link>
        </Button>
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
