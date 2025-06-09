'use client';

import { useState, useEffect } from 'react';
import { Trash, Plus, Pencil, MemoryStick, BookOpen, CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { IconBadge } from '@/components/icon-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Course {
  id: string;
  title: string;
}

interface Chapter {
  id: string;
  title: string;
}

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  chapterId: string;
  createdAt: Date;
}

interface FlashcardsClientProps {
  courses: Course[];
}

const formSchema = z.object({
  question: z.string().min(1, { message: 'السؤال مطلوب' }),
  answer: z.string().min(1, { message: 'الإجابة مطلوبة' }),
  chapterId: z.string().min(1, { message: 'الفصل مطلوب' }),
});

export const FlashcardsClient = ({ courses }: FlashcardsClientProps) => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [editingFlashcardId, setEditingFlashcardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
      answer: '',
      chapterId: '',
    },
  });

  // Fetch chapters when selected course changes
  useEffect(() => {
    if (selectedCourse) {
      fetchChapters(selectedCourse);
      fetchFlashcards(selectedCourse);
    }
  }, [selectedCourse]);

  // Reset form when editing flashcard changes
  useEffect(() => {
    if (editingFlashcardId) {
      const flashcard = flashcards.find((f) => f.id === editingFlashcardId);
      if (flashcard) {
        form.reset({
          question: flashcard.question,
          answer: flashcard.answer,
          chapterId: flashcard.chapterId,
        });
      }
    } else {
      form.reset({
        question: '',
        answer: '',
        chapterId: '',
      });
    }
  }, [editingFlashcardId, form, flashcards]);

  const fetchChapters = async (courseId: string) => {
    try {
      setIsLoading(true);

      // Fixed the API endpoint to get published chapters for the course
      const response = await axios.get(`/api/courses/${courseId}/chapters?isPublished=true`);

      if (Array.isArray(response.data)) {
        setChapters(response.data);
      } else {
        // Log the unexpected response format
        console.error('Unexpected chapters response format:', response.data);
        setChapters([]);
        toast.error('خطأ في تحميل الفصول (تنسيق غير متوقع)');
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
      toast.error('فشل في جلب الفصول');
      setChapters([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFlashcards = async (courseId: string) => {
    try {
      setIsLoading(true);
      // In a real implementation, you would fetch flashcards from the API
      const response = await axios.get(`/api/courses/${courseId}/flashcards`);
      setFlashcards(response.data);
    } catch (error) {
      toast.error('فشل في جلب البطاقات التعليمية');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);

      if (!selectedCourse) {
        toast.error('يرجى اختيار دورة أولاً');
        return;
      }

      if (editingFlashcardId) {
        // Update existing flashcard
        await axios.patch(`/api/flashcards/${editingFlashcardId}`, {
          ...values,
          courseId: selectedCourse, // Ensure courseId is included in the update
        });
        toast.success('تم تحديث البطاقة التعليمية بنجاح');
        setEditingFlashcardId(null);
      } else {
        // Create new flashcard

        await axios.post(`/api/courses/${selectedCourse}/flashcards`, {
          // courseId: selectedCourse,
          ...values,
        });
        toast.success('تم إنشاء البطاقة التعليمية بنجاح');
      }

      // Refresh flashcards list
      fetchFlashcards(selectedCourse);

      // Reset form
      form.reset({
        question: '',
        answer: '',
        chapterId: '',
      });
    } catch (error: any) {
      console.error('Flashcard submission error:', error.response);
      toast.error(error?.response?.data?.message || 'فشل في حفظ البطاقة التعليمية');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (flashcardId: string) => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/flashcards/${flashcardId}`);
      toast.success('تم حذف البطاقة التعليمية');

      // Refresh flashcards list
      if (selectedCourse) {
        fetchFlashcards(selectedCourse);
      }
    } catch (error) {
      toast.error('فشل في حذف البطاقة التعليمية');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEditing = () => {
    setEditingFlashcardId(null);
    form.reset({
      question: '',
      answer: '',
      chapterId: '',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <IconBadge icon={MemoryStick} variant="warning" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">إدارة البطاقات التعليمية</h1>
          <p className="text-muted-foreground">إنشاء وإدارة البطاقات التعليمية لدوراتك</p>
        </div>
      </div>

      <Separator className="bg-border/50" />

      <div className="grid grid-cols-1 gap-6">
        {/* Course Selection */}
        <Card className="border border-border/50 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <IconBadge icon={BookOpen} variant="info" size="sm" />
              اختيار الدورة
            </CardTitle>
            <p className="text-sm text-muted-foreground">اختر دورة لإدارة البطاقات التعليمية الخاصة بها</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {courses.map((course) => (
                <Card
                  key={course.id}
                  className={cn(
                    'cursor-pointer border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg',
                    selectedCourse === course.id
                      ? 'border-primary bg-primary/10 shadow-lg'
                      : 'border-border/50 bg-card/40 hover:border-primary/50',
                  )}
                  onClick={() => setSelectedCourse(course.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'rounded-lg p-2',
                          selectedCourse === course.id
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3
                          className={cn(
                            'truncate font-medium',
                            selectedCourse === course.id ? 'text-primary' : 'text-foreground',
                          )}
                        >
                          {course.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">انقر للاختيار</p>
                      </div>
                      {selectedCourse === course.id && (
                        <div className="rounded-full bg-primary p-1 text-primary-foreground">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {!selectedCourse && (
              <div className="mt-4 rounded-lg border border-dashed border-border/50 bg-muted/50 p-4">
                <div className="text-center">
                  <BookOpen className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">يرجى اختيار دورة لبدء إدارة البطاقات التعليمية</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content */}
        {selectedCourse && (
          <Card className="border border-border/50 bg-card/60 backdrop-blur-sm">
            <CardContent className="p-6">
              <Tabs defaultValue="create" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                  <TabsTrigger value="create" className="data-[state=active]:bg-background/80">
                    {editingFlashcardId ? 'تحرير البطاقة' : 'إنشاء بطاقة'}
                  </TabsTrigger>
                  <TabsTrigger value="manage" className="data-[state=active]:bg-background/80">
                    إدارة البطاقات
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="create" className="space-y-6">
                  <div className="rounded-lg border border-border/30 bg-muted/20 p-4">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="chapterId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium text-foreground">الفصل</FormLabel>
                              <FormControl>
                                <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                                  <SelectTrigger className="border-border/60 bg-background/50">
                                    <SelectValue placeholder="اختر فصلاً" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {chapters.map((chapter) => (
                                      <SelectItem key={chapter.id} value={chapter.id}>
                                        {chapter.title}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="question"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium text-foreground">السؤال</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="أدخل السؤال"
                                  disabled={isLoading}
                                  rows={3}
                                  className="resize-none border-border/60 bg-background/50"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="answer"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium text-foreground">الإجابة</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="أدخل الإجابة"
                                  disabled={isLoading}
                                  rows={3}
                                  className="resize-none border-border/60 bg-background/50"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-3 pt-2">
                          <Button type="submit" disabled={isLoading} className="flex-1">
                            {editingFlashcardId ? 'تحديث البطاقة' : 'إنشاء البطاقة'}
                          </Button>
                          {editingFlashcardId && (
                            <Button type="button" variant="outline" onClick={cancelEditing} className="flex-1">
                              إلغاء
                            </Button>
                          )}
                        </div>
                      </form>
                    </Form>
                  </div>
                </TabsContent>

                <TabsContent value="manage" className="space-y-4">
                  {flashcards.length === 0 ? (
                    <Card className="border-dashed bg-muted/30 backdrop-blur-sm">
                      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-4 rounded-full bg-gradient-to-br from-orange-500/10 to-red-500/10 p-6">
                          <MemoryStick className="h-12 w-12 text-orange-500 dark:text-orange-400" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-foreground">لا توجد بطاقات تعليمية</h3>
                        <p className="mb-4 max-w-sm text-muted-foreground">
                          لم يتم العثور على بطاقات تعليمية لهذه الدورة. ابدأ بإنشاء أول بطاقة تعليمية.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const element = document.querySelector('[data-value="create"]') as HTMLElement | null;
                            element?.click();
                          }}
                          className="hover:bg-primary/10"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          إنشاء أول بطاقة تعليمية
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {flashcards.map((flashcard) => {
                        const chapter = chapters.find((c) => c.id === flashcard.chapterId);

                        return (
                          <Card
                            key={flashcard.id}
                            className="border border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-200 hover:scale-[1.01] hover:shadow-lg"
                          >
                            <CardContent className="p-6">
                              <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="mb-2 flex items-center gap-2">
                                      <IconBadge icon={BookOpen} variant="info" size="sm" />
                                      <span className="text-sm font-medium text-muted-foreground">
                                        الفصل: {chapter?.title || 'غير معروف'}
                                      </span>
                                    </div>
                                    <div className="rounded-lg border border-border/30 bg-muted/20 p-3">
                                      <p className="mb-1 text-sm font-medium text-muted-foreground">السؤال:</p>
                                      <h3 className="font-semibold text-foreground">{flashcard.question}</h3>
                                    </div>
                                  </div>
                                  <div className="ml-4 flex space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingFlashcardId(flashcard.id)}
                                      className="hover:bg-primary/10"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDelete(flashcard.id)}
                                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                <Separator className="bg-border/30" />

                                <div className="rounded-lg border border-border/30 bg-muted/20 p-3">
                                  <p className="mb-1 text-sm font-medium text-muted-foreground">الإجابة:</p>
                                  <p className="text-foreground">{flashcard.answer}</p>
                                </div>

                                <div className="text-xs text-muted-foreground">
                                  تم الإنشاء: {new Date(flashcard.createdAt).toLocaleDateString('ar-SA')}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
