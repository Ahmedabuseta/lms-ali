'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Book, BookOpen } from 'lucide-react';
import { QuestionCard } from './question-card';
import { PracticeOptions } from './practice-options';
import { toast } from 'react-hot-toast';

interface Chapter {
  id: string;
  title: string;
  _count: {
    PracticeQuestion: number;
  };
}

interface Course {
  id: string;
  title: string;
  chapters: Chapter[];
  _count: {
    PracticeQuestion: number;
  };
}

interface Question {
  id: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
  difficulty: string;
  chapter?: {
    id: string;
    title: string;
  };
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

interface PracticeClientProps {
  courses: Course[];
}

interface SavedAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
}

interface SavedProgress {
  courseId: string;
  chapterIds: string[];
  currentPage: number;
  currentQuestionIndex: number;
  answers: SavedAnswer[];
  lastUpdated: number;
}

export const PracticeClient = ({ courses }: PracticeClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get query params
  const courseIdParam = searchParams.get('courseId');
  const chapterIdsParam = searchParams.get('chapterIds');

  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseIdParam || courses[0]?.id || '');
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>(
    chapterIdsParam ? chapterIdsParam.split(',') : [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [savedAnswers, setSavedAnswers] = useState<SavedAnswer[]>([]);

  const selectedCourse = courses.find((course) => course.id === selectedCourseId);

  // Load saved progress on initial mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('practiceProgress');
    if (savedProgress) {
      const progress: SavedProgress = JSON.parse(savedProgress);
      // Only restore if less than 24 hours old
      if (Date.now() - progress.lastUpdated < 24 * 60 * 60 * 1000) {
        setSelectedCourseId(progress.courseId);
        setSelectedChapterIds(progress.chapterIds);
        setCurrentPage(progress.currentPage);
        setCurrentQuestionIndex(progress.currentQuestionIndex);
        setSavedAnswers(progress.answers);
        // Don't immediately start practice mode - let user choose to continue
        if (progress.answers.length > 0) {
          toast.success('تم استرجاع تقدمك السابق');
        }
      } else {
        localStorage.removeItem('practiceProgress');
      }
    }
  }, []);

  // Save progress whenever relevant state changes
  useEffect(() => {
    if (isPracticeMode && questions.length > 0) {
      const progress: SavedProgress = {
        courseId: selectedCourseId,
        chapterIds: selectedChapterIds,
        currentPage,
        currentQuestionIndex,
        answers: savedAnswers,
        lastUpdated: Date.now(),
      };
      localStorage.setItem('practiceProgress', JSON.stringify(progress));
    }
  }, [isPracticeMode, selectedCourseId, selectedChapterIds, currentPage, currentQuestionIndex, savedAnswers]);

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    updateUrl(courseId, []);
  };

  const handleChapterChange = (chapterId: string, isChecked: boolean) => {
    setSelectedChapterIds((prev) => {
      const updated = isChecked ? [...prev, chapterId] : prev.filter((id) => id !== chapterId);

      updateUrl(selectedCourseId, updated);
      return updated;
    });
  };

  const updateUrl = (courseId: string, chapterIds: string[]) => {
    const params = new URLSearchParams();
    if (courseId) params.set('courseId', courseId);
    if (chapterIds.length > 0) params.set('chapterIds', chapterIds.join(','));

    router.push(`/practice?${params.toString()}`);
  };

  const handleAnswerSubmit = (questionId: string, selectedOptionId: string, isCorrect: boolean) => {
    setSavedAnswers((prev) => {
      const existing = prev.findIndex((a) => a.questionId === questionId);
      if (existing !== -1) {
        const updated = [...prev];
        updated[existing] = { questionId, selectedOptionId, isCorrect };
        return updated;
      }
      return [...prev, { questionId, selectedOptionId, isCorrect }];
    });
  };

  const getQuestionAnswer = (questionId: string) => {
    return savedAnswers.find((a) => a.questionId === questionId);
  };

  const startPractice = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await fetchQuestions(1);
      setIsPracticeMode(true);
      setCurrentQuestionIndex(0);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'حدث خطأ أثناء تحميل الأسئلة';
      setError(message);
      toast.error(message);
      setIsPracticeMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  const continuePractice = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await fetchQuestions(currentPage);
      setIsPracticeMode(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'حدث خطأ أثناء تحميل الأسئلة';
      setError(message);
      toast.error(message);
      setIsPracticeMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  const resetProgress = () => {
    localStorage.removeItem('practiceProgress');
    setSavedAnswers([]);
    setCurrentPage(1);
    setCurrentQuestionIndex(0);
    toast.success('تم مسح التقدم السابق');
  };

  const fetchQuestions = async (page: number) => {
    try {
      setError(null);
      const params = new URLSearchParams();
      params.set('courseId', selectedCourseId);
      if (selectedChapterIds.length > 0) {
        params.set('chapterIds', selectedChapterIds.join(','));
      }
      params.set('page', page.toString());
      params.set('pageSize', '10');

      const response = await axios.get<{
        questions: Question[];
        totalQuestions: number;
        pageCount: number;
        currentPage: number;
      }>(`/api/practice/questions?${params.toString()}`);
      console.log(response);
      setQuestions(response.data.questions);
      setTotalQuestions(response.data.totalQuestions);
      setTotalPages(response.data.pageCount);
      setCurrentPage(response.data.currentPage);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'حدث خطأ أثناء تحميل الأسئلة';
      setError(message);
      toast.error(message);
      throw error;
    }
  };

  const nextQuestion = async () => {
    try {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else if (currentPage < totalPages) {
        setIsLoading(true);
        await fetchQuestions(currentPage + 1);
        setCurrentQuestionIndex(0);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'حدث خطأ أثناء تحميل السؤال التالي';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const previousQuestion = async () => {
    try {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex((prev) => prev - 1);
      } else if (currentPage > 1) {
        setIsLoading(true);
        await fetchQuestions(currentPage - 1);
        setCurrentQuestionIndex(questions.length - 1);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'حدث خطأ أثناء تحميل السؤال السابق';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const exitPracticeMode = () => {
    setIsPracticeMode(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setError(null);
    // Clear saved progress
    localStorage.removeItem('practiceProgress');
    setSavedAnswers([]);
    toast.success('تم إنهاء التدريب ومسح التقدم');
  };

  if (!selectedCourse) {
    return (
      <div className="p-6" dir="rtl">
        <div className="flex h-60 flex-col items-center justify-center text-center">
          <h2 className="mb-2 text-2xl font-bold">لا توجد دورات متاحة</h2>
          <p className="mb-6 text-slate-600">لم يتم العثور على أي دورات متاحة للتدريب</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isPracticeMode ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>اختر الدورة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select value={selectedCourseId} onValueChange={handleCourseChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر دورة" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        <div className="flex items-center gap-2">
                          <span>{course.title}</span>
                          <Badge variant="outline" className="mr-auto">
                            {course._count.PracticeQuestion} سؤال
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="mt-4">
                  <h3 className="mb-2 text-sm font-medium">
                    {selectedCourse.chapters.length ? 'اختر الفصول (اختياري)' : 'لا توجد فصول متاحة'}
                  </h3>
                  <div className="space-y-2">
                    {selectedCourse.chapters.map((chapter) => (
                      <div key={chapter.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={chapter.id}
                          checked={selectedChapterIds.includes(chapter.id)}
                          onCheckedChange={(checked) => handleChapterChange(chapter.id, checked as boolean)}
                        />
                        <label
                          htmlFor={chapter.id}
                          className="flex w-full items-center justify-between text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          <span>{chapter.title}</span>
                          <Badge variant="outline" className="mr-2">
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
              <Button onClick={startPractice} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري التحميل...
                  </>
                ) : selectedChapterIds.length > 0 ? (
                  <>ابدأ التدريب على الفصول المختارة</>
                ) : (
                  <>ابدأ التدريب على الدورة كاملة</>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                {selectedCourse.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 font-medium">ملخص الدورة</h3>
                  <p className="text-sm text-slate-600">
                    تحتوي هذه الدورة على {selectedCourse._count.PracticeQuestion} سؤال تدريبي موزعة على{' '}
                    {selectedCourse.chapters.length} فصل.
                  </p>
                </div>

                {selectedChapterIds.length > 0 && (
                  <div>
                    <h3 className="mb-2 font-medium">الفصول المختارة</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCourse.chapters
                        .filter((chapter) => selectedChapterIds.includes(chapter.id))
                        .map((chapter) => (
                          <Badge key={chapter.id} variant="secondary">
                            <BookOpen className="ml-1 h-3 w-3" />
                            {chapter.title}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="mb-2 font-medium">وضع التدريب</h3>
                  <p className="text-sm text-slate-600">
                    ستحصل على أسئلة عشوائية من {selectedCourse.title}
                    {selectedChapterIds.length > 0 ? ' (من الفصول المختارة فقط)' : ' (من جميع الفصول)'}. ستظهر نتيجة
                    إجابتك فور الإجابة على كل سؤال.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {isLoading ? (
            <div className="flex h-60 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : questions.length > 0 ? (
            <div className="mx-auto max-w-3xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">
                    السؤال {currentQuestionIndex + 1} من {questions.length}
                    {totalQuestions > questions.length && ` (${totalQuestions} إجمالي)`}
                  </p>
                  <h2 className="text-lg font-medium">
                    {selectedCourse.title}
                    {questions[currentQuestionIndex].chapter && <> - {questions[currentQuestionIndex].chapter?.title}</>}
                  </h2>
                </div>
                <Button variant="outline" onClick={exitPracticeMode}>
                  إنهاء التدريب
                </Button>
              </div>

              <QuestionCard
                question={questions[currentQuestionIndex]}
                onNext={nextQuestion}
                onPrevious={previousQuestion}
                isFirstQuestion={currentQuestionIndex === 0 && currentPage === 1}
                isLastQuestion={currentQuestionIndex === questions.length - 1 && currentPage === totalPages}
                savedAnswer={getQuestionAnswer(questions[currentQuestionIndex].id)}
                onAnswerSubmit={handleAnswerSubmit}
              />
            </div>
          ) : (
            <div className="p-6" dir="rtl">
              <div className="flex h-60 flex-col items-center justify-center text-center">
                <h2 className="mb-2 text-2xl font-bold">لا توجد أسئلة متاحة</h2>
                <p className="mb-6 text-slate-600">لم يتم العثور على أسئلة تدريبية للفصول المختارة</p>
                <Button variant="outline" onClick={exitPracticeMode}>
                  العودة للاختيار
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {!isPracticeMode && savedAnswers.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>التقدم المحفوظ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-slate-600">لديك {savedAnswers.length} إجابة محفوظة</p>
              <p className="text-sm text-slate-600">
                نسبة الإجابات الصحيحة:{' '}
                {Math.round((savedAnswers.filter((a) => a.isCorrect).length / savedAnswers.length) * 100)}%
              </p>
              <div className="flex gap-2">
                <Button onClick={continuePractice} disabled={isLoading}>
                  متابعة التدريب
                </Button>
                <Button variant="outline" onClick={resetProgress}>
                  بدء من جديد
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
