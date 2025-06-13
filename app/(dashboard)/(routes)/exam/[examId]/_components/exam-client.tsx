'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Loader2, AlertCircle, Clock, Users, Target, CheckCircle, XCircle, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger, } from '@/components/ui/alert-dialog';

interface ExamAttempt { id: string;
  startedAt: string;
  completedAt?: string;
  score?: number;
  isPassed?: boolean;
  timeSpent?: number;
  isTimedOut?: boolean; }

interface ExamStats { totalAttempts: number;
  completedAttempts: number;
  remainingAttempts: number;
  bestScore?: number;
  averageScore?: number;
  hasPassedAttempt: boolean; }

interface ExamInfo { title: string;
  timeLimit?: number;
  totalQuestions: number;
  maxAttempts: number;
  passingScore: number; }

interface ExamClientProps { examId: string;
  activeAttemptId?: string;
  timeLimit?: number | null;
  userId?: string;
  title?: string;
  totalQuestions?: number;
  maxAttempts?: number;
  passingScore?: number; }

export const ExamClient = ({ examId,
  activeAttemptId,
  timeLimit,
  userId,
  title = 'امتحان',
  totalQuestions = 0,
  maxAttempts = 1,
  passingScore = 70, }: ExamClientProps) => { const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [stats, setStats] = useState<ExamStats | null>(null);
  const [examInfo, setExamInfo] = useState<ExamInfo | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Load exam attempts and stats
  useEffect(() => {
    loadExamData(); }, [examId]);

  const loadExamData = async () => {
    try {
      const response = await axios.get(`/api/exam/${examId}/attempt`);
      const data = response.data;

      setAttempts(data.attempts || []);
      setStats(data.stats || null);
      setExamInfo(data.exam || null);
    } catch (error) { console.error('Failed to load exam data:', error);
      // Don't show error for this, as it's not critical }
  };

  const handleExamStart = async () => { try {
      setIsLoading(true);
      setError(null);

      // If there's an active attempt, redirect to it
      if (activeAttemptId) {
        router.push(`/exam/${examId }/attempt/${activeAttemptId}`);
        return;
      }

      // Otherwise, create a new attempt
      const response = await axios.post(
        `/api/exam/${examId}/attempt`,
        {},
        { timeout: 15000, // 15s timeout },
      );

      const data = response.data;

      if (data.isExisting) {
        toast.success(data.message || 'تم استئناف المحاولة');
      } else {
        toast.success(data.message || 'تم بدء الامتحان بنجاح');
      }

      router.push(`/exam/${examId}/attempt/${data.attempt.id}`);
    } catch (error: any) { console.error('Exam start error:', error);

      if (error.response?.data) {
        const errorData = error.response.data;

        if (errorData.maxAttemptsReached) {
          setError(`لقد وصلت إلى الحد الأقصى من المحاولات (${errorData.maxAttempts || maxAttempts })`);
        } else if (errorData.requiresAccess) {
          setError(`${errorData.message}\nالفصل: ${errorData.chapterTitle || 'غير محدد'}`);
        } else if (errorData.timeExpired) {
          setError(errorData.message);
          // Reload data to update UI
          loadExamData();
        } else {
          setError(errorData.message || 'فشل في بدء الامتحان');
        }
      } else if (error.code === 'ECONNABORTED') {
        setError('انتهت مهلة الاتصال. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.');
      } else {
        setError('فشل في بدء الامتحان. برجاء المحاولة مرة أخرى.');
      }

      toast.error('فشل في بدء الامتحان');
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const continueAttempt = () => {
    if (activeAttemptId) {
      setIsLoading(true);
      router.push(`/exam/${examId}/attempt/${activeAttemptId}`);
    }
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return 'غير محدد';
    if (minutes < 60) return `${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} ساعة${mins > 0 ? ` و ${mins} دقيقة` : ''}`;
  };

  const formatDate = (dateString: string) => { return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit', });
  };

  const getScoreColor = (score: number) => {
    if (score >= passingScore) return 'text-green-600';
    if (score >= passingScore * 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= passingScore) return 'default';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="whitespace-pre-line">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Exam Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأسئلة</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مدة الامتحان</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(timeLimit || undefined)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المحاولات المتاحة</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? `${stats.remainingAttempts}/${maxAttempts}` : `${maxAttempts}`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">درجة النجاح</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{passingScore}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Card */}
      { stats && stats.totalAttempts > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>إحصائياتك</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.completedAttempts }</div>
                <div className="text-sm text-muted-foreground">محاولات مكتملة</div>
              </div>

              {stats.bestScore !== null && (
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(stats.bestScore)}`}>
                    {stats.bestScore}%
                  </div>
                  <div className="text-sm text-muted-foreground">أفضل نتيجة</div>
                </div>
              )}

              {stats.averageScore !== null && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{stats.averageScore}%</div>
                  <div className="text-sm text-muted-foreground">متوسط النتائج</div>
                </div>
              )}
            </div>

            {stats.hasPassedAttempt && (
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">لقد نجحت في هذا الامتحان</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col space-y-4">
        {activeAttemptId ? (
          <Button
            onClick={continueAttempt}
            disabled={isLoading}
            size="lg"
            className="w-full"
          >
            { isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري التحميل...
              </>
            ) : (
              <>
                <Timer className="mr-2 h-4 w-4" />
                متابعة الامتحان
              </>
            ) }
          </Button>
        ) : (
          <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogTrigger asChild>
              <Button
                disabled={isLoading || (stats?.remainingAttempts === 0)}
                size="lg"
                className="w-full"
              >
                { isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري البدء...
                  </>
                ) : stats?.remainingAttempts === 0 ? (
                  'لا توجد محاولات متبقية'
                ) : (
                  'بدء الامتحان'
                ) }
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
                <AlertDialogTitle>تأكيد بدء الامتحان</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>هل أنت متأكد من أنك تريد بدء الامتحان؟</p>
                  <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
                    <p><strong>عدد الأسئلة:</strong> {totalQuestions}</p>
                    <p><strong>مدة الامتحان:</strong> {formatTime(timeLimit || undefined)}</p>
                    <p><strong>المحاولات المتبقية:</strong> {stats?.remainingAttempts || maxAttempts}</p>
                    <p><strong>درجة النجاح:</strong> {passingScore}%</p>
                  </div>
                  <p className="text-destructive font-medium">
                    تذكر: لا يمكنك إيقاف الامتحان بعد البدء!
                  </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
              <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={handleExamStart} disabled={isLoading}>
                  { isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري البدء...
                    </>
                  ) : (
                    'بدء الامتحان'
                  ) }
                </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        )}
      </div>

      {/* Previous Attempts */}
      {attempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>المحاولات السابقة</CardTitle>
            <CardDescription>
              آخر {attempts.length} محاولات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              { attempts.map((attempt, index) => (
                <div
                  key={attempt.id }
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium">
                      المحاولة {attempts.length - index}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(attempt.completedAt || attempt.startedAt)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {attempt.score !== undefined && (
                      <Badge variant={getScoreBadgeVariant(attempt.score)}>
                        {attempt.score}%
                      </Badge>
                    )}

                    { attempt.isPassed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    ) }

                    {attempt.isTimedOut && (
                      <Badge variant="outline" className="text-orange-600">
                        انتهت المدة
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
