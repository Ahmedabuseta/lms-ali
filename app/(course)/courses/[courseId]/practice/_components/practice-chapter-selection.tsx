'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Target, Trophy, Settings, AlertCircle, Zap, Clock, CheckCircle, Brain, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { Preview } from '@/components/preview';

interface Chapter {
  id: string;
  title: string;
  description: string | null;
  position: number;
  totalQuestions: number;
  practiceCount: number;
  uniqueQuestionsAttempted: number;
  correctAttempts: number;
  averageScore: number;
  totalPointsEarned: number;
  timeSpent: number; // in minutes
  completionPercentage: number;
  hasPractice: boolean;
}

interface PracticeChapterSelectionProps {
  courseId: string;
  chapters: Chapter[];
  mode: 'exam' | 'free';
}

export const PracticeChapterSelection = ({ courseId, chapters, mode }: PracticeChapterSelectionProps) => {
  const router = useRouter();
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState([20]);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChapterToggle = (chapterId: string) => {
    setSelectedChapters(prev => 
      prev.includes(chapterId) 
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
    setError(null);
  };

  const handleStartPractice = async () => {
    if (selectedChapters.length === 0) {
      setError('يرجى اختيار فصل واحد على الأقل للتدريب');
      return;
    }

    setIsStarting(true);
    setError(null);

    try {
      const response = await axios.post(`/api/courses/${courseId}/practice/session`, {
        mode,
        selectedChapters,
        questionCount: mode === 'exam' ? 20 : questionCount[0],
        timeLimit: mode === 'exam' ? 45 : null
      });

      const sessionData = response.data;
      
      // Store session data in localStorage with expiration
      localStorage.setItem(`practice_session_${sessionData.sessionId}`, JSON.stringify(sessionData));
      
      if (mode === 'exam') {
        router.push(`/courses/${courseId}/practice/exam?id=${sessionData.sessionId}`);
      } else {
        router.push(`/courses/${courseId}/practice/free?id=${sessionData.sessionId}`);
      }
    } catch (error: any) {
      console.error('Error starting practice:', error);
      const errorMessage = error.response?.data?.message || error.message || 'حدث خطأ أثناء بدء التدريب';
      setError(errorMessage);
      toast.error('فشل في بدء التدريب');
    } finally {
      setIsStarting(false);
    }
  };

  const availableChapters = chapters.filter(chapter => chapter.hasPractice);
  const totalQuestions = selectedChapters.reduce((sum, chapterId) => {
    const chapter = chapters.find(c => c.id === chapterId);
    return sum + (chapter?.totalQuestions || 0);
  }, 0);

  const maxQuestions = mode === 'exam' ? 20 : Math.min(totalQuestions, 50);

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in px-1 sm:px-2 lg:px-0 max-w-full" dir="rtl">
      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="animate-slide-up">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-arabic text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {/* Practice Settings */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-background to-blue-50/30 dark:to-blue-950/10">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-arabic-heading">
            <div className={cn(
              "p-2 rounded-lg shadow-sm",
              mode === 'exam' 
                ? "bg-gradient-to-r from-blue-500 to-indigo-500" 
                : "bg-gradient-to-r from-green-500 to-emerald-500"
            )}>
              {mode === 'exam' ? <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" /> : <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-white" />}
            </div>
            إعدادات التدريب {mode === 'exam' ? 'الامتحاني' : 'الحر'}
          </CardTitle>
          {mode === 'exam' && (
            <CardDescription className="text-muted-foreground font-arabic text-sm sm:text-base">
              امتحان تدريبي شامل بـ 20 سؤال لمدة 45 دقيقة مع تقييم دقيق للأداء
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4 sm:space-y-6">
          {mode === 'free' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium font-arabic">عدد الأسئلة</Label>
                <Badge variant="outline" className="font-arabic">{questionCount[0]} سؤال</Badge>
              </div>
              <Slider
                value={questionCount}
                onValueChange={setQuestionCount}
                max={maxQuestions}
                min={5}
                step={5}
                className="w-full"
                disabled={selectedChapters.length === 0}
              />
              <div className="flex justify-between text-xs text-muted-foreground font-arabic">
                <span>5 أسئلة</span>
                <span>{maxQuestions} سؤال</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 bg-white/60 dark:bg-card/60 rounded-lg border border-border/50">
            {[
              { 
                icon: mode === 'exam' ? Clock : Brain, 
                label: mode === 'exam' ? "مدة الامتحان" : "نوع التدريب", 
                value: mode === 'exam' ? "45 دقيقة" : "تدريب حر",
                color: mode === 'exam' ? "text-blue-600" : "text-green-600"
              },
              { 
                icon: Target, 
                label: "عدد الأسئلة", 
                value: mode === 'exam' ? "20 سؤال" : `${questionCount[0]} سؤال`,
                color: "text-purple-600"
              },
              { 
                icon: Trophy, 
                label: "نوع التقييم", 
                value: mode === 'exam' ? "تقييم شامل" : "تدريب مرن",
                color: "text-orange-600"
              }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 sm:gap-3 text-sm p-2 bg-white/40 dark:bg-card/40 rounded-lg">
                <item.icon className={cn("h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0", item.color)} />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-foreground font-arabic text-xs sm:text-sm">{item.label}</div>
                  <div className={cn("text-xs sm:text-sm font-semibold", item.color, "font-arabic")}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chapter Selection */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4 sm:pb-6">
          <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-sm">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold font-arabic-heading">اختر الفصول للتدريب</CardTitle>
            </div>
          </div>
          <CardDescription className="text-muted-foreground font-arabic">
            اختر الفصول التي تريد التدرب عليها ({selectedChapters.length} من {availableChapters.length} مُختار)
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6">
          {availableChapters.length === 0 ? (
            <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 dark:text-orange-200 font-arabic">
                لا توجد فصول متاحة للتدريب حالياً
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4">
              {availableChapters.map((chapter, index) => (
                <Card
                  key={chapter.id}
                  className={cn(
                    "group cursor-pointer transition-all duration-300 hover:shadow-lg",
                    selectedChapters.includes(chapter.id)
                      ? 'ring-2 ring-primary/50 bg-gradient-to-r from-primary/5 to-blue-50/50 dark:from-primary/10 dark:to-blue-950/20 shadow-md'
                      : 'hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-blue-50/30 dark:hover:from-gray-900/50 dark:hover:to-blue-950/20',
                    "border-0 shadow-sm"
                  )}
                  onClick={() => handleChapterToggle(chapter.id)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                        <Checkbox
                          checked={selectedChapters.includes(chapter.id)}
                          onChange={() => {}}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-1 flex-shrink-0"
                        />
                        <div className="space-y-2 min-w-0 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <h3 className="font-semibold text-base sm:text-lg font-arabic-heading text-foreground">
                              {chapter.title}
                            </h3>
                            <Badge variant="outline" className="text-xs font-arabic w-fit">
                              الفصل {chapter.position}
                            </Badge>
                          </div>
                          {chapter.description && (
                            <p className="text-sm text-muted-foreground font-arabic leading-relaxed">
                              
                              <Preview value={chapter.description } />
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 lg:gap-2 text-sm w-full">
                        <div className="text-center p-2 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg">
                          <div className="text-sm sm:text-base lg:text-lg font-bold text-blue-600 font-arabic-heading">
                            {chapter.totalQuestions}
                          </div>
                          <div className="text-xs text-muted-foreground font-arabic leading-tight">سؤال متاح</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50/50 dark:bg-purple-950/20 rounded-lg">
                          <div className="text-sm sm:text-base lg:text-lg font-bold text-purple-600 font-arabic-heading">
                            {chapter.uniqueQuestionsAttempted}
                          </div>
                          <div className="text-xs text-muted-foreground font-arabic leading-tight">سؤال تم حله</div>
                        </div>
                        <div className="text-center p-2 bg-green-50/50 dark:bg-green-950/20 rounded-lg">
                          <div className="text-sm sm:text-base lg:text-lg font-bold text-green-600 font-arabic-heading">
                            {chapter.correctAttempts}
                          </div>
                          <div className="text-xs text-muted-foreground font-arabic leading-tight">إجابة صحيحة</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50/50 dark:bg-gray-950/20 rounded-lg">
                          <div className={cn(
                            "text-sm sm:text-base lg:text-lg font-bold font-arabic-heading",
                            chapter.averageScore >= 80 ? "text-green-600" :
                            chapter.averageScore >= 60 ? "text-yellow-600" : "text-red-600"
                          )}>
                            {chapter.averageScore}%
                          </div>
                          <div className="text-xs text-muted-foreground font-arabic leading-tight">دقة الإجابات</div>
                        </div>
                        <div className="text-center p-2 bg-orange-50/50 dark:bg-orange-950/20 rounded-lg">
                          <div className="text-sm sm:text-base lg:text-lg font-bold text-orange-600 font-arabic-heading">
                            {chapter.timeSpent}د
                          </div>
                          <div className="text-xs text-muted-foreground font-arabic leading-tight">وقت مستغرق</div>
                        </div>
                        <div className="text-center p-2 bg-yellow-50/50 dark:bg-yellow-950/20 rounded-lg">
                          <div className={cn(
                            "text-sm sm:text-base lg:text-lg font-bold font-arabic-heading",
                            chapter.completionPercentage >= 80 ? "text-green-600" :
                            chapter.completionPercentage >= 50 ? "text-yellow-600" : "text-red-600"
                          )}>
                            {chapter.completionPercentage}%
                          </div>
                          <div className="text-xs text-muted-foreground font-arabic leading-tight">نسبة الإنجاز</div>
                        </div>
                        <div className="text-center p-2 bg-pink-50/50 dark:bg-pink-950/20 rounded-lg col-span-2 sm:col-span-1">
                          <div className="text-sm sm:text-base lg:text-lg font-bold text-pink-600 font-arabic-heading">
                            {chapter.totalPointsEarned}
                          </div>
                          <div className="text-xs text-muted-foreground font-arabic leading-tight">نقطة مكتسبة</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Selection Summary */}
          {selectedChapters.length > 0 && (
            <Card className="bg-gradient-to-r from-green-50/50 to-emerald-50/30 dark:from-green-950/10 dark:to-emerald-950/10 border-green-200/50 dark:border-green-800/50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-green-900 dark:text-green-100 font-arabic-heading">
                        تم اختيار {selectedChapters.length} فصل
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300 font-arabic">
                        إجمالي الأسئلة المتاحة: {totalQuestions} سؤال
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleStartPractice}
                    disabled={isStarting}
                    className={cn(
                      "font-arabic-heading shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto",
                      mode === 'exam' 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    )}
                    size="lg"
                  >
                    {isStarting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        جاري البدء...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        بدء التدريب
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PracticeChapterSelection; 