import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import FlashcardClient from './_components/FlashcardClient'

interface PageProps {
  searchParams: {
    courseId?: string
    chapterId?: string
  }
}

export default async function FlashcardsPage({
  searchParams
}: PageProps) {
  const { userId } = auth()

  if (!userId) {
    return redirect('/')
  }

  const courses = await db.course.findMany({
    orderBy: {
      title: 'asc'
    }
  })

  // Handle course selection
  let selectedCourse = null
  let chapters: any[] = []
  if (searchParams.courseId) {
    selectedCourse = await db.course.findUnique({
      where: {
        id: searchParams.courseId
      }
    })

    if (selectedCourse) {
      chapters = await db.chapter.findMany({
        where: {
          courseId: selectedCourse.id,
          isPublished: true
        },
        orderBy: {
          position: 'asc'
        }
      })
    }
  }

  // Build query conditions for flashcards
  const flashcardQuery = {
    where: {
      ...(searchParams.chapterId ? { chapterId: searchParams.chapterId } : {}),
      ...(searchParams.courseId && !searchParams.chapterId ? { 
        chapter: {
          courseId: searchParams.courseId,
          isPublished: true
        } 
      } : {})
    },
    take: 20,
    orderBy: {
      createdAt: 'desc' as const
    },
    select: {
      id: true,
      question: true,
      answer: true,
    }
  };

  // Get initial batch of flashcards
  const initialFlashcards = await db.flashcard.findMany(flashcardQuery).catch(error => {
    console.error("Error fetching flashcards:", error);
    return [];
  });

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">البطاقات التعليمية</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">راجع واختبر معرفتك باستخدام البطاقات التعليمية</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>اختر الدورة</CardTitle>
            <CardDescription>اختر دورة لعرض بطاقاتها التعليمية</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              defaultValue={searchParams.courseId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر دورة" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    <Link href={`/flashcards?courseId=${course.id}`} className="block w-full">
                      {course.title}
                    </Link>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedCourse && chapters.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>اختر الفصل</CardTitle>
              <CardDescription>اختر فصلاً محدداً أو اعرض الكل</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                defaultValue={searchParams.chapterId || 'all'}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر فصلاً" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <Link href={`/flashcards?courseId=${searchParams.courseId}`} className="block w-full">
                      جميع الفصول
                    </Link>
                  </SelectItem>
                  {chapters.map((chapter) => (
                    <SelectItem key={chapter.id} value={chapter.id}>
                      <Link href={`/flashcards?courseId=${searchParams.courseId}&chapterId=${chapter.id}`} className="block w-full">
                        {chapter.title}
                      </Link>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedCourse && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-6 text-slate-900 dark:text-slate-100">
            البطاقات التعليمية لـ {selectedCourse.title} 
            {searchParams.chapterId ? ` - ${chapters.find(c => c.id === searchParams.chapterId)?.title}` : ''}
          </h2>

          {initialFlashcards.length > 0 ? (
            <FlashcardClient 
              initialCards={initialFlashcards}
              courseId={searchParams.courseId}
              chapterId={searchParams.chapterId}
            />
          ) : (
            <div className="text-center p-12 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-medium text-slate-900 dark:text-slate-100">لا توجد بطاقات متاحة</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                {selectedCourse ? 
                  "جرب اختيار فصل أو دورة مختلفة" :
                  "اختر دورة لعرض بطاقاتها التعليمية"
                }
              </p>
            </div>
          )}
        </div>
      )}

      {!selectedCourse && (
        <div className="text-center p-12 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-medium text-slate-900 dark:text-slate-100">اختر دورة لعرض البطاقات التعليمية</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            اختر من دوراتك المشتراة للبدء في الدراسة باستخدام البطاقات التعليمية
          </p>
        </div>
      )}
    </div>
  )
}
