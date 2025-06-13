import { Category, Course } from '@prisma/client';
import { db } from '@/lib/db';
import { getProgress } from './get-progress';

export type CourseWithProgressAndCategory = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress: number | null;
  chaptersLength: number;
};

type GetCoursesArgs = {
  userId: string;
  title?: string;
  categoryId?: string;
};

export async function getCourses({
  userId,
  title,
  categoryId,
}: GetCoursesArgs): Promise<CourseWithProgressAndCategory[]> {
  try {
    const courses = await db.course.findMany({
      where: { isPublished: true, title: { contains: title }, categoryId },
      include: {
        category: true,
        chapters: { where: { isPublished: true }, select: { id: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const coursesWithProgress: CourseWithProgressAndCategory[] = await Promise.all(
      courses.map(async (course) => {
        if (course.length === 0) {
          return {
            ...course,
            progress: null,
            chaptersLength: course.chapters.length,
          };
        }

        const progressPercentage = await getProgress(userId, course.id);
        return {
          ...course,
          progress: progressPercentage,
          chaptersLength: course.chapters.length,
        };
      }),
    );

    return coursesWithProgress;
  } catch {
    return [];
  }
}
