import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import CourseNavbar from './_components/course-navbar';
import { getProgress } from '@/actions/get-progress';

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseId: string };
}) {
  const { userId } = auth();
  if (!userId) {
    return redirect('/');
  }

  const course = await db.course.findUnique({
    where: { id: params.courseId },
    include: {
      chapters: {
        where: { isPublished: true },
        include: { userProgress: { where: { userId } } },
        orderBy: { position: 'asc' },
      },
    },
  });

  if (!course) {
    return redirect('/');
  }

  const progressCount = await getProgress(userId, course.id);

  return (
    <div className="h-full bg-background text-foreground">
      {/* Top Navigation Bar */}
      <div className="fixed inset-x-0 top-0 z-50 h-16 border-b border-border bg-background/95 backdrop-blur-sm">
        <CourseNavbar course={course} progressCount={progressCount} />
      </div>

      {/* Main Content */}
      <main className="h-full pt-16">
        {children}
      </main>
    </div>
  );
}
