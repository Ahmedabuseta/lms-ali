'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PracticeSession } from './_components/practice-session';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface PracticeSessionPageProps {
  params: {
    courseId: string;
  };
}

interface PracticeSessionData {
  sessionId: string;
  courseId: string;
  selectedChapters: { id: string; title: string }[];
  questions: any[];
  totalQuestions: number;
}

const PracticeSessionPage = ({ params }: PracticeSessionPageProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('id');
  
  const [sessionData, setSessionData] = useState<PracticeSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      toast.error('معرف الجلسة مطلوب');
      router.push(`/courses/${params.courseId}/practice`);
      return;
    }

    // Load session data from localStorage or API
    const loadSession = async () => {
      try {
        setIsLoading(true);
        
        // Check if session data exists in localStorage first
        const storedSession = localStorage.getItem(`practice_session_${sessionId}`);
        
        if (storedSession) {
          const parsedSession = JSON.parse(storedSession);
          setSessionData(parsedSession);
        } else {
          // If no stored session, redirect back to selection
          toast.error('جلسة التدريب منتهية الصلاحية');
          router.push(`/courses/${params.courseId}/practice`);
        }
      } catch (error) {
        console.error('Error loading session:', error);
        toast.error('خطأ في تحميل جلسة التدريب');
        router.push(`/courses/${params.courseId}/practice`);
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
          <p className="text-gray-600">جاري تحميل جلسة التدريب...</p>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">لم يتم العثور على جلسة التدريب</p>
          <button
            onClick={() => router.push(`/courses/${params.courseId}/practice`)}
            className="text-blue-600 hover:underline"
          >
            العودة إلى اختيار الفصول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PracticeSession
        sessionData={sessionData}
        onExit={() => router.push(`/courses/${params.courseId}/practice`)}
      />
    </div>
  );
};

export default PracticeSessionPage; 