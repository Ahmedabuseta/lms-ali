'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Chapter {
  id: string;
  title: string;
}

interface ChapterSelectProps {
  chapters: Chapter[];
  courseId: string;
}

export default function ChapterSelect({ chapters, courseId }: ChapterSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentChapterId = searchParams?.get('chapterId');

  const handleChapterChange = (chapterId: string) => {
    if (chapterId === 'all') {
      router.push(`/flashcards?courseId=${courseId}`);
    } else {
      router.push(`/flashcards?courseId=${courseId}&chapterId=${chapterId}`);
    }
  };

  return (
    <Card className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="text-slate-900 dark:text-slate-100">Select Chapter</CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400">
          Choose a specific chapter or view all
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={currentChapterId || 'all'} onValueChange={handleChapterChange}>
          <SelectTrigger className="w-full border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <SelectValue placeholder="Select a chapter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
              All Chapters
            </SelectItem>
            {chapters.map((chapter) => (
              <SelectItem
                key={chapter.id}
                value={chapter.id}
                className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {chapter.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
