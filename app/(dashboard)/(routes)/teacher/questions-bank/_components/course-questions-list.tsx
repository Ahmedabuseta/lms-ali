'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, FileQuestion, Plus, BookOpen, Target, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CourseWithQuestionsCount } from '../types';

interface CourseQuestionsListProps {
  course: CourseWithQuestionsCount;
}

export const CourseQuestionsList = ({ course }: CourseQuestionsListProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasChaptersWithQuestions = course.chapters.some((chapter) => chapter._count.PracticeQuestion > 0);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className="group overflow-hidden border-0 bg-white/80 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader 
        className="flex cursor-pointer flex-row items-center justify-between p-6 transition-all duration-300 hover:bg-gray-50/50 dark:hover:bg-gray-700/50" 
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 transition-transform duration-300 group-hover:scale-110">
            {isExpanded ? <ChevronDown className="h-5 w-5 text-white" /> : <ChevronRight className="h-5 w-5 text-white" />}
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-arabic">{course.title}</h3>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-arabic">
                <Target className="ml-1 h-3 w-3" />
                {course.questionCount} سؤال
              </Badge>
              <Badge variant="outline" className="font-arabic">
                <BookOpen className="ml-1 h-3 w-3" />
                {course.chapters.length} فصل
              </Badge>
            </div>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          asChild
          className="transform transition-all duration-300 hover:scale-105 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 font-arabic"
          onClick={(e) => e.stopPropagation()}
        >
          <Link href={`/teacher/questions-bank/create?courseId=${course.id}`}>
            <Plus className="ml-1 h-4 w-4" />
            إضافة سؤال
          </Link>
        </Button>
      </CardHeader>
      
      {isExpanded && hasChaptersWithQuestions && (
        <CardContent className="border-t border-gray-200/50 bg-gray-50/30 pb-6 pt-6 dark:border-gray-700/50 dark:bg-gray-800/30">
          <div className="space-y-4 pr-6">
            {course.chapters
              .filter((chapter) => chapter._count.PracticeQuestion > 0)
              .map((chapter) => (
                <div 
                  key={chapter.id} 
                  className="flex items-center justify-between rounded-lg bg-white/60 p-4 shadow-sm transition-all duration-300 hover:shadow-md dark:bg-gray-700/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                      <FileQuestion className="h-4 w-4 text-white" />
                    </div>
                    <div className="space-y-1">
                      <span className="font-medium text-gray-900 dark:text-white font-arabic">{chapter.title}</span>
                      <Badge variant="outline" className="text-xs font-arabic">
                        <Target className="ml-1 h-3 w-3" />
                        {chapter._count.PracticeQuestion} سؤال
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    asChild
                    className="hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/20 font-arabic"
                  >
                    <Link href={`/teacher/questions-bank/course/${course.id}/chapter/${chapter.id}`}>
                      <Eye className="ml-1 h-4 w-4" />
                      عرض
                    </Link>
                  </Button>
                </div>
              ))}
              
            {/* Questions not assigned to chapters */}
            <div className="flex items-center justify-between rounded-lg border border-dashed border-gray-300 bg-white/40 p-4 dark:border-gray-600 dark:bg-gray-700/40">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                  <FileQuestion className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300 font-arabic">أسئلة غير مصنفة في فصول</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                asChild
                className="hover:bg-orange-100 hover:text-orange-700 dark:hover:bg-orange-900/20 font-arabic"
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
