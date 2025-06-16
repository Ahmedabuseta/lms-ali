'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ExamPracticeSession } from './_components/exam-practice-session';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Clock, Home } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface ExamPracticePageProps {
  params: {
    courseId: string;
  };
}

interface SessionData {
  sessionId: string;
  courseId: string;
  mode: string;
  selectedChapters: { id: string; title: string }[];
  questions: any[];
  totalQuestions: number;
  timeLimit: number; // 45 minutes
}

const ExamPracticePage = ({ params }: ExamPracticePageProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('id');

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('معرف الجلسة مطلوب');
      setIsLoading(false);
      return;
    }

    const loadSession = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const storedSession = localStorage.getItem(`practice_session_${sessionId}`);

        if (storedSession) {
          const parsedSession = JSON.parse(storedSession);
          if (parsedSession.mode !== 'exam') {
            setError('نوع الجلسة غير صحيح - يجب أن تكون جلسة امتحان تدريبي');
            return;
          }
          
          // Check if session is expired
          if (parsedSession.expiresAt && new Date(parsedSession.expiresAt) < new Date()) {
            setError('جلسة الامتحان منتهية الصلاحية');
            localStorage.removeItem(`practice_session_${sessionId}`);
            return;
          }

          setSessionData(parsedSession);
        } else {
          setError('جلسة الامتحان منتهية الصلاحية أو غير موجودة');
        }
      } catch (error) { 
        console.error('Error loading session:', error);
        setError('خطأ في تحميل جلسة الامتحان');
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [sessionId, params.courseId]);

  const handleBackToPractice = () => {
    router.push(`/courses/${params.courseId}/practice`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/40 to-indigo-50/60 dark:from-background dark:via-blue-950/20 dark:to-purple-950/20 flex items-center justify-center animate-fade-in" dir="rtl">
        <Card className="w-full max-w-md shadow-xl border-0 bg-background/95 backdrop-blur-sm">
          <CardHeader className="text-center p-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                <Clock className="h-10 w-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-arabic-heading text-foreground">
              جاري تحميل الامتحان التدريبي
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-8 space-y-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="text-muted-foreground font-arabic">يرجى الانتظار...</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full animate-pulse transition-all duration-1000" style={{ width: '75%' }}></div>
        </div>
            <p className="text-xs text-muted-foreground font-arabic">
              تحضير الأسئلة والإعدادات...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/40 to-indigo-50/60 dark:from-background dark:via-blue-950/20 dark:to-purple-950/20 flex items-center justify-center animate-fade-in" dir="rtl">
        <Card className="w-full max-w-md shadow-xl border-0 bg-background/95 backdrop-blur-sm">
          <CardHeader className="text-center p-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                <AlertCircle className="h-10 w-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-arabic-heading text-foreground">
              خطأ في تحميل الامتحان
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6 pb-8">
            <Alert variant="destructive" className="text-right">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-arabic">
                {error || 'لم يتم العثور على جلسة الامتحان'}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground font-arabic">
                تأكد من صحة الرابط أو قم بإنشاء جلسة امتحان جديدة
              </p>
              
              <Button
                onClick={handleBackToPractice}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 font-arabic shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
          >
                <Home className="mr-2 h-5 w-5" />
            العودة إلى اختيار نوع التدريب
              </Button>
              
              <p className="text-xs text-muted-foreground font-arabic">
                يمكنك إنشاء جلسة امتحان جديدة من صفحة التدريب
              </p>
        </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ExamPracticeSession
        sessionData={sessionData}
        onExit={handleBackToPractice}
      />
    </div>
  );
};

export default ExamPracticePage;
