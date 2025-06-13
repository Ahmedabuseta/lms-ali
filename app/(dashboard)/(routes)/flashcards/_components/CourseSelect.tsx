'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Course { id: string;
  title: string; }

interface CourseSelectProps { courses: Course[]; }

export default function CourseSelect({ courses }: CourseSelectProps) { const router = useRouter();
  const searchParams = useSearchParams();
  const currentCourseId = searchParams?.get('courseId');

  const handleCourseChange = (courseId: string) => {
    router.push(`/flashcards?courseId=${courseId }`);
  };

  return (
    <Card className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="text-slate-900 dark:text-slate-100">Select Course</CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400">
          Choose a course to view its flashcards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={currentCourseId || undefined} onValueChange={handleCourseChange}>
          <SelectTrigger className="w-full border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem
                key={course.id}
                value={course.id}
                className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
