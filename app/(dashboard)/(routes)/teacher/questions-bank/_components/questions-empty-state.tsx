'use client';

import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const QuestionsEmptyState = () => {
  return (
    <div className="flex h-60 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
      <div className="rounded-full bg-slate-100 p-3">
        <FileQuestion className="h-6 w-6 text-slate-500" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No questions found</h3>
      <p className="mt-2 text-sm text-slate-500">You haven&apos;t created any practice questions yet.</p>
      <Button className="mt-4" asChild>
        <Link href="/teacher/questions-bank/create">Create a Question</Link>
      </Button>
    </div>
  );
};
