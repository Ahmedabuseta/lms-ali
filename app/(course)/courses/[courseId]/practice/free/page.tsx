'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FreePracticeSession } from './_components/free-practice-session';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Brain, Home } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface FreePracticePageProps {
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
  timeLimit: null;
}

const FreePracticePage = ({ params }: FreePracticePageProps) => {
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
          if (parsedSession.mode !== 'free') {
            setError('نوع الجلسة غير صحيح - يجب أن تكون جلسة تدريب حر');
            return;
          }
          
          // Check if session is expired
          if (parsedSession.expiresAt && new Date(parsedSession.expiresAt) < new Date()) {
            setError('جلسة التدريب منتهية الصلاحية');
            localStorage.removeItem(`practice_session_${sessionId}`);
            return;
          }

          setSessionData(parsedSession);
        } else {
          setError('جلسة التدريب منتهية الصلاحية أو غير موجودة');
        }
      } catch (error) { 
        console.error('Error loading session:', error);
        setError('خطأ في تحميل جلسة التدريب');
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
      <div className="min-h-screen bg-gradient-to-br from-background via-green-50/40 to-emerald-50/60 dark:from-background dark:via-green-950/20 dark:to-emerald-950/20 flex items-center justify-center animate-fade-in px-4" dir="rtl">
        <Card className="w-full max-w-sm sm:max-w-md shadow-xl border-0 bg-background/95 backdrop-blur-sm">
          <CardHeader className="text-center p-6 sm:p-8">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-arabic-heading text-foreground">
              جاري تحميل التدريب الحر
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-6 sm:pb-8 space-y-4 sm:space-y-6">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-green-600" />
              <span className="text-sm sm:text-base text-muted-foreground font-arabic">يرجى الانتظار...</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 sm:h-3 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 sm:h-3 rounded-full animate-pulse transition-all duration-1000" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-arabic">
              تحضير الأسئلة للتدريب المرن...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-green-50/40 to-emerald-50/60 dark:from-background dark:via-green-950/20 dark:to-emerald-950/20 flex items-center justify-center animate-fade-in px-4" dir="rtl">
        <Card className="w-full max-w-sm sm:max-w-md shadow-xl border-0 bg-background/95 backdrop-blur-sm">
          <CardHeader className="text-center p-6 sm:p-8">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-arabic-heading text-foreground">
              خطأ في تحميل التدريب
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4 sm:space-y-6 pb-6 sm:pb-8">
            <Alert variant="destructive" className="text-right">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-arabic text-sm">
                {error || 'لم يتم العثور على جلسة التدريب'}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3 sm:space-y-4">
              <p className="text-sm text-muted-foreground font-arabic">
                تأكد من صحة الرابط أو قم بإنشاء جلسة تدريب حر جديدة
              </p>
              
              <Button
                onClick={handleBackToPractice}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 font-arabic shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                <Home className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                العودة إلى اختيار نوع التدريب
              </Button>
              
              <p className="text-xs text-muted-foreground font-arabic">
                يمكنك إنشاء جلسة تدريب حر جديدة من صفحة التدريب
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <FreePracticeSession
        sessionData={sessionData}
        onExit={handleBackToPractice}
      />
    </div>
  );
};

export default FreePracticePage;
