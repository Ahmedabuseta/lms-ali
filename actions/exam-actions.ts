import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

// Types
interface StartExamAttemptProps { userId: string;
  examId: string; }

interface SubmitAnswerProps { userId: string;
  attemptId: string;
  questionId: string;
  optionId: string; }

interface CompleteExamProps { userId: string;
  attemptId: string; }

interface GetExamAttemptProps { userId: string;
  attemptId: string; }

interface GetExamStatisticsProps { userId: string;
  examId: string; }

interface ResumeExamAttemptProps { userId: string;
  examId: string; }

interface GetExamsProps { userId: string;
  examId?: string;
  courseId?: string; }

interface ValidateExamAccessProps { userId: string;
  examId: string; }

// Utility functions
async function validateExamAccess({ userId, examId }: ValidateExamAccessProps) { const exam = await db.exam.findUnique({
    where: { id: examId, isPublished: true },
    include: { course: { select: { id: true, isPublished: true } },
      chapter: { select: { id: true, isPublished: true } },
    },
  });

  if (!exam) {
    throw new Error('Exam not found or not published');
  }

  if (!exam.course.isPublished) {
    throw new Error('Course is not published');
  }

  if (exam.chapter && !exam.chapter.isPublished) {
    throw new Error('Chapter is not published');
  }

  return exam;
}

async function calculateExamScore(attemptId: string) { const attempt = await db.examAttempt.findUnique({
    where: { id: attemptId },
    include: { exam: {
        include: {
          examQuestions: {
            include: {
              question: true, },
          },
        },
      },
      questionAttempts: { include: {
          question: true, },
      },
    },
  });

  if (!attempt) {
    throw new Error('Exam attempt not found');
  }

  const totalQuestions = attempt.exam.examQuestions.length;
  const totalPossiblePoints = attempt.exam.examQuestions.reduce(
    (sum, eq) => sum + eq.points,
    0
  );

  let totalEarnedPoints = 0;
  let correctAnswers = 0;

  for (const questionAttempt of attempt.questionAttempts) {
    if (questionAttempt.isCorrect) {
      correctAnswers++;
      // Find the points for this question in the exam
      const examQuestion = attempt.exam.examQuestions.find(
        eq => eq.questionId === questionAttempt.questionId
      );
      totalEarnedPoints += examQuestion?.points || 1;
    }
  }

  const scorePercentage = totalPossiblePoints > 0
    ? Math.round((totalEarnedPoints / totalPossiblePoints) * 100)
    : 0;

  return { score: scorePercentage,
    totalPoints: totalEarnedPoints,
    maxPoints: totalPossiblePoints,
    correctAnswers,
    totalQuestions,
    isPassed: scorePercentage >= attempt.exam.passingScore, };
}

