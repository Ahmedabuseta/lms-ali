'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-helpers';

// Get Dashboard Statistics (Student Only)
export async function getDashboardStats() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    // Student statistics only
    const [enrolledCourses, completedCourses, examAttempts, averageScore, recentProgress] = await Promise.all([
      db.course.count({
        where: {
          chapters: {
            some: {
              userProgress: {
                some: {
                  userId: user.id,
                },
              },
            },
          },
        },
      }),
      db.course.count({
        where: {
          chapters: {
            every: {
              userProgress: {
                some: {
                  userId: user.id,
                  isCompleted: true,
                },
              },
            },
          },
        },
      }),
      db.examAttempt.count({
        where: { userId: user.id },
      }),
      db.examAttempt.aggregate({
        where: { 
          userId: user.id,
          isCompleted: true,
        },
        _avg: {
          score: true,
        },
      }),
      db.userProgress.findMany({
        where: { userId: user.id },
        include: {
          chapter: {
            include: {
              course: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      success: true,
      data: {
        enrolledCourses,
        completedCourses,
        examAttempts,
        averageScore: Math.round(averageScore._avg.score || 0),
        recentActivity: recentProgress.map(progress => ({
          type: 'progress',
          title: `${progress.chapter.course.title} - ${progress.chapter.title}`,
          date: progress.updatedAt,
          completed: progress.isCompleted,
        })),
      },
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء جلب الإحصائيات' 
    };
  }
}

// Mark Chapter Complete (Student Action)
export async function markChapterComplete(chapterId: string) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    await db.userProgress.upsert({
      where: {
        userId_chapterId: {
          userId: user.id,
          chapterId,
        },
      },
      update: {
        isCompleted: true,
      },
      create: {
        userId: user.id,
        chapterId,
        isCompleted: true,
      },
    });

    revalidatePath('/dashboard');
    
    return { success: true };
  } catch (error) {
    console.error('Error marking chapter complete:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث التقدم' 
    };
  }
}

// Get Quick Actions Data (Student Only)
export async function getQuickActionsData() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    const [inProgressCourses, availableExams] = await Promise.all([
      db.course.findMany({
        where: {
          isPublished: true,
          chapters: {
            some: {
              userProgress: {
                some: {
                  userId: user.id,
                  isCompleted: false,
                },
              },
            },
          },
        },
        include: {
          chapters: {
            where: {
              userProgress: {
                some: {
                  userId: user.id,
                  isCompleted: false,
                },
              },
            },
            take: 1,
          },
        },
        take: 5,
      }),
      db.exam.findMany({
        where: {
          isPublished: true,
          course: {
            isPublished: true,
          },
        },
        include: {
          course: true,
          _count: {
            select: {
              attempts: {
                where: {
                  userId: user.id,
                },
              },
            },
          },
        },
        take: 5,
      }),
    ]);

    return {
      success: true,
      data: {
        inProgressCourses,
        availableExams,
      },
    };
  } catch (error) {
    console.error('Error getting quick actions data:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء جلب البيانات' 
    };
  }
}

// Enroll in Course (Student Action)
export async function enrollInCourse(courseId: string) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    // Check if course exists and is published
    const course = await db.course.findFirst({
      where: {
        id: courseId,
        isPublished: true,
      },
      include: {
        chapters: {
          where: { isPublished: true },
          orderBy: { position: 'asc' },
          take: 1,
        },
      },
    });

    if (!course) {
      throw new Error('الدورة غير متاحة');
    }

    // Create progress for the first chapter
    if (course.chapters.length > 0) {
      await db.userProgress.upsert({
        where: {
          userId_chapterId: {
            userId: user.id,
            chapterId: course.chapters[0].id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          chapterId: course.chapters[0].id,
          isCompleted: false,
        },
      });
    }

    revalidatePath('/dashboard');
    revalidatePath('/search');
    
    return { success: true };
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء التسجيل في الدورة' 
    };
  }
} 