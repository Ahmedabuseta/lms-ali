import { requireAuth } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Target, Plus } from 'lucide-react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ChapterQuestionsPageProps {
  params: {
    courseId: string;
    chapterId: string;
  };
}

const ChapterQuestionsPage = async ({ params }: ChapterQuestionsPageProps) => {
  await requireAuth();

  const [course, chapter] = await Promise.all([
    db.course.findUnique({
      where: {
        id: params.courseId,
      },
      select: {
        id: true,
        title: true,
      },
    }),
    db.chapter.findUnique({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      },
      include: {
        questionBanks: {
          include: {
            questions: {
              include: {
                options: true,
                passage: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
      },
    }),
  ]);

  if (!course || !chapter) {
    redirect('/teacher/questions-bank');
  }

  const questions = chapter.questionBanks.flatMap(qb => qb.questions);

  const questionStats = {
    total: questions.length,
    multipleChoice: questions.filter(q => q.type === 'MULTIPLE_CHOICE').length,
    trueFalse: questions.filter(q => q.type === 'TRUE_FALSE').length,
    passage: questions.filter(q => q.type === 'PASSAGE').length,
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE':
        return 'اختيار متعدد';
      case 'TRUE_FALSE':
        return 'صح أم خطأ';
      case 'PASSAGE':
        return 'قطعة';
      default:
        return type;
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'سهل';
      case 'MEDIUM':
        return 'متوسط';
      case 'HARD':
        return 'صعب';
      default:
        return difficulty;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'TRUE_FALSE':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'PASSAGE':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'HARD':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Link 
          href="/teacher/questions-bank" 
          className="inline-flex items-center text-sm transition hover:opacity-75 font-arabic"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          العودة إلى بنك الأسئلة
        </Link>
        
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-arabic">
              أسئلة الفصل: {chapter.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 font-arabic">
              الدورة: {course.title}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" asChild className="font-arabic">
              <Link href={`/teacher/questions-bank/course/${params.courseId}`}>
                عرض أسئلة الدورة
              </Link>
            </Button>
            <Button asChild className="font-arabic">
              <Link href={`/teacher/questions-bank/create?courseId=${params.courseId}&chapterId=${params.chapterId}`}>
                <Plus className="mr-2 h-4 w-4" />
                إضافة سؤال جديد
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 font-arabic">إجمالي الأسئلة</p>
                <p className="text-2xl font-bold text-gray-900">{questionStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="h-5 w-5 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 font-arabic">متعدد الخيارات</p>
                <p className="text-2xl font-bold text-gray-900">{questionStats.multipleChoice}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <div className="h-5 w-5 bg-orange-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 font-arabic">صح أم خطأ</p>
                <p className="text-2xl font-bold text-gray-900">{questionStats.trueFalse}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <div className="h-5 w-5 bg-purple-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 font-arabic">أسئلة القطع</p>
                <p className="text-2xl font-bold text-gray-900">{questionStats.passage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle className="font-arabic">قائمة الأسئلة</CardTitle>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 font-arabic">لا توجد أسئلة</h3>
              <p className="mt-2 text-gray-600 font-arabic">
                لم يتم إضافة أي أسئلة لهذا الفصل بعد
              </p>
              <Button asChild className="mt-4 font-arabic">
                <Link href={`/teacher/questions-bank/create?courseId=${params.courseId}&chapterId=${params.chapterId}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  إضافة أول سؤال
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
                <Card key={question.id} className="border-l-4 border-l-emerald-500">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getTypeColor(question.type)}>
                              {getTypeLabel(question.type)}
                            </Badge>
                            <Badge className={getDifficultyColor(question.difficulty)}>
                              {getDifficultyLabel(question.difficulty)}
                            </Badge>
                            <Badge variant="outline">{question.points} نقطة</Badge>
                            {question.passage && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                قطعة: {question.passage.title}
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 font-arabic line-clamp-2">
                            {question.text}
                          </h3>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild className="font-arabic">
                            <Link href={`/teacher/questions-bank/edit/${question.id}`}>
                              تعديل
                            </Link>
                          </Button>
                        </div>
                      </div>

                      {question.type !== 'PASSAGE' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                          {question.options.map((option, index) => (
                            <div
                              key={option.id}
                              className={`p-3 rounded-lg border ${
                                option.isCorrect
                                  ? 'bg-green-50 border-green-200 text-green-800'
                                  : 'bg-gray-50 border-gray-200 text-gray-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {String.fromCharCode(65 + index)}.
                                </span>
                                <span className="font-arabic">{option.text}</span>
                                {option.isCorrect && (
                                  <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800">
                                    صحيح
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChapterQuestionsPage; 