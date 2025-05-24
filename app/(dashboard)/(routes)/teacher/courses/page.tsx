import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { DataTable } from './_component/data-table';
import { columns } from './_component/columns';

export default async function Courses() {
  const { userId } = auth();

  if (!userId) {
    return redirect('/');
  }

  const courses = await db.course.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Enhanced decorative elements for both themes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-10 top-20 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/5 blur-3xl dark:from-blue-400/10 dark:to-indigo-400/5"></div>
        <div
          className="absolute bottom-1/4 left-20 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/5 blur-3xl dark:from-purple-400/10 dark:to-pink-400/5"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      <div className="relative z-10 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">إدارة الدورات</h1>
            <p className="text-muted-foreground">قم بإدارة وتحرير جميع دوراتك</p>
          </div>
        </div>

        <div className="rounded-lg border border-border/50 bg-card/60 shadow-lg backdrop-blur-sm">
          <DataTable columns={columns} data={courses} />
        </div>
      </div>
    </div>
  );
}
