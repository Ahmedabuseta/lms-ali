import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { ExamClient } from './_components/exam-client';
import { getExams } from '@/actions/get-exams';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface PageProps {
  params: {
    examId: string;
  };
}

export default async function ExamDetailPage({ params }: PageProps) {
  const { userId } = auth();

  if (!userId) {
    return redirect('/');
  }

  const examData = await getExams({
    userId,
    examId: params.examId,
  });

  if (!examData) {
    return redirect('/exam');
  }

  const { exam, activeAttempt, pastAttempts } = examData;

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-right text-2xl font-bold text-slate-900 dark:text-slate-100">{exam?.title}</h1>
          {exam?.timeLimit && (
            <div className="flex items-center rounded-md bg-slate-100 px-3 py-1 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Clock className="ml-2 h-4 w-4" />
              الوقت المسموح: {exam?.timeLimit} دقيقة
            </div>
          )}
        </div>
        <p className="text-right text-sm text-slate-600 dark:text-slate-400">
          {exam?.course.title}
          {exam?.chapter && ` • ${exam?.chapter.title}`}
        </p>
      </div>

      <div className="space-y-4">
        {pastAttempts && pastAttempts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-right text-xl text-slate-900 dark:text-slate-100">المحاولات السابقة</CardTitle>
              <CardDescription className="text-right text-slate-600 dark:text-slate-400">
                أكملت هذا الامتحان {pastAttempts.length} مرة{pastAttempts.length > 1 ? '' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pastAttempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex flex-row-reverse items-center justify-between rounded-md border border-slate-200 p-3 dark:border-slate-800"
                  >
                    <div className="flex flex-row-reverse items-center space-x-4 space-x-reverse">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                        {attempt?.score ?? 0 >= 70 ? (
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900 dark:text-slate-100">الدرجة: {attempt?.score}%</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          أكملت في{' '}
                          {attempt?.completedAt
                            ? new Date(attempt.completedAt).toLocaleDateString('ar-SA')
                            : 'غير متاح'}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/exam/${exam.id}/results/${attempt.id}`}>عرض النتائج</a>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-800/50">
            <CardTitle className="text-right text-slate-900 dark:text-slate-100">
              {activeAttempt ? 'استكمال الامتحان' : 'بدء محاولة جديدة'}
            </CardTitle>
            <CardDescription className="text-right text-slate-600 dark:text-slate-400">
              {activeAttempt
                ? 'عندك محاولة نشطة. ممكن تستكمل من حيث توقفت.'
                : `الامتحان ده فيه ${exam?.questions.length} سؤال${exam?.questions.length !== 1 ? '' : ''} للإجابة.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {exam?.description && (
              <div className="mb-4 text-right text-sm text-slate-600 dark:text-slate-400">{exam?.description}</div>
            )}
            <div className="rounded-md bg-slate-50 p-4 dark:bg-slate-800/50">
              <h3 className="text-right font-medium text-slate-900 dark:text-slate-100">تعليمات الامتحان</h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-right text-sm text-slate-600 dark:text-slate-400">
                <li>اقرأ كل سؤال بعناية قبل الإجابة</li>
                <li>تقدر تتنقل بين الأسئلة باستخدام أزرار التنقل</li>
                <li>إجاباتك بتتحفظ تلقائياً أثناء تقدمك</li>
                <li>بعد تسليم الامتحان، مش هتقدر تغير إجاباتك</li>
                {exam?.timeLimit && <li>عندك {exam?.timeLimit} دقيقة لإنهاء الامتحان</li>}
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-row-reverse justify-between bg-slate-50 p-6 dark:bg-slate-800/50">
            <Button variant="outline" asChild>
              <a href="/exam">رجوع للامتحانات</a>
            </Button>
            <ExamClient
              examId={exam?.id as string}
              userId={userId}
              activeAttemptId={activeAttempt?.id}
              timeLimit={exam?.timeLimit}
            />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
