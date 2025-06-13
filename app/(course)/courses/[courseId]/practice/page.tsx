import { getCurrentUser } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { PracticeModeSelection } from './_components/practice-mode-selection';

interface PracticePageProps { params: {
    courseId: string; };
}

const PracticePage = async ({ params }: PracticePageProps) => { const user = await getCurrentUser();

  if (!user) {
    return redirect('/sign-in');
  }

  const course = await db.course.findUnique({ where: {
      id: params.courseId,
      isPublished: true, },
    include: { chapters: {
        where: {
          isPublished: true, },
        include: { questionBanks: {
            include: {
              questions: {
                select: {
                  id: true,
                  points: true,
                },
              },
              _count: {
                select: {
                  questions: true, },
              },
            },
          },
        },
        orderBy: { position: 'asc', },
      },
    },
  });

  if (!course) {
    return redirect('/dashboard');
  }

  // Get user's practice stats
  const practiceStats = await db.practiceAttempt.groupBy({ by: ['questionId'],
    where: {
      userId: user.id,
      question: {
        questionBank: {
          courseId: params.courseId, },
      },
    },
    _count: { questionId: true, },
    _sum: { score: true, },
  });

  // Calculate stats per chapter
  const chaptersWithStats = course.chapters.map(chapter => { const totalQuestions = chapter.questionBanks.reduce(
      (sum, qb) => sum + qb._count.questions,
      0
    );

    // Calculate practice count and performance for this chapter
    const chapterQuestions = chapter.questionBanks.flatMap(qb => qb.questions);
    const chapterAttempts = practiceStats.filter(stat =>
      chapterQuestions.some(q => q.id === stat.questionId)
    );

    const practiceCount = chapterAttempts.length;
    const totalScore = chapterAttempts.reduce((sum, stat) => sum + (stat._sum.score || 0), 0);
    const averageScore = practiceCount > 0 ? totalScore / practiceCount : 0;

    return {
      id: chapter.id,
      title: chapter.title,
      description: chapter.description,
      position: chapter.position,
      totalQuestions,
      practiceCount,
      averageScore,
      hasPractice: totalQuestions > 0, };
  });

  // Calculate overall course stats
  const courseStats = { totalChapters: chaptersWithStats.length,
    totalQuestions: chaptersWithStats.reduce((sum, c) => sum + c.totalQuestions, 0),
    practicedChapters: chaptersWithStats.filter(c => c.practiceCount > 0).length,
    totalAttempts: chaptersWithStats.reduce((sum, c) => sum + c.practiceCount, 0),
    averageScore: chaptersWithStats.reduce((sum, c) => sum + c.averageScore, 0) /
      (chaptersWithStats.filter(c => c.practiceCount > 0).length || 1), };

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          تدرب - {course.title}
        </h1>
        <p className="text-gray-600">
          اختر نوع التدريب المناسب لك
        </p>
      </div>

      <PracticeModeSelection
        courseId={params.courseId}
        chapters={chaptersWithStats}
        courseStats={courseStats}
      />
    </div>
  );
};

export default PracticePage;
