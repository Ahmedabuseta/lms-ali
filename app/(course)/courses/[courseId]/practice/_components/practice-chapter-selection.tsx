'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { BookOpen, Target, Trophy, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface Chapter { id: string;
  title: string;
  description: string | null;
  position: number;
  totalQuestions: number;
  practiceCount: number;
  averageScore: number;
  hasPractice: boolean; }

interface PracticeChapterSelectionProps { courseId: string;
  chapters: Chapter[];
  mode: 'exam' | 'free'; }

export const PracticeChapterSelection = ({ courseId,
  chapters,
  mode }: PracticeChapterSelectionProps) => { const router = useRouter();
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState([mode === 'exam' ? 20 : 10]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChapterToggle = (chapterId: string) => {
    setSelectedChapters(prev =>
      prev.includes(chapterId)
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
    setError(null); // Clear any previous errors };

  const handleSelectAll = () => { const availableChapters = chapters.filter(c => c.hasPractice).map(c => c.id);
    setSelectedChapters(prev =>
      prev.length === availableChapters.length ? [] : availableChapters
    );
    setError(null); };

  const totalAvailableQuestions = chapters
    .filter(c => selectedChapters.includes(c.id))
    .reduce((sum, c) => sum + c.totalQuestions, 0);

  const maxQuestions = Math.min(totalAvailableQuestions, mode === 'exam' ? 20 : 50);
  const minQuestions = mode === 'exam' ? 20 : 5;

  const validateSelection = () => {
    if (selectedChapters.length === 0) {
      setError('يرجى اختيار فصل واحد على الأقل');
      return false;
    }

    if (questionCount[0] < minQuestions) {
      setError(`الحد الأدنى لعدد الأسئلة هو ${minQuestions}`);
      return false;
    }

    if (questionCount[0] > maxQuestions) {
      setError(`الحد الأقصى لعدد الأسئلة هو ${maxQuestions}`);
      return false;
    }

    return true;
  };

  const startPractice = async () => {
    if (!validateSelection()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.post(`/api/courses/${courseId}/practice/session`, { chapterIds: selectedChapters,
        questionCount: questionCount[0],
        mode: mode, });

      const session = response.data;

      // Store session data in localStorage with expiration
      const sessionData = {
        ...session,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      };
      localStorage.setItem(`practice_session_${session.sessionId}`, JSON.stringify(sessionData));

      // Navigate to practice session
      if (mode === 'exam') {
        router.push(`/courses/${courseId}/practice/exam?id=${session.sessionId}`);
      } else {
        router.push(`/courses/${courseId}/practice/free?id=${session.sessionId}`);
      }

    } catch (error: any) { console.error('Error starting practice:', error);
      setError(error.response?.data?.message || 'حدث خطأ في بدء التدريب');
      toast.error(error.response?.data?.message || 'حدث خطأ في بدء التدريب'); } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      { error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error }</span>
        </div>
      )}

      {/* Practice Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            إعدادات التدريب { mode === 'exam' ? 'الامتحاني' : 'الحر' }
          </CardTitle>
          {mode === 'exam' && (
            <p className="text-sm text-gray-600">
              امتحان تدريبي بـ 20 سؤال لمدة 45 دقيقة
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          { mode === 'free' && (
            <div className="space-y-2">
              <Label>عدد الأسئلة: {questionCount[0] }</Label>
              <Slider
                value={questionCount}
                onValueChange={setQuestionCount}
                max={maxQuestions}
                min={minQuestions}
                step={1}
                className="w-full"
              />
              <p className="text-sm text-gray-500">
                الحد الأدنى: {minQuestions} سؤال | الحد الأقصى: {maxQuestions} سؤال
              </p>
            </div>
          )}

          { mode === 'exam' && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>تدريب امتحاني:</strong> 20 سؤال - 45 دقيقة - تقييم شامل
              </p>
            </div>
          ) }

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">الفصول المختارة: {selectedChapters.length}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={chapters.filter(c => c.hasPractice).length === 0}
            >
              { selectedChapters.length === chapters.filter(c => c.hasPractice).length
                ? 'إلغاء تحديد الكل'
                : 'تحديد الكل' }
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chapter Selection */}
      <div className="grid gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          اختر الفصول للتدريب
        </h2>

        <div className="grid gap-3">
          {chapters.map((chapter) => (
            <Card
              key={chapter.id}
              className={ `cursor-pointer transition-all ${
                selectedChapters.includes(chapter.id)
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50' } ${ !chapter.hasPractice ? 'opacity-50' : '' }`}
              onClick={() => chapter.hasPractice && handleChapterToggle(chapter.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedChapters.includes(chapter.id)}
                      disabled={!chapter.hasPractice}
                      onChange={() => {}}
                    />
                    <div>
                      <h3 className="font-medium">
                        الفصل {chapter.position}: {chapter.title}
                      </h3>
                      {chapter.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {chapter.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {chapter.totalQuestions} سؤال
                    </Badge>
                    {chapter.practiceCount > 0 && (
                      <Badge variant="outline" className="text-green-600">
                        <Trophy className="h-3 w-3 mr-1" />
                        {chapter.practiceCount} تدريب
                      </Badge>
                    )}
                    {chapter.averageScore > 0 && (
                      <Badge variant="outline" className="text-blue-600">
                        {Math.round(chapter.averageScore)}%
                      </Badge>
                    )}
                    {!chapter.hasPractice && (
                      <Badge variant="destructive">
                        لا توجد أسئلة
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Start Practice Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={startPractice}
          disabled={selectedChapters.length === 0 || isLoading}
          size="lg"
          className="px-8"
        >
          { isLoading
            ? 'جاري البدء...'
            : mode === 'exam'
            ? `بدء الامتحان التدريبي (${selectedChapters.length } فصل)`
            : `بدء التدريب الحر (${selectedChapters.length} فصل)`
          }
        </Button>
      </div>
    </div>
  );
};
