import { db } from "@/lib/db";

interface StartExamAttemptProps {
  userId: string;
  examId: string;
}

export async function startExamAttempt({ 
  userId, 
  examId 
}: StartExamAttemptProps) {
  try {
    // Check if there's already an active attempt
    const existingAttempt = await db.examAttempt.findFirst({
      where: {
        userId,
        examId,
        completedAt: null,
      },
    });

    if (existingAttempt) {
      return existingAttempt;
    }

    // Create a new attempt
    const attempt = await db.examAttempt.create({
      data: {
        userId,
        examId,
      },
      include: {
        exam: {
          include: {
            questions: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    return attempt;
  } catch (error) {
    console.error("[START_EXAM_ATTEMPT_ERROR]", error);
    throw new Error("Failed to start exam attempt");
  }
}

interface SubmitAnswerProps {
  userId: string;
  attemptId: string;
  questionId: string;
  optionId: string;
}

export async function submitAnswer({
  userId,
  attemptId,
  questionId,
  optionId,
}: SubmitAnswerProps) {
  try {
    // Verify the attempt belongs to the user and is active
    const attempt = await db.examAttempt.findFirst({
      where: {
        id: attemptId,
        userId,
        completedAt: null,
      },
    });

    if (!attempt) {
      throw new Error("Exam attempt not found or already completed");
    }

    // Check if the option is correct
    const option = await db.option.findUnique({
      where: {
        id: optionId,
        question: {
          id: questionId,
        },
      },
    });

    if (!option) {
      throw new Error("Option not found");
    }

    // Check if there's an existing answer for this question
    const existingAnswer = await db.questionAttempt.findFirst({
      where: {
        examAttemptId: attemptId,
        questionId,
      },
    });

    if (existingAnswer) {
      // Update existing answer
      return await db.questionAttempt.update({
        where: {
          id: existingAnswer.id,
        },
        data: {
          selectedOptionId: optionId,
          isCorrect: option.isCorrect,
        },
      });
    }

    // Create new answer
    return await db.questionAttempt.create({
      data: {
        examAttemptId: attemptId,
        questionId,
        selectedOptionId: optionId,
        isCorrect: option.isCorrect,
      },
    });
  } catch (error) {
    console.error("[SUBMIT_ANSWER_ERROR]", error);
    throw new Error("Failed to submit answer");
  }
}

interface CompleteExamProps {
  userId: string;
  attemptId: string;
}

export async function completeExam({
  userId,
  attemptId,
}: CompleteExamProps) {
  try {
    // Verify the attempt belongs to the user and is active
    const attempt = await db.examAttempt.findFirst({
      where: {
        id: attemptId,
        userId,
        completedAt: null,
      },
      include: {
        exam: {
          include: {
            questions: true,
          },
        },
        questionAttempts: true,
      },
    });

    if (!attempt) {
      throw new Error("Exam attempt not found or already completed");
    }

    // Calculate score
    const totalQuestions = attempt.exam.questions.length;
    const answeredQuestions = attempt.questionAttempts.length;
    const correctAnswers = attempt.questionAttempts.filter(a => a.isCorrect).length;
    
    // Calculate score as percentage
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Complete the attempt
    return await db.examAttempt.update({
      where: {
        id: attemptId,
      },
      data: {
        completedAt: new Date(),
        score,
      },
      include: {
        questionAttempts: {
          include: {
            question: true,
            selectedOption: true,
          },
        },
        exam: {
          include: {
            questions: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("[COMPLETE_EXAM_ERROR]", error);
    throw new Error("Failed to complete exam");
  }
}

interface GetExamAttemptProps {
  userId: string;
  attemptId: string;
}

export async function getExamAttempt({
  userId,
  attemptId,
}: GetExamAttemptProps) {
  try {
    const attempt = await db.examAttempt.findUnique({
      where: {
        id: attemptId,
        userId,
      },
      include: {
        exam: {
          include: {
            questions: {
              include: {
                options: true,
              },
              orderBy: {
                position: "asc",
              },
            },
          },
        },
        questionAttempts: {
          include: {
            question: true,
            selectedOption: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new Error("Exam attempt not found");
    }

    return attempt;
  } catch (error) {
    console.error("[GET_EXAM_ATTEMPT_ERROR]", error);
    throw new Error("Failed to get exam attempt");
  }
}

interface GetExamStatisticsProps {
  userId: string;
  examId: string;
}

export async function getExamStatistics({
  userId,
  examId,
}: GetExamStatisticsProps) {
  try {
    // Verify teacher ownership of the exam
    const exam = await db.exam.findUnique({
      where: {
        id: examId,
        course: {
          //createdById: userId,
        },
      },
      include: {
        questions: true,
      },
    });

    if (!exam) {
      throw new Error("Exam not found or unauthorized");
    }

    // Get all completed attempts for this exam
    const attempts = await db.examAttempt.findMany({
      where: {
        examId,
        completedAt: {
          not: null,
        },
      },
      include: {
        questionAttempts: true,
      },
    });

    // Calculate statistics
    const totalAttempts = attempts.length;
    
    if (totalAttempts === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0,
        questionStats: [],
        studentResults: [],
      };
    }
    
    const averageScore = Math.round(
      attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / totalAttempts
    );
    
    const scores = attempts.map(attempt => attempt.score || 0);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    
    const passCount = attempts.filter(attempt => (attempt.score || 0) >= 70).length;
    const passRate = Math.round((passCount / totalAttempts) * 100);

    // Question-specific statistics
    const questionStats = await Promise.all(
      exam.questions.map(async (question) => {
        const questionAttempts = await db.questionAttempt.count({
          where: {
            questionId: question.id,
            examAttempt: {
              completedAt: {
                not: null,
              },
            },
          },
        });

        const correctAnswers = await db.questionAttempt.count({
          where: {
            questionId: question.id,
            isCorrect: true,
            examAttempt: {
              completedAt: {
                not: null,
              },
            },
          },
        });

        const correctRate = questionAttempts > 0
          ? Math.round((correctAnswers / questionAttempts) * 100)
          : 0;

        return {
          questionId: question.id,
          text: question.text,
          correctRate,
          attemptCount: questionAttempts,
        };
      })
    );

    // Get student performance data for the table
    const studentResults = await db.examAttempt.findMany({
      where: {
        examId,
        completedAt: {
          not: null,
        },
      },
      include: {
        questionAttempts: {
          include: {
            question: true
          }
        },
      },
      orderBy: {
        score: 'desc',
      },
    });

    // Get user profiles from Clerk
    // This would usually require a Clerk API call
    // For this example, we'll simulate user data
    const studentPerformanceData = studentResults.map(attempt => {
      // Calculate time taken (in seconds)
      const startTime = new Date(attempt.startedAt);
      const endTime = new Date(attempt.completedAt || new Date());
      const timeTaken = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
      
      // Count correct answers
      const correct = attempt.questionAttempts.filter(qa => qa.isCorrect).length;
      const total = exam.questions.length;

      // In a real implementation, you'd fetch the actual user data
      // For now we'll use a placeholder with the user ID
      return {
        userId: attempt.userId,
        userName: `Student ${attempt.userId.substring(0, 5)}`,
        email: `student-${attempt.userId.substring(0, 5)}@example.com`,
        score: attempt.score || 0,
        timeTaken,
        completedAt: attempt.completedAt || new Date(),
        correct,
        total,
      };
    });

    return {
      totalAttempts,
      averageScore,
      highestScore,
      lowestScore,
      passRate,
      questionStats,
      studentResults: studentPerformanceData,
    };
  } catch (error) {
    console.error("[GET_EXAM_STATISTICS_ERROR]", error);
    throw new Error("Failed to get exam statistics");
  }
}

interface ResumeExamAttemptProps {
  userId: string;
  examId: string;
}

export async function resumeExamAttempt({
  userId,
  examId,
}: ResumeExamAttemptProps) {
  try {
    // Find the active attempt
    const activeAttempt = await db.examAttempt.findFirst({
      where: {
        userId,
        examId,
        completedAt: null,
      },
    });

    // If there's no active attempt, start a new one
    if (!activeAttempt) {
      return await startExamAttempt({ userId, examId });
    }

    return activeAttempt;
  } catch (error) {
    console.error("[RESUME_EXAM_ATTEMPT_ERROR]", error);
    throw new Error("Failed to resume exam attempt");
  }
}

interface GetExamsProps {
  userId: string;
  examId?: string;
  courseId?: string;
}

export async function getExams({
  userId,
  examId,
  courseId,
}: GetExamsProps) {
  try {
    // If examId is provided, get a specific exam
    if (examId) {
      const exam = await db.exam.findFirst({
        where: {
          id: examId,
          isPublished: true,
          OR: [
            {
              course: {
                purchases: {
                  some: {
                    userId,
                  },
                },
              },
            },
            {
              course: {
                //createdById: userId,
              },
            },
          ],
        },
        include: {
          questions: {
            include: {
              options: {
                select: {
                  id: true,
                  text: true,
                },
              },
            },
            orderBy: {
              position: "asc",
            },
          },
          course: {
            select: {
              title: true,
            },
          },
          chapter: {
            select: {
              title: true,
            },
          },
        },
      });

      if (!exam) {
        return null;
      }

      // Get active attempt if exists
      const activeAttempt = await db.examAttempt.findFirst({
        where: {
          userId,
          examId,
          completedAt: null,
        },
      });

      // Get past attempts
      const pastAttempts = await db.examAttempt.findMany({
        where: {
          userId,
          examId,
          completedAt: {
            not: null,
          },
        },
        orderBy: {
          completedAt: "desc",
        },
      });

      return {
        exam,
        activeAttempt,
        pastAttempts,
      };
    }

    // Get all exams for a course
    if (courseId) {
      const exams = await db.exam.findMany({
        where: {
          courseId,
          isPublished: true,
          OR: [
            {
              course: {
                purchases: {
                  some: {
                    userId,
                  },
                },
              },
            },
            {
              course: {
                //createdById: userId,
              },
            },
          ],
        },
        include: {
          _count: {
            select: {
              questions: true,
            },
          },
          course: {
            select: {
              title: true,
            },
          },
          chapter: {
            select: {
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return exams;
    }

    // Get all exams the user has access to
    const exams = await db.exam.findMany({
      where: {
        isPublished: true,
        OR: [
          {
            course: {
              purchases: {
                some: {
                  userId,
                },
              },
            },
          },
          {
            course: {
              //createdById: userId,
            },
          },
        ],
      },
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
        course: {
          select: {
            title: true,
          },
        },
        chapter: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return exams;
  } catch (error) {
    console.error("[GET_EXAMS_ERROR]", error);
    throw new Error("Failed to get exams");
  }
}