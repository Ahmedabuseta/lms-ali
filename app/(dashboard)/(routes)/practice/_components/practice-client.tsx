'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Book, BookOpen } from 'lucide-react'
import { QuestionCard } from './question-card'
import { PracticeOptions } from './practice-options'

interface Chapter {
  id: string
  title: string
  _count: {
    PracticeQuestion: number
  }
}

interface Course {
  id: string
  title: string
  chapters: Chapter[]
  _count: {
    PracticeQuestion: number
  }
}

interface PracticeClientProps {
  courses: Course[]
}

export const PracticeClient = ({ courses }: PracticeClientProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get query params
  const courseIdParam = searchParams.get('courseId')
  const chapterIdsParam = searchParams.get('chapterIds')
  
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseIdParam || courses[0].id)
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>(
    chapterIdsParam ? chapterIdsParam.split(',') : []
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isPracticeMode, setIsPracticeMode] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  const selectedCourse = courses.find(course => course.id === selectedCourseId)
  
  // Reset chapter selection when course changes
  useEffect(() => {
    setSelectedChapterIds([])
  }, [selectedCourseId])
  
  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId)
    updateUrl(courseId, [])
  }
  
  const handleChapterChange = (chapterId: string, isChecked: boolean) => {
    setSelectedChapterIds(prev => {
      const updated = isChecked 
        ? [...prev, chapterId]
        : prev.filter(id => id !== chapterId)
      
      updateUrl(selectedCourseId, updated)
      return updated
    })
  }
  
  const updateUrl = (courseId: string, chapterIds: string[]) => {
    const params = new URLSearchParams()
    if (courseId) params.set('courseId', courseId)
    if (chapterIds.length > 0) params.set('chapterIds', chapterIds.join(','))
    
    router.push(`/practice?${params.toString()}`)
  }
  
  const startPractice = async () => {
    try {
      setIsLoading(true)
      await fetchQuestions(1)
      setIsPracticeMode(true)
      setCurrentQuestionIndex(0)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const fetchQuestions = async (page: number) => {
    try {
      const params = new URLSearchParams()
      params.set('courseId', selectedCourseId)
      if (selectedChapterIds.length > 0) {
        params.set('chapterIds', selectedChapterIds.join(','))
      }
      params.set('page', page.toString())
      params.set('pageSize', '10')
      
      const response = await axios.get(`/api/practice/questions?${params.toString()}`)
      setQuestions(response.data.questions)
      setTotalQuestions(response.data.totalQuestions)
      setTotalPages(response.data.pageCount)
      setCurrentPage(response.data.currentPage)
    } catch (error) {
      console.error(error)
    }
  }
  
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else if (currentPage < totalPages) {
      // Load next page of questions
      fetchQuestions(currentPage + 1).then(() => {
        setCurrentQuestionIndex(0)
      })
    }
  }
  
  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    } else if (currentPage > 1) {
      // Load previous page of questions
      fetchQuestions(currentPage - 1).then(() => {
        setCurrentQuestionIndex(questions.length - 1)
      })
    }
  }
  
  const exitPracticeMode = () => {
    setIsPracticeMode(false)
    setQuestions([])
    setCurrentQuestionIndex(0)
  }
  
  return (
    <>
      {!isPracticeMode ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Select Course</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select
                  value={selectedCourseId}
                  onValueChange={handleCourseChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        <div className="flex items-center gap-2">
                          <span>{course.title}</span>
                          <Badge variant="outline" className="ml-auto">
                            {course._count.PracticeQuestion} questions
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">
                    {selectedCourse?.chapters.length 
                      ? "Select Chapters (Optional)" 
                      : "No chapters available"}
                  </h3>
                  <div className="space-y-2">
                    {selectedCourse?.chapters.map((chapter) => (
                      <div key={chapter.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={chapter.id}
                          checked={selectedChapterIds.includes(chapter.id)}
                          onCheckedChange={(checked) => 
                            handleChapterChange(chapter.id, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={chapter.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center justify-between w-full"
                        >
                          <span>{chapter.title}</span>
                          <Badge variant="outline" className="ml-2">
                            {chapter._count.PracticeQuestion}
                          </Badge>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={startPractice}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : selectedChapterIds.length > 0 ? (
                  <>
                    Start Chapter Practice
                  </>
                ) : (
                  <>
                    Start Course Practice
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                {selectedCourse?.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCourse && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Course Summary</h3>
                    <p className="text-sm text-slate-600">
                      This course has {selectedCourse._count.PracticeQuestion} practice questions
                      across {selectedCourse.chapters.length} chapters.
                    </p>
                  </div>
                  
                  {selectedChapterIds.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Selected Chapters</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedCourse.chapters
                          .filter(chapter => selectedChapterIds.includes(chapter.id))
                          .map(chapter => (
                            <Badge key={chapter.id} variant="secondary">
                              <BookOpen className="mr-1 h-3 w-3" />
                              {chapter.title}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-medium mb-2">Practice Mode</h3>
                    <p className="text-sm text-slate-600">
                      You'll get random questions from {selectedCourse.title}
                      {selectedChapterIds.length > 0 ? ' (selected chapters only)' : ''}. 
                      Each question will show immediate feedback on your answer.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {questions.length > 0 && (
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-600">
                    Question {currentQuestionIndex + 1} of {questions.length} 
                    {totalQuestions > questions.length && `(${totalQuestions} total)`}
                  </p>
                  <h2 className="text-lg font-medium">
                    {selectedCourse?.title}
                    {questions[currentQuestionIndex].chapter && (
                      <> - {questions[currentQuestionIndex].chapter.title}</>
                    )}
                  </h2>
                </div>
                <Button variant="outline" onClick={exitPracticeMode}>
                  Exit Practice
                </Button>
              </div>
              
              <QuestionCard
                question={questions[currentQuestionIndex]}
                onNext={nextQuestion}
                onPrevious={previousQuestion}
                isFirstQuestion={currentQuestionIndex === 0 && currentPage === 1}
                isLastQuestion={currentQuestionIndex === questions.length - 1 && currentPage === totalPages}
              />
            </div>
          )}
        </>
      )}
    </>
  )
}