'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, FileQuestion, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CourseWithQuestionsCount } from '../types'

interface CourseQuestionsListProps {
  course: CourseWithQuestionsCount
}

export const CourseQuestionsList = ({ course }: CourseQuestionsListProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const hasChaptersWithQuestions = course.chapters.some(
    (chapter) => chapter._count.PracticeQuestion > 0
  )

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <Card>
      <CardHeader 
        className="p-4 flex flex-row items-center justify-between cursor-pointer"
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <h3 className="font-semibold">{course.title}</h3>
          <Badge variant="secondary">
            {course.questionCount} question{course.questionCount !== 1 ? 's' : ''}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/teacher/questions-bank/create?courseId=${course.id}`}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Link>
        </Button>
      </CardHeader>
      {isExpanded && hasChaptersWithQuestions && (
        <CardContent className="pt-0 pb-4">
          <div className="space-y-2 pl-6">
            {course.chapters
              .filter((chapter) => chapter._count.PracticeQuestion > 0)
              .map((chapter) => (
                <div key={chapter.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileQuestion className="h-4 w-4 text-slate-500" />
                    <span>{chapter.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {chapter._count.PracticeQuestion} question{chapter._count.PracticeQuestion !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/teacher/questions-bank/course/${course.id}/chapter/${chapter.id}`}>
                      View
                    </Link>
                  </Button>
                </div>
              ))}
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-medium">Questions not assigned to chapters</span>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/teacher/questions-bank/course/${course.id}`}>
                  View All
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}