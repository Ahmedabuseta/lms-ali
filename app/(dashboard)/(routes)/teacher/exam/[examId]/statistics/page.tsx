import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getExamStatistics } from '@/actions/exam-actions';
import { ArrowLeft, BarChart, Trophy, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { StudentPerformanceTable } from '@/components/StudentPerformanceTable';

interface PageProps {
  params: {
    examId: string;
  };
}

export default async function ExamStatisticsPage({ params }: PageProps) {
  const { userId } = auth();

  if (!userId) {
    return redirect('/');
  }

  // Verify ownership of the exam through the course
  const exam = await db.exam.findUnique({
    where: {
      id: params.examId,
    },
    include: {
      course: true,
      chapter: true,
      _count: {
        select: {
          questions: true,
        },
      },
    },
  });

  if (!exam) {
    return redirect('/teacher/exam');
  }

  // Get statistics for the exam
  const statistics = await getExamStatistics({
    userId,
    examId: params.examId,
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href={`/teacher/exam/${params.examId}`}
            className="mb-4 flex items-center text-sm transition hover:opacity-75"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to exam
          </Link>
          <h1 className="text-2xl font-bold">{exam.title} - Statistics</h1>
          <p className="text-sm text-slate-600">
            Performance analytics for {exam.course.title}
            {exam.chapter && ` - ${exam.chapter.title}`}
          </p>
        </div>
      </div>

      {/* Key metrics */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-slate-500" />
              <div className="text-2xl font-bold">{statistics.totalAttempts}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart className="mr-2 h-4 w-4 text-slate-500" />
              <div className="text-2xl font-bold">{statistics.averageScore}%</div>
            </div>
            <Progress value={statistics.averageScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pass Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Trophy className="mr-2 h-4 w-4 text-slate-500" />
              <div className="text-2xl font-bold">{statistics.passRate}%</div>
            </div>
            <Progress value={statistics.passRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Score Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Lowest</div>
                <div className="text-xl font-bold">{statistics.lowestScore}%</div>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div>
                <div className="text-sm font-medium">Highest</div>
                <div className="text-xl font-bold">{statistics.highestScore}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question stats */}
      <Card>
        <CardHeader>
          <CardTitle>Question Performance</CardTitle>
          <CardDescription>See which questions students find most challenging</CardDescription>
        </CardHeader>
        <CardContent>
          {statistics.totalAttempts === 0 ? (
            <div className="py-6 text-center text-slate-500">No attempts have been made on this exam yet.</div>
          ) : (
            <div className="space-y-4">
              {statistics.questionStats.map((question, index) => (
                <div key={question.questionId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">
                        Q{index + 1}: {question.text}
                      </div>
                      <div className="text-sm text-slate-500">
                        {question.correctRate}% correct ({question.attemptCount} attempts)
                      </div>
                    </div>
                  </div>
                  <Progress
                    value={question.correctRate}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Performance Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Student Performance</CardTitle>
          <CardDescription>View and sort student exam results</CardDescription>
        </CardHeader>
        <CardContent>
          {statistics.totalAttempts === 0 ? (
            <div className="py-6 text-center text-slate-500">No attempts have been made on this exam yet.</div>
          ) : (
            <div>
              <StudentPerformanceTable studentResults={statistics.studentResults} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
