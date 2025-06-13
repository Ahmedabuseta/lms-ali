'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, FileQuestion, Plus, BookOpen, Target, Eye } from 'lucide-react';
import { CourseWithQuestionsCount } from '../types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CourseQuestionsListProps {
  course: CourseWithQuestionsCount;
}

export const CourseQuestionsList = ({ course }: CourseQuestionsListProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasChaptersWithQuestions = course.chapters.some((chapter) => chapter._count.questions > 0);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 dark:bg-gray-800 dark:border-gray-700">
      <CardHeader
        className="flex cursor-pointer flex-row items-center justify-between p-6 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 transition-colors duration-200">
            {isExpanded ? <ChevronDown className="h-5 w-5 text-white" /> : <ChevronRight className="h-5 w-5 text-white" />}
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-arabic">{course.title}</h3>
            <div className="flex items-center gap-4 flex-wrap">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-arabic">
                <Target className="ml-1 h-3 w-3" />
                {course.questionCount} سؤال
              </Badge>
              <Badge variant="outline" className="font-arabic">
                <BookOpen className="ml-1 h-3 w-3" />
                {course.chapters.length} فصل
              </Badge>
              {course.questionTypes.passage > 0 && (
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 font-arabic">
                  <div className="ml-1 h-3 w-3 rounded-full bg-indigo-500"></div>
                  {course.questionTypes.passage} قطعة
                </Badge>
              )}
              {course.questionTypes.passageQuestions > 0 && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-arabic">
                  <div className="ml-1 h-3 w-3 rounded-full bg-purple-500"></div>
                  {course.questionTypes.passageQuestions} سؤال قطعة
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          asChild
          className="border-gray-300 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 font-arabic"
          onClick={(e) => e.stopPropagation()}
        >
          <Link href={`/teacher/questions-bank/create?courseId=${course.id}`}>
            <Plus className="ml-1 h-4 w-4" />
            إضافة سؤال
          </Link>
        </Button>
      </CardHeader>

      {isExpanded && hasChaptersWithQuestions && (
        <CardContent className="border-t border-gray-200 bg-gray-50 pb-6 pt-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="space-y-4 pr-6">
            {course.chapters
              .filter((chapter) => chapter._count.questions > 0)
              .map((chapter) => (
                <div
                  key={chapter.id}
                  className="flex items-center justify-between rounded-lg bg-white p-4 border border-gray-200 hover:border-gray-300 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
                      <FileQuestion className="h-4 w-4 text-white" />
                    </div>
                    <div className="space-y-1">
                      <span className="font-medium text-gray-900 dark:text-white font-arabic">{chapter.title}</span>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs font-arabic">
                          <Target className="ml-1 h-3 w-3" />
                          {chapter._count.questions} سؤال
                        </Badge>
                        {chapter.questionTypes.multipleChoice > 0 && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 font-arabic">
                            {chapter.questionTypes.multipleChoice} متعدد الخيارات
                          </Badge>
                        )}
                        {chapter.questionTypes.trueFalse > 0 && (
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200 font-arabic">
                            {chapter.questionTypes.trueFalse} صح/خطأ
                          </Badge>
                        )}
                        {chapter.questionTypes.passage > 0 && (
                          <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200 font-arabic">
                            {chapter.questionTypes.passage} قطعة
                          </Badge>
                        )}
                        {chapter.questionTypes.passageQuestions > 0 && (
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 font-arabic">
                            {chapter.questionTypes.passageQuestions} سؤال قطعة
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 font-arabic"
                  >
                    <Link href={`/teacher/questions-bank/course/${course.id}/chapter/${chapter.id}`}>
                      <Eye className="ml-1 h-4 w-4" />
                      عرض
                    </Link>
                  </Button>
                </div>
              ))}

            {/* Questions not assigned to chapters */}
            <div className="flex items-center justify-between rounded-lg border border-dashed border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-700">
              <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600">
                  <FileQuestion className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300 font-arabic">أسئلة غير مصنفة في فصول</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hover:bg-orange-50 hover:text-orange-700 transition-colors duration-200 font-arabic"
              >
                <Link href={`/teacher/questions-bank/course/${course.id}`}>
                  <Eye className="ml-1 h-4 w-4" />
                  عرض الكل
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
