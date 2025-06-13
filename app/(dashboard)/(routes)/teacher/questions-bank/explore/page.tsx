import { requireAuth } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { QuestionsExplorer } from './_components/questions-explorer';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ExploreQuestionsPageProps {
  searchParams: {
    page?: string;
    courseId?: string;
    type?: string;
    difficulty?: string;
    search?: string;
  };
}

const ExploreQuestionsPage = async ({ searchParams }: ExploreQuestionsPageProps) => {
  await requireAuth();

  const page = Math.max(1, parseInt(searchParams.page || '1'));
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  // Build filters
  const filters: any = {};
  
  if (searchParams.courseId && searchParams.courseId.trim() !== '') {
    filters.questionBank = {
      courseId: searchParams.courseId
    };
  }
  
  if (searchParams.type && searchParams.type.trim() !== '') {
    filters.type = searchParams.type;
  }
  
  if (searchParams.difficulty && searchParams.difficulty.trim() !== '') {
    filters.difficulty = searchParams.difficulty;
  }
  
  if (searchParams.search && searchParams.search.trim() !== '') {
    filters.text = {
      contains: searchParams.search.trim(),
      mode: 'insensitive'
    };
  }

  // Get questions with pagination
  const [questions, totalQuestions, courses] = await Promise.all([
    db.question.findMany({
      where: filters,
      include: {
        options: true,
        questionBank: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
            chapter: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        passage: {
          select: {
            id: true,
            title: true,
            content: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: pageSize,
    }),
    db.question.count({ where: filters }),
    db.course.findMany({
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        title: 'asc',
      },
    }),
  ]);

  const totalPages = Math.ceil(totalQuestions / pageSize);

  return (
    <div className="p-6 space-y-6">
      {/* Header with navigation */}
      <div className="space-y-4">
        <Link 
          href="/teacher/questions-bank" 
          className="inline-flex items-center text-sm transition hover:opacity-75 font-arabic"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          العودة إلى بنك الأسئلة
        </Link>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-arabic">
            استكشاف الأسئلة
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300 font-arabic">
            تصفح وإدارة جميع الأسئلة في النظام
          </p>
        </div>
      </div>

      <QuestionsExplorer
        questions={questions}
        courses={courses}
        currentPage={page}
        totalPages={totalPages}
        totalQuestions={totalQuestions}
        filters={{
          courseId: searchParams.courseId || '',
          type: searchParams.type || '',
          difficulty: searchParams.difficulty || '',
          search: searchParams.search || '',
        }}
      />
    </div>
  );
};

export default ExploreQuestionsPage; 