import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Clock, File, FileQuestion, MoreHorizontal, Pencil, ChevronRight } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default async function TeacherExamPage() {
  const { userId } = auth()
  
  if (!userId) {
    return redirect('/')
  }

  // Get all courses created by this teacher
  const courses = await db.course.findMany({
    where: {
      //createdById: userId,
    },
    include: {
      exams: {
        include: {
          _count: {
            select: { questions: true }
          }
        }
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Group exams by course
  const coursesWithExams = courses.map(course => ({
    ...course,
    examCount: course.exams.length
  }))
  
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Exams Management</h1>
        <Button asChild>
          <Link href="/teacher/exam/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Exam
          </Link>
        </Button>
      </div>
      
      <div className="space-y-6">
        {coursesWithExams.length === 0 && (
          <div className="flex h-60 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
            <div className="rounded-full bg-slate-100 p-3">
              <FileQuestion className="h-6 w-6 text-slate-500" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No courses found</h3>
            <p className="mt-2 text-sm text-slate-500">
              You need to create a course before you can create exams.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/teacher/courses/create">Create a Course</Link>
            </Button>
          </div>
        )}

        {coursesWithExams.map((course) => (
          <div key={course.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{course.title}</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/teacher/exam/course/${course.id}`}>
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            {course.examCount === 0 ? (
              <Card>
                <CardContent className="flex h-32 flex-col items-center justify-center p-6 text-center">
                  <p className="text-sm text-slate-500">
                    No exams have been created for this course yet.
                  </p>
                  <Button variant="ghost" size="sm" className="mt-2" asChild>
                    <Link href={`/teacher/exam/create?courseId=${course.id}`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Exam
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {course.exams.slice(0, 6).map((exam) => (
                  <Card key={exam.id} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{exam.title}</CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-4 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/teacher/exam/${exam.id}`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Exam
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardDescription className="line-clamp-2 text-xs">
                        {exam.description || "No description provided"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <FileQuestion className="h-3 w-3" />
                          {exam._count.questions} questions
                        </Badge>
                        {exam.timeLimit && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {exam.timeLimit} minutes
                          </Badge>
                        )}
                        <Badge
                          className={cn(
                            'ml-auto',
                            exam.isPublished ? 'bg-green-600' : 'bg-slate-500'
                          )}
                        >
                          {exam.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t bg-slate-50 p-2">
                      <Button variant="ghost" className="w-full" asChild>
                        <Link href={`/teacher/exam/${exam.id}`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Manage Exam
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}