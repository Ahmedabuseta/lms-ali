import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { FlashcardsClient } from './_components/flashcards-client';
import { db } from '@/lib/db';

const TeacherFlashcardsPage = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect('/');
  }

  // Fetch courses created by the teacher
  const courses = await db.course.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Enhanced decorative elements for both themes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-10 top-20 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-orange-500/10 to-red-500/5 blur-3xl dark:from-orange-400/10 dark:to-red-400/5" />
        <div
          className="absolute bottom-1/4 left-20 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-red-500/10 to-pink-500/5 blur-3xl dark:from-red-400/10 dark:to-pink-400/5"
          style={{ animationDelay: '2s' }}
         />
        <div
          className="absolute right-1/3 top-1/2 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/5 blur-3xl dark:from-amber-400/10 dark:to-orange-400/5"
          style={{ animationDelay: '4s' }}
         />
      </div>

      <div className="relative z-10 p-6">
        <FlashcardsClient courses={courses} />
      </div>
    </div>
  );
};

export default TeacherFlashcardsPage;
