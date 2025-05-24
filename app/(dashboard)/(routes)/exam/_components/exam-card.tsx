'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, File, FileQuestion } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ExamCardProps {
  exam: any;
}

export function ExamCard({ exam }: ExamCardProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Set isMounted to true once component is mounted to avoid hydration mismatches
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Return a skeleton version without interactive elements during SSR
    return (
      <Card className="flex h-full flex-col overflow-hidden">
        <CardHeader className="border-b border-border bg-slate-50 p-4 dark:bg-slate-900/50">
          <CardTitle className="flex items-center text-lg">
            <File className="ml-2 h-5 w-5 flex-shrink-0" />
            <span className="line-clamp-1 text-right">{exam.title}</span>
          </CardTitle>
          <CardDescription>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="line-clamp-1 text-right">
                الكورس: {exam.course.title}
                {exam.chapter && ` • الفصل: ${exam.chapter.title}`}
              </span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow p-4">
          <p className="line-clamp-3 text-right text-sm text-foreground/80 dark:text-foreground/70">
            {exam.description || 'مفيش وصف متاح للامتحان ده.'}
          </p>
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <Badge variant="outline" className="flex items-center gap-1 border-border text-xs">
              <FileQuestion className="ml-1 h-3 w-3" />
              {exam._count?.questions || 0} سؤال
            </Badge>
            {exam.timeLimit && (
              <Badge variant="outline" className="flex items-center gap-1 border-border text-xs">
                <Clock className="ml-1 h-3 w-3" />
                {exam.timeLimit} دقيقة
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="mt-auto border-t border-border bg-slate-50 p-4 dark:bg-slate-900/50">
          <div className="h-10 w-full rounded-md bg-primary/20 dark:bg-primary/10"></div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="border-b border-border bg-slate-50 p-4 dark:bg-slate-900/50">
        <CardTitle className="flex items-center text-lg">
          <File className="ml-2 h-5 w-5 flex-shrink-0" />
          <span className="line-clamp-1 text-right">{exam.title}</span>
        </CardTitle>
        <CardDescription>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="line-clamp-1 text-right">
              الكورس: {exam.course.title}
              {exam.chapter && ` • الفصل: ${exam.chapter.title}`}
            </span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <p className="line-clamp-3 text-right text-sm text-foreground/80 dark:text-foreground/70">
          {exam.description || 'مفيش وصف متاح للامتحان ده.'}
        </p>
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <Badge variant="outline" className="flex items-center gap-1 border-border text-xs">
            <FileQuestion className="ml-1 h-3 w-3" />
            {exam._count?.questions || 0} سؤال
          </Badge>
          {exam.timeLimit && (
            <Badge variant="outline" className="flex items-center gap-1 border-border text-xs">
              <Clock className="ml-1 h-3 w-3" />
              {exam.timeLimit} دقيقة
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="mt-auto border-t border-border bg-slate-50 p-4 dark:bg-slate-900/50">
        <Button asChild className="w-full">
          <Link href={`/exam/${exam.id}`}>ابدأ الامتحان</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