// Main functions
export async function startExamAttempt({ userId, examId }: StartExamAttemptProps) { try {
    // Validate exam access
    const exam = await validateExamAccess({ userId, examId });

    // Check if there's already an active attempt
    const existingAttempt = await db.examAttempt.findFirst({ where: {
        userId,
        examId,
        completedAt: null, },
    });

    if (existingAttempt) { // Check if the attempt has timed out
      if (exam.timeLimit) {
        const timeElapsed = Math.floor(
          (Date.now() - existingAttempt.startedAt.getTime()) / (1000 * 60)
        );

        if (timeElapsed >= exam.timeLimit) {
          // Auto-complete the timed-out attempt
          await completeExam({ userId, attemptId: existingAttempt.id });
          // Continue to create a new attempt
        } else {
          return existingAttempt;
        }
      } else {
      return existingAttempt;
      }
    }

    // Check attempt limits
    const completedAttempts = await db.examAttempt.count({ where: {
        userId,
        examId,
        completedAt: { not: null },
      },
    });

    if (completedAttempts >= exam.maxAttempts) {
      throw new Error(`Maximum attempts (${exam.maxAttempts}) reached for this exam`);
    }

    // Create a new attempt
    const attempt = await db.examAttempt.create({ data: {
        userId,
        examId, },
      include: { exam: {
          include: {
            examQuestions: {
              include: {
                question: {
                  include: {
                    options: {
                      select: {
                        id: true,
                        text: true, },
                    },
                    passage: true,
                  },
                },
              },
              orderBy: exam.isRandomized
                ? { position: 'asc' } // Will be shuffled on client side if needed
                : { position: 'asc' },
            },
          },
        },
      },
    });

    return attempt;
  } catch (error) { console.error('[START_EXAM_ATTEMPT_ERROR]', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to start exam attempt'); }
}

export async function submitAnswer({ userId, attemptId, questionId, optionId }: SubmitAnswerProps) { try {
    // Verify the attempt belongs to the user and is active
    const attempt = await db.examAttempt.findFirst({
      where: {
        id: attemptId,
        userId,
        completedAt: null, },
      include: { exam: {
          select: {
            timeLimit: true, },
        },
      },
    });

    if (!attempt) {
      throw new Error('Exam attempt not found or already completed');
    }

    // Check if attempt has timed out
    if (attempt.exam.timeLimit) {
      const timeElapsed = Math.floor(
        (Date.now() - attempt.startedAt.getTime()) / (1000 * 60)
      );

      if (timeElapsed >= attempt.exam.timeLimit) {
        throw new Error('Exam time has expired');
      }
    }

    // Validate the option belongs to the question
    const option = await db.option.findFirst({ where: {
        id: optionId,
        questionId: questionId, },
    });

    if (!option) {
      throw new Error('Invalid option selected');
    }

    // Calculate points earned
    const examQuestion = await db.examQuestion.findFirst({ where: {
        examId: attempt.examId,
        questionId: questionId, },
    });

    const pointsEarned = option.isCorrect ? (examQuestion?.points || 1) : 0;

    // Check if there's an existing answer for this question
    const existingAnswer = await db.questionAttempt.findFirst({ where: {
        examAttemptId: attemptId,
        questionId, },
    });

    if (existingAnswer) { // Update existing answer
      return await db.questionAttempt.update({
        where: {
          id: existingAnswer.id, },
        data: { selectedOptionId: optionId,
          isCorrect: option.isCorrect,
          pointsEarned,
          answeredAt: new Date(), },
      });
    }

    // Create new answer
    return await db.questionAttempt.create({ data: {
        examAttemptId: attemptId,
        questionId,
        selectedOptionId: optionId,
        isCorrect: option.isCorrect,
        pointsEarned,
        answeredAt: new Date(), },
    });
  } catch (error) { console.error('[SUBMIT_ANSWER_ERROR]', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to submit answer'); }
}

export async function completeExam({ userId, attemptId }: CompleteExamProps) { try {
    // Verify the attempt belongs to the user and is active
    const attempt = await db.examAttempt.findFirst({
      where: {
        id: attemptId,
        userId,
        completedAt: null, },
      include: { exam: {
          include: {
            examQuestions: {
              include: {
                question: true, },
            },
          },
        },
        questionAttempts: { include: {
            question: true,
            selectedOption: true, },
        },
      },
    });

    if (!attempt) {
      throw new Error('Exam attempt not found or already completed');
    }

    // Calculate time spent
    const timeSpent = Math.floor(
      (Date.now() - attempt.startedAt.getTime()) / (1000 * 60)
    );

    // Check if timed out
    const isTimedOut = attempt.exam.timeLimit
      ? timeSpent >= attempt.exam.timeLimit
      : false;

    // Calculate score
    const scoreData = await calculateExamScore(attemptId);

    // Complete the attempt
    const completedAttempt = await db.examAttempt.update({ where: {
        id: attemptId, },
      data: { completedAt: new Date(),
        submittedAt: new Date(),
        score: scoreData.score,
        totalPoints: scoreData.totalPoints,
        maxPoints: scoreData.maxPoints,
        isPassed: scoreData.isPassed,
        timeSpent,
        isTimedOut, },
      include: { questionAttempts: {
          include: {
            question: {
              include: {
                options: true,
                passage: true, },
            },
            selectedOption: true,
          },
          orderBy: { createdAt: 'asc', },
        },
        exam: { include: {
            examQuestions: {
              include: {
                question: {
                  include: {
                    options: true,
                    passage: true, },
                },
              },
              orderBy: { position: 'asc', },
            },
          },
        },
      },
    });

    return completedAttempt;
  } catch (error) { console.error('[COMPLETE_EXAM_ERROR]', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to complete exam'); }
}

export async function getExamAttempt({ userId, attemptId }: GetExamAttemptProps) { try {
    const attempt = await db.examAttempt.findUnique({
      where: {
        id: attemptId,
        userId, },
      include: { exam: {
          include: {
            examQuestions: {
              include: {
                question: {
                  include: {
                    options: true,
                    passage: true, },
                },
              },
              orderBy: { position: 'asc', },
            },
            course: { select: {
                title: true, },
            },
            chapter: { select: {
                title: true, },
            },
          },
        },
        questionAttempts: { include: {
            question: {
          include: {
                options: true,
                passage: true, },
            },
            selectedOption: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new Error('Exam attempt not found');
    }

    // Check if attempt should be auto-completed due to timeout
    if (!attempt.completedAt && attempt.exam.timeLimit) { const timeElapsed = Math.floor(
        (Date.now() - attempt.startedAt.getTime()) / (1000 * 60)
      );

      if (timeElapsed >= attempt.exam.timeLimit) {
        // Auto-complete the attempt
        return await completeExam({ userId, attemptId });
      }
    }

    return attempt;
  } catch (error) { console.error('[GET_EXAM_ATTEMPT_ERROR]', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to get exam attempt'); }
}

export async function getExamStatistics({ userId, examId }: GetExamStatisticsProps) { try {
    // Verify exam exists and user has access (teacher check should be done in API)
    const exam = await db.exam.findUnique({
      where: {
        id: examId, },
      include: { examQuestions: {
          include: {
            question: true, },
        },
      },
    });

    if (!exam) {
      throw new Error('Exam not found');
    }

    // Get all completed attempts for this exam
    const attempts = await db.examAttempt.findMany({ where: {
        examId,
        completedAt: {
          not: null, },
      },
      include: { questionAttempts: {
          include: {
            question: true, },
        },
      },
      orderBy: { completedAt: 'desc', },
    });

    const totalAttempts = attempts.length;

    if (totalAttempts === 0) { return {
        totalAttempts: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0,
        averageTimeSpent: 0,
        questionStats: [],
        studentResults: [],
        recentAttempts: [], };
    }

    // Calculate basic statistics
    const scores = attempts.map(attempt => attempt.score || 0);
    const timeSpents = attempts.map(attempt => attempt.timeSpent || 0).filter(t => t > 0);

    const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / totalAttempts);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const passCount = attempts.filter(attempt => attempt.isPassed).length;
    const passRate = Math.round((passCount / totalAttempts) * 100);
    const averageTimeSpent = timeSpents.length > 0
      ? Math.round(timeSpents.reduce((sum, time) => sum + time, 0) / timeSpents.length)
      : 0;

    // Question-specific statistics
    const questionStats = await Promise.all(
      exam.examQuestions.map(async (examQuestion) => { const questionAttempts = await db.questionAttempt.count({
          where: {
            questionId: examQuestion.questionId,
            examAttempt: {
              examId: examId,
              completedAt: {
                not: null, },
            },
          },
        });

        const correctAnswers = await db.questionAttempt.count({ where: {
            questionId: examQuestion.questionId,
            isCorrect: true,
            examAttempt: {
              examId: examId,
              completedAt: {
                not: null, },
            },
          },
        });

        const correctRate = questionAttempts > 0
          ? Math.round((correctAnswers / questionAttempts) * 100)
          : 0;

        return { questionId: examQuestion.questionId,
          text: examQuestion.question.text.substring(0, 100) + '...',
          correctRate,
          attemptCount: questionAttempts,
          difficulty: examQuestion.question.difficulty,
          points: examQuestion.points, };
      })
    );

    // Recent attempts for activity feed
    const recentAttempts = attempts.slice(0, 10).map(attempt => ({ id: attempt.id,
        userId: attempt.userId,
      score: attempt.score,
      isPassed: attempt.isPassed,
      timeSpent: attempt.timeSpent,
      completedAt: attempt.completedAt,
      isTimedOut: attempt.isTimedOut, }));

    return { totalAttempts,
      averageScore,
      highestScore,
      lowestScore,
      passRate,
      averageTimeSpent,
      questionStats,
      studentResults: attempts.map(attempt => ({
        userId: attempt.userId,
        score: attempt.score,
        isPassed: attempt.isPassed,
        timeSpent: attempt.timeSpent,
        completedAt: attempt.completedAt,
        correctAnswers: attempt.questionAttempts.filter(qa => qa.isCorrect).length,
        totalQuestions: exam.examQuestions.length, })),
      recentAttempts,
    };
  } catch (error) { console.error('[GET_EXAM_STATISTICS_ERROR]', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to get exam statistics'); }
}

export async function resumeExamAttempt({ userId, examId }: ResumeExamAttemptProps) { try {
    // Find the active attempt
    const activeAttempt = await db.examAttempt.findFirst({
      where: {
        userId,
        examId,
        completedAt: null, },
      include: { exam: {
          select: {
            timeLimit: true, },
        },
      },
    });

    // If there's no active attempt, start a new one
    if (!activeAttempt) { return await startExamAttempt({ userId, examId });
    }

    // Check if the attempt has timed out
    if (activeAttempt.exam.timeLimit) { const timeElapsed = Math.floor(
        (Date.now() - activeAttempt.startedAt.getTime()) / (1000 * 60)
      );

      if (timeElapsed >= activeAttempt.exam.timeLimit) {
        // Auto-complete the timed-out attempt and start a new one
        await completeExam({ userId, attemptId: activeAttempt.id });
      return await startExamAttempt({ userId, examId });
      }
    }

    return activeAttempt;
  } catch (error) { console.error('[RESUME_EXAM_ATTEMPT_ERROR]', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to resume exam attempt'); }
}

export async function getExams({ userId, examId, courseId }: GetExamsProps) { try {
    // If examId is provided, get a specific exam
    if (examId) {
      const exam = await db.exam.findFirst({
        where: {
          id: examId,
          isPublished: true, },
        include: { examQuestions: {
            include: {
              question: {
                include: {
                  options: {
                    select: {
                      id: true,
                      text: true, },
                  },
                  passage: true,
                },
              },
            },
            orderBy: { position: 'asc', },
          },
          course: { select: {
              id: true,
              title: true, },
          },
          chapter: { select: {
              id: true,
              title: true, },
          },
        },
      });

      if (!exam) {
        return null;
      }

      // Get active attempt if exists
      const activeAttempt = await db.examAttempt.findFirst({ where: {
          userId,
          examId,
          completedAt: null, },
        orderBy: { startedAt: 'desc', },
      });

      // Get past attempts
      const pastAttempts = await db.examAttempt.findMany({ where: {
          userId,
          examId,
          completedAt: {
            not: null, },
        },
        orderBy: { completedAt: 'desc', },
        take: 10, // Limit to recent attempts
      });

      return { exam,
        activeAttempt,
        pastAttempts, };
    }

    // Get all exams for a course or all accessible exams
    const where: Prisma.ExamWhereInput = { isPublished: true, };

    if (courseId) {
      where.courseId = courseId;
    }

    const exams = await db.exam.findMany({ where,
      include: {
        _count: {
          select: {
            examQuestions: true, },
        },
        course: { select: {
            id: true,
            title: true, },
        },
        chapter: { select: {
            id: true,
            title: true, },
        },
      },
      orderBy: { createdAt: 'desc', },
    });

    return { exams };
  } catch (error) { console.error('[GET_EXAMS_ERROR]', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to get exams'); }
}

// Additional utility functions
export async function getExamProgress(userId: string, examId: string) { try {
    const activeAttempt = await db.examAttempt.findFirst({
      where: {
        userId,
        examId,
        completedAt: null, },
      include: { exam: {
          include: {
            examQuestions: true, },
        },
        questionAttempts: true,
      },
    });

    if (!activeAttempt) {
      return null;
    }

    const totalQuestions = activeAttempt.exam.examQuestions.length;
    const answeredQuestions = activeAttempt.questionAttempts.length;
    const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

    return { attemptId: activeAttempt.id,
      totalQuestions,
      answeredQuestions,
      progress: Math.round(progress),
      startedAt: activeAttempt.startedAt,
      timeLimit: activeAttempt.exam.timeLimit, };
  } catch (error) { console.error('[GET_EXAM_PROGRESS_ERROR]', error);
    return null; }
}

export async function validateExamAttempt(userId: string, attemptId: string) { try {
    const attempt = await db.examAttempt.findFirst({
      where: {
        id: attemptId,
        userId, },
      include: { exam: {
          select: {
            timeLimit: true,
            isPublished: true, },
        },
      },
    });

    if (!attempt) { return { valid: false, reason: 'Attempt not found' };
    }

    if (!attempt.exam.isPublished) { return { valid: false, reason: 'Exam is not published' };
    }

    if (attempt.completedAt) { return { valid: false, reason: 'Attempt already completed' };
    }

    // Check timeout
    if (attempt.exam.timeLimit) { const timeElapsed = Math.floor(
        (Date.now() - attempt.startedAt.getTime()) / (1000 * 60)
      );

      if (timeElapsed >= attempt.exam.timeLimit) {
        return { valid: false, reason: 'Time limit exceeded' };
      }
    }

    return { valid: true };
  } catch (error) { console.error('[VALIDATE_EXAM_ATTEMPT_ERROR]', error);
    return { valid: false, reason: 'Validation failed' };
  }
}
