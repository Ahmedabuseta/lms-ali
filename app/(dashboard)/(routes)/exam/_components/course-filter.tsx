'use client';

import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CourseFilterProps { courses: any[];
  currentCourseId?: string; }

export function CourseFilter({ courses, currentCourseId }: CourseFilterProps) {
  const router = useRouter();

  return (
    <Select
      defaultValue={currentCourseId}
      onValueChange={(value) => {
        if (value === 'all') {
          router.push('/exam');
        } else {
          router.push(`/exam?courseId=${value}`);
        }
      }}
    >
      <SelectTrigger className="mt-2">
        <SelectValue placeholder="All courses" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All courses</SelectItem>
        {courses.map((course) => (
          <SelectItem key={course.id} value={course.id}>
            {course.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
