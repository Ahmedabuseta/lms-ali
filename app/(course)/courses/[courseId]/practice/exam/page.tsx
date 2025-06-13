'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ExamPracticeSession } from './_components/exam-practice-session';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ExamPracticePageProps { params: {
    courseId: string; };
}

interface SessionData { sessionId: string;
  courseId: string;
  mode: string;
  selectedChapters: { id: string; title: string }[];
  questions: any[];
  totalQuestions: number;
  timeLimit: number; // 45 minutes
}

const ExamPracticePage = ({ params }: ExamPracticePageProps) => { const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('id');

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      toast.error('معرف الجلسة مطلوب');
      router.push(`/courses/${params.courseId }/practice`);
      return;
    }

    const loadSession = async () => {
      try {
        setIsLoading(true);

        const storedSession = localStorage.getItem(`practice_session_${sessionId}`);

        if (storedSession) {
          const parsedSession = JSON.parse(storedSession);
          if (parsedSession.mode !== 'exam') {
            toast.error('نوع الجلسة غير صحيح');
            router.push(`/courses/${params.courseId}/practice`);
            return;
          }
          setSessionData(parsedSession);
        } else {
          toast.error('جلسة الامتحان منتهية الصلاحية');
          router.push(`/courses/${params.courseId}/practice`);
        }
      } catch (error) { console.error('Error loading session:', error);
        toast.error('خطأ في تحميل جلسة الامتحان');
        router.push(`/courses/${params.courseId }/practice`);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [sessionId, params.courseId, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل الامتحان التدريبي...</p>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">لم يتم العثور على جلسة الامتحان</p>
          <button
            onClick={() => router.push(`/courses/${params.courseId}/practice`)}
            className="text-blue-600 hover:underline"
          >
            العودة إلى اختيار نوع التدريب
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ExamPracticeSession
        sessionData={sessionData}
        onExit={() => router.push(`/courses/${params.courseId}/practice`)}
      />
    </div>
  );
};

export default ExamPracticePage;
