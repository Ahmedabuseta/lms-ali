'use client';

import { Clock, File, FileQuestion, BookOpen, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ExamCardProps { exam: any; }

export function ExamCard({ exam }: ExamCardProps) { const [isMounted, setIsMounted] = useState(false);

  // Set isMounted to true once component is mounted to avoid hydration mismatches
  useEffect(() => {
    setIsMounted(true); }, []);

  if (!isMounted) { // Return a skeleton version without interactive elements during SSR
    return (
      <Card className="group relative overflow-hidden bg-gradient-to-br from-card/80 via-card/60 to-muted/20 backdrop-blur-xl border border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardHeader className="relative border-b border-border/50 bg-muted/20 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/20 p-2 backdrop-blur-sm">
              <FileQuestion className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-foreground font-arabic line-clamp-1 text-right">
                {exam.title }
          </CardTitle>
              <CardDescription className="text-xs text-muted-foreground font-arabic line-clamp-1 text-right">
                الكورس: {exam.course.title}
                { exam.chapter && ` • الفصل: ${exam.chapter.title }`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative flex-grow p-4">
          <p className="line-clamp-3 text-right text-sm text-foreground/80 dark:text-foreground/70 font-arabic mb-4">
            {exam.description || 'مفيش وصف متاح للامتحان ده.'}
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <Badge variant="outline" className="flex items-center gap-1 border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs backdrop-blur-sm">
              <FileQuestion className="ml-1 h-3 w-3" />
              {exam._count?.questions || 0} سؤال
            </Badge>
            { exam.timeLimit && (
              <Badge variant="outline" className="flex items-center gap-1 border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300 text-xs backdrop-blur-sm">
                <Clock className="ml-1 h-3 w-3" />
                {exam.timeLimit } دقيقة
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="relative mt-auto border-t border-border/50 bg-muted/20 p-4">
          <div className="h-10 w-full rounded-lg bg-primary/20 dark:bg-primary/10 animate-pulse" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-card/80 via-card/60 to-muted/20 backdrop-blur-xl border border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardHeader className="relative border-b border-border/50 bg-muted/20 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/20 p-2 backdrop-blur-sm border border-primary/20">
            <FileQuestion className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground font-arabic line-clamp-1 text-right">
              {exam.title}
        </CardTitle>
            <CardDescription className="text-xs text-muted-foreground font-arabic line-clamp-1 text-right">
              الكورس: {exam.course.title}
              { exam.chapter && ` • الفصل: ${exam.chapter.title }`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative flex-grow p-4">
        <p className="line-clamp-3 text-right text-sm text-foreground/80 dark:text-foreground/70 font-arabic mb-4">
          {exam.description || 'مفيش وصف متاح للامتحان ده.'}
        </p>
        <div className="flex flex-wrap justify-end gap-2">
          <Badge variant="outline" className="flex items-center gap-1 border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs backdrop-blur-sm">
            <FileQuestion className="ml-1 h-3 w-3" />
            {exam._count?.questions || 0} سؤال
          </Badge>
          { exam.timeLimit && (
            <Badge variant="outline" className="flex items-center gap-1 border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300 text-xs backdrop-blur-sm">
              <Clock className="ml-1 h-3 w-3" />
              {exam.timeLimit } دقيقة
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="relative mt-auto border-t border-border/50 bg-muted/20 p-4">
        <Button asChild className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary backdrop-blur-sm border border-primary/20 shadow-lg font-arabic group">
          <Link href={`/exam/${exam.id}`}>
            ابدأ الامتحان
            <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
