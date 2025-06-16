import { getCurrentUser } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { PracticeModeSelection } from './_components/practice-mode-selection';

interface PracticePageProps {
  params: {
    courseId: string;
  };
}

const PracticePage = async ({ params }: PracticePageProps) => {
  const user = await getCurrentUser();

  if (!user) {
    return redirect('/sign-in');
  }

  // Get course with all necessary relations
  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
      isPublished: true,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        include: {
          questionBanks: {
            where: {
              isActive: true,
            },
            include: {
              questions: {
                where: {
                  isActive: true,
                },
                select: {
                  id: true,
                  points: true,
                },
              },
              _count: {
                select: {
                  questions: true,
                },
              },
            },
          },
        },
        orderBy: {
          position: 'asc',
        },
      },
    },
  });

  if (!course) {
    return redirect('/dashboard');
  }

  // Get comprehensive practice stats for the user with time tracking
  const practiceAttempts = await db.practiceAttempt.findMany({
    where: {
      userId: user.id,
      question: {
        questionBank: {
          courseId: params.courseId,
        },
      },
    },
    include: {
      question: {
        include: {
          questionBank: {
            select: {
              chapterId: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Calculate time-based statistics
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentAttempts = practiceAttempts.filter(attempt => 
    new Date(attempt.createdAt) >= oneWeekAgo
  );

  const monthlyAttempts = practiceAttempts.filter(attempt => 
    new Date(attempt.createdAt) >= oneMonthAgo
  );

  // Calculate total time spent (in minutes)
  const totalTimeSpent = practiceAttempts.reduce(
    (sum, attempt) => sum + (attempt.timeSpent || 0), 
    0
  ) / 60; // Convert seconds to minutes

  // Calculate average time per question
  const averageTimePerQuestion = practiceAttempts.length > 0 
    ? totalTimeSpent / practiceAttempts.length 
    : 0;

  // Get practice sessions (group by date)
  const practiceSessionsByDate = practiceAttempts.reduce((acc, attempt) => {
    const date = new Date(attempt.createdAt).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(attempt);
    return acc;
  }, {} as Record<string, typeof practiceAttempts>);

  const totalPracticeSessions = Object.keys(practiceSessionsByDate).length;

  // Calculate stats per chapter with real data and time tracking
  const chaptersWithStats = course.chapters.map(chapter => {
    // Get total questions for this chapter
    const totalQuestions = chapter.questionBanks.reduce(
      (sum, qb) => sum + qb._count.questions,
      0
    );

    // Get all question IDs for this chapter
    const chapterQuestionIds = chapter.questionBanks.flatMap(qb => 
      qb.questions.map(q => q.id)
    );

    // Filter practice attempts for this chapter
    const chapterAttempts = practiceAttempts.filter(attempt =>
      chapterQuestionIds.includes(attempt.questionId)
    );

    // Calculate unique questions attempted
    const uniqueQuestionsAttempted = new Set(
      chapterAttempts.map(attempt => attempt.questionId)
    ).size;

    // Calculate correct attempts
    const correctAttempts = chapterAttempts.filter(attempt => attempt.isCorrect).length;
    
    // Calculate average score as percentage
    const averageScore = chapterAttempts.length > 0 
      ? (correctAttempts / chapterAttempts.length) * 100 
      : 0;

    // Calculate total points earned vs possible
    const totalPointsEarned = chapterAttempts.reduce(
      (sum, attempt) => sum + (attempt.pointsEarned || 0), 
      0
    );

    // Calculate time spent on this chapter (in minutes)
    const chapterTimeSpent = chapterAttempts.reduce(
      (sum, attempt) => sum + (attempt.timeSpent || 0), 
      0
    ) / 60;

    // Calculate completion percentage
    const completionPercentage = totalQuestions > 0 
      ? (uniqueQuestionsAttempted / totalQuestions) * 100 
      : 0;

    return {
      id: chapter.id,
      title: chapter.title,
      description: chapter.description,
      position: chapter.position,
      totalQuestions,
      practiceCount: chapterAttempts.length,
      uniqueQuestionsAttempted,
      correctAttempts,
      averageScore: Math.round(averageScore),
      totalPointsEarned,
      timeSpent: Math.round(chapterTimeSpent),
      completionPercentage: Math.round(completionPercentage),
      hasPractice: totalQuestions > 0,
    };
  });

  // Calculate overall course stats with real data and enhanced metrics
  const totalAttempts = practiceAttempts.length;
  const totalCorrectAttempts = practiceAttempts.filter(attempt => attempt.isCorrect).length;
  const overallAverageScore = totalAttempts > 0 
    ? (totalCorrectAttempts / totalAttempts) * 100 
    : 0;

  // Calculate streak (consecutive days with practice)
  const sortedDates = Object.keys(practiceSessionsByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
  
  let currentStreak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
  
  if (sortedDates.includes(today) || sortedDates.includes(yesterday)) {
    let checkDate = new Date();
    if (!sortedDates.includes(today)) {
      checkDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }
    
    while (sortedDates.includes(checkDate.toDateString())) {
      currentStreak++;
      checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
    }
  }

  const courseStats = {
    totalChapters: chaptersWithStats.length,
    totalQuestions: chaptersWithStats.reduce((sum, c) => sum + c.totalQuestions, 0),
    practicedChapters: chaptersWithStats.filter(c => c.practiceCount > 0).length,
    totalAttempts: totalAttempts,
    averageScore: Math.round(overallAverageScore),
    totalPointsEarned: practiceAttempts.reduce((sum, attempt) => sum + (attempt.pointsEarned || 0), 0),
    uniqueQuestionsAttempted: new Set(practiceAttempts.map(attempt => attempt.questionId)).size,
    totalTimeSpent: Math.round(totalTimeSpent),
    averageTimePerQuestion: Math.round(averageTimePerQuestion * 100) / 100,
    totalPracticeSessions: totalPracticeSessions,
    recentAttempts: recentAttempts.length,
    monthlyAttempts: monthlyAttempts.length,
    currentStreak: currentStreak,
    lastPracticeDate: practiceAttempts.length > 0 ? practiceAttempts[0].createdAt : null,
  };

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
