'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Course {
  id: string;
  title: string;
}

interface CourseSelectProps {
  courses: Course[];
}

export default function CourseSelect({ courses }: CourseSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCourseId = searchParams.get('courseId');

  const handleCourseChange = (courseId: string) => {
    router.push(`/flashcards?courseId=${courseId}`);
  };

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-900 dark:text-slate-100">Select Course</CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400">Choose a course to view its flashcards</CardDescription>
      </CardHeader>
      <CardContent>
        <Select
          value={currentCourseId || ''}
          onValueChange={handleCourseChange}
        >
          <SelectTrigger className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
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