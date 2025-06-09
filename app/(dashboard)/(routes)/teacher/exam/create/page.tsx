import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';
import { CreateExamForm } from './_components/create-exam-form';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface PageProps {
  searchParams: {
    courseId?: string;
    chapterId?: string;
  };
}

export default async function CreateExamPage({ searchParams }: PageProps) {
  const { userId } = auth();

  if (!userId) {
    return redirect('/');
  }

  // Get all courses created by this teacher
  const courses = await db.course.findMany({
    where: {},
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      title: true,
      chapters: {
        where: {
          isPublished: true,
        },
        select: {
          id: true,
          title: true,
        },
        orderBy: {
          position: 'asc',
        },
      },
    },
  });

  if (courses.length === 0) {
    return redirect('/teacher/courses/create');
  }

  let chapters: { id: string; title: string }[] = [];
  const selectedCourse = searchParams.courseId
    ? courses.find((course) => course.id === searchParams.courseId)
    : courses[0];

  if (selectedCourse) {
    chapters = selectedCourse.chapters;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center">
          <Button variant="ghost" asChild className="mr-2">
            <Link href="/teacher/exam">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Exams
            </Link>
          </Button>
        </div>
        <h1 className="mt-4 text-2xl font-bold">Create Exam</h1>
        <p className="text-sm text-slate-600">Create a new exam for your course</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <CreateExamForm
            courses={courses}
            selectedCourseId={selectedCourse?.id}
            chapters={chapters}
            selectedChapterId={searchParams.chapterId}
          />
        </div>

        <div className="space-y-6">
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Quick Tips</AlertTitle>
            <AlertDescription className="text-sm text-blue-700">
              <ul className="mt-2 list-disc space-y-2 pl-4">
                <li>Give your exam a clear, descriptive title</li>
                <li>Set a reasonable time limit for the complexity of your questions</li>
                <li>You can optionally associate the exam with a specific chapter</li>
                <li>After creating the exam, you'll be able to add questions</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Creating an Effective Exam</CardTitle>
              <CardDescription>Best practices for exam creation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium">1. Define Clear Learning Objectives</h3>
                <p className="text-slate-600">
                  Ensure your exam aligns with the learning outcomes of your course or chapter.
                </p>
              </div>
              <div>
                <h3 className="font-medium">2. Balance Question Types</h3>
                <p className="text-slate-600">
                  Include a mix of true/false and multiple-choice questions to test different levels of understanding.
                </p>
              </div>
              <div>
                <h3 className="font-medium">3. Set Appropriate Difficulty</h3>
                <p className="text-slate-600">
                  Vary the difficulty of questions to challenge students while ensuring the exam is fair.
                </p>
              </div>
              <div>
                <h3 className="font-medium">4. Review and Test</h3>
                <p className="text-slate-600">
                  Double-check all questions and answers for clarity and accuracy before publishing.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
