import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, BookOpen, Brain, Target, ChevronRight, Users, Clock, Award } from 'lucide-react';
import Link from 'next/link';
import FlashcardClient from './_components/FlashcardClient';

interface PageProps {
  searchParams: {
    courseId?: string;
    chapterId?: string;
  };
}

export default async function FlashcardsPage({ searchParams }: PageProps) {
  const { userId } = auth();

  if (!userId) {
    return redirect('/');
  }

  const courses = await db.course.findMany({
    orderBy: {
      title: 'asc',
    },
  });

  // Handle course selection
  let selectedCourse = null;
  let chapters: any[] = [];
  if (searchParams.courseId) {
    selectedCourse = await db.course.findUnique({
      where: {
        id: searchParams.courseId,
      },
    });

    if (selectedCourse) {
      chapters = await db.chapter.findMany({
        where: {
          courseId: selectedCourse.id,
          isPublished: true,
        },
        orderBy: {
          position: 'asc',
        },
      });
    }
  }

  // Build query conditions for flashcards
  const flashcardQuery = {
    where: {
      ...(searchParams.chapterId ? { chapterId: searchParams.chapterId } : {}),
      ...(searchParams.courseId && !searchParams.chapterId
        ? {
            chapter: {
              courseId: searchParams.courseId,
              isPublished: true,
            },
          }
        : {}),
    },
    take: 20,
    orderBy: {
      createdAt: 'desc' as const,
    },
    select: {
      id: true,
      question: true,
      answer: true,
    },
  };

  // Get initial batch of flashcards
  const initialFlashcards = await db.flashcard.findMany(flashcardQuery).catch((error) => {
    console.error('Error fetching flashcards:', error);
    return [];
  });

  return (
    <div
      className="relative min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 via-white to-red-50/40 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900"
      dir="rtl"
    >
      {/* Enhanced light mode decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="to-red-300/15 absolute right-10 top-20 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-orange-200/20 blur-3xl"></div>
        <div className="to-pink-300/15 animation-delay-2000 absolute bottom-1/4 left-20 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-red-200/20 blur-3xl"></div>
        <div className="to-orange-300/15 animation-delay-4000 absolute right-1/3 top-1/2 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-amber-200/20 blur-3xl"></div>
      </div>

      <div className="relative z-10 space-y-8 p-6">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 p-8 text-white">
          <div className="relative z-10">
            <h1 className="animate-slide-up mb-2 flex items-center gap-3 text-3xl font-bold md:text-4xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Zap className="h-6 w-6 text-white" />
              </div>
              البطاقات التعليمية
            </h1>
            <p className="animate-slide-up animation-delay-200 mb-6 text-lg text-orange-100">
              راجع واختبر معرفتك باستخدام البطاقات التعليمية التفاعلية
            </p>
          </div>

          {/* Floating Elements */}
          <div className="animate-float absolute right-4 top-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div className="animate-float animation-delay-1000 absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <Target className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Course Selection Cards */}
        {!selectedCourse && (
          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
                <BookOpen className="h-6 w-6 text-blue-600" />
                اختر دورة للبدء
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                اختر من دوراتك المتاحة لعرض البطاقات التعليمية الخاصة بها
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <Link key={course.id} href={`/flashcards?courseId=${course.id}`}>
                    <Card className="group h-full transform cursor-pointer overflow-hidden border-0 bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl dark:from-gray-800 dark:via-blue-900/10 dark:to-purple-900/10">
                      <CardContent className="relative p-6">
                        <div className="mb-4 flex items-start gap-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg transition-transform duration-300 group-hover:scale-110">
                            <BookOpen className="h-8 w-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-800 transition-colors duration-300 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                              {course.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>متاح</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Zap className="h-4 w-4" />
                                <span>بطاقات تفاعلية</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-medium text-blue-600 dark:text-blue-400">
                            <span>ابدأ المراجعة</span>
                            <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                          </div>
                          <div className="h-8 w-8 animate-pulse rounded-full bg-blue-500/20"></div>
                        </div>

                        {/* Floating decoration */}
                        <div className="absolute right-4 top-4 h-6 w-6 rounded-full bg-gradient-to-r from-orange-400 to-red-400 opacity-20 transition-transform duration-500 group-hover:scale-150"></div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chapter Selection Cards */}
        {selectedCourse && chapters.length > 0 && (
          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-2xl font-bold text-transparent">
                    <Target className="h-6 w-6 text-purple-600" />
                    اختر الفصل
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                    من دورة: {selectedCourse.title}
                  </CardDescription>
                </div>
                <Link href="/flashcards">
                  <Card className="group transform cursor-pointer border-0 bg-gradient-to-r from-gray-100 to-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-lg dark:from-gray-700 dark:to-gray-800">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <ChevronRight className="h-4 w-4 rotate-180" />
                        <span>تغيير الدورة</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* All Chapters Option */}
                <Link href={`/flashcards?courseId=${searchParams.courseId}`}>
                  <Card
                    className={`group h-full transform cursor-pointer overflow-hidden border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                      !searchParams.chapterId
                        ? 'border-purple-600 bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-400 dark:border-purple-700 dark:from-purple-900/20 dark:to-pink-900/20 dark:hover:border-purple-500'
                    }`}
                  >
                    <CardContent className="relative p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${
                            !searchParams.chapterId
                              ? 'bg-white/20 backdrop-blur-sm'
                              : 'bg-gradient-to-r from-purple-500 to-pink-500'
                          }`}
                        >
                          <Award className={`h-6 w-6 ${!searchParams.chapterId ? 'text-white' : 'text-white'}`} />
                        </div>
                        <div>
                          <h3
                            className={`font-bold ${
                              !searchParams.chapterId ? 'text-white' : 'text-gray-800 dark:text-white'
                            }`}
                          >
                            جميع الفصول
                          </h3>
                          <p
                            className={`text-sm ${
                              !searchParams.chapterId ? 'text-purple-100' : 'text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            مراجعة شاملة
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                {/* Individual Chapters */}
                {chapters.map((chapter, index) => (
                  <Link key={chapter.id} href={`/flashcards?courseId=${searchParams.courseId}&chapterId=${chapter.id}`}>
                    <Card
                      className={`group h-full transform cursor-pointer overflow-hidden border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                        searchParams.chapterId === chapter.id
                          ? 'border-blue-600 bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-400 dark:border-blue-700 dark:from-blue-900/20 dark:to-indigo-900/20 dark:hover:border-blue-500'
                      }`}
                    >
                      <CardContent className="relative p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${
                              searchParams.chapterId === chapter.id
                                ? 'bg-white/20 backdrop-blur-sm'
                                : 'bg-gradient-to-r from-blue-500 to-purple-500'
                            }`}
                          >
                            <span
                              className={`text-lg font-bold ${
                                searchParams.chapterId === chapter.id ? 'text-white' : 'text-white'
                              }`}
                            >
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3
                              className={`line-clamp-2 text-sm font-bold ${
                                searchParams.chapterId === chapter.id ? 'text-white' : 'text-gray-800 dark:text-white'
                              }`}
                            >
                              {chapter.title}
                            </h3>
                            <p
                              className={`text-xs ${
                                searchParams.chapterId === chapter.id
                                  ? 'text-blue-100'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              الفصل {index + 1}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Flashcards Content */}
        {selectedCourse && (
          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
                <Zap className="h-6 w-6 text-orange-600" />
                البطاقات التعليمية لـ {selectedCourse.title}
                {searchParams.chapterId ? ` - ${chapters.find((c) => c.id === searchParams.chapterId)?.title}` : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {initialFlashcards.length > 0 ? (
                <FlashcardClient
                  initialCards={initialFlashcards}
                  courseId={searchParams.courseId}
                  chapterId={searchParams.chapterId}
                />
              ) : (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-500">
                    <Zap className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-700 dark:text-gray-300">لا توجد بطاقات متاحة</h3>
                  <p className="mx-auto max-w-md text-gray-600 dark:text-gray-400">
                    جرب اختيار فصل أو دورة مختلفة للعثور على البطاقات التعليمية
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
