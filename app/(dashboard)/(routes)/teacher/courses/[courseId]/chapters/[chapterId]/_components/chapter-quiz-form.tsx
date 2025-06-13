'use client';

import * as z from 'zod';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Pencil, PlusCircle, FileQuestion, Clock, Award, Settings } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ConfirmModal } from '@/components/modals/confirm-modal';

interface ChapterQuizFormProps {
  initialData?: {
    id: string;
    title: string;
    description?: string;
    timeLimit?: number;
    requiredScore: number;
    freeAttempts: number;
    isPublished: boolean;
    quizQuestions?: any[];
  };
  courseId: string;
  chapterId: string;
}

const formSchema = z.object({
  title: z.string().min(1, {
    message: 'Quiz title is required',
  }),
  description: z.string().optional(),
  timeLimit: z.coerce.number().min(0).optional(),
  requiredScore: z.coerce.number().min(0).max(100).default(100),
  freeAttempts: z.coerce.number().min(-1).default(-1),
  isPublished: z.boolean().default(false),
});

export const ChapterQuizForm = ({ initialData, courseId, chapterId }: ChapterQuizFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      timeLimit: initialData?.timeLimit || undefined,
      requiredScore: initialData?.requiredScore || 100,
      freeAttempts: initialData?.freeAttempts || -1,
      isPublished: initialData?.isPublished || false,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      if (initialData) {
        await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}/quiz`, values);
        toast.success('Quiz updated');
      } else {
        await axios.post(`/api/courses/${courseId}/chapters/${chapterId}/quiz`, values);
        toast.success('Quiz created');
      }
      toggleEdit();
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/courses/${courseId}/chapters/${chapterId}/quiz`);
      toast.success('Quiz deleted');
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const onPublish = async () => {
    try {
      setIsLoading(true);
      if (initialData?.isPublished) {
        await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}/quiz/unpublish`);
        toast.success('Quiz unpublished');
      } else {
        await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}/quiz/publish`);
        toast.success('Quiz published');
      }
      router.refresh();
    } catch (error: any) {
      const message = error.response?.data || 'Something went wrong';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const questionCount = initialData?.quizQuestions?.length || 0;
  const hasQuestions = questionCount > 0;

  return (
    <Card className="border border-purple-200/60 bg-purple-50/80 backdrop-blur-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:bg-purple-50/90 dark:border-purple-400/20 dark:bg-purple-900/10 dark:hover:bg-purple-900/15">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 p-3 shadow-lg">
            <FileQuestion className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100 font-arabic">
              اختبار الفصل
            </CardTitle>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <FileQuestion className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-purple-700 dark:text-purple-300 font-arabic">
                  {questionCount} أسئلة
                </span>
              </div>
              {initialData?.isPublished && (
                <Badge variant="success" className="font-arabic">منشور</Badge>
              )}
              {!initialData?.isPublished && hasQuestions && (
                <Badge variant="secondary" className="font-arabic">غير منشور</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={toggleEdit} variant="ghost" size="sm">
              {isEditing ? (
                <span className="font-arabic">إلغاء</span>
              ) : (
                <>
                  <Pencil className="h-4 w-4 ml-2" />
                  <span className="font-arabic">تعديل</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!isEditing && !initialData && (
          <div className="text-center py-8">
            <FileQuestion className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <p className="text-purple-700 dark:text-purple-300 font-arabic mb-4">
              لم يتم إنشاء اختبار لهذا الفصل بعد
            </p>
            <Button onClick={toggleEdit} className="font-arabic">
              <PlusCircle className="h-4 w-4 ml-2" />
              إنشاء اختبار
            </Button>
          </div>
        )}

        {!isEditing && initialData && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 font-arabic">
                {initialData.title}
              </h3>
              {initialData.description && (
                <p className="text-purple-700 dark:text-purple-300 mt-2 font-arabic">
                  {initialData.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-xs text-purple-600 font-arabic">المدة الزمنية</p>
                  <p className="font-semibold text-purple-900 dark:text-purple-100 font-arabic">
                    {initialData.timeLimit ? `${initialData.timeLimit} دقيقة` : 'غير محدود'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-xs text-purple-600 font-arabic">الدرجة المطلوبة</p>
                  <p className="font-semibold text-purple-900 dark:text-purple-100 font-arabic">
                    {initialData.requiredScore}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-xs text-purple-600 font-arabic">المحاولات المجانية</p>
                  <p className="font-semibold text-purple-900 dark:text-purple-100 font-arabic">
                    {initialData.freeAttempts === -1 ? 'غير محدود' : initialData.freeAttempts}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <FileQuestion className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-xs text-purple-600 font-arabic">عدد الأسئلة</p>
                  <p className="font-semibold text-purple-900 dark:text-purple-100 font-arabic">
                    {questionCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Link href={`/teacher/courses/${courseId}/chapters/${chapterId}/quiz/questions`}>
                <Button variant="outline" className="font-arabic">
                  <FileQuestion className="h-4 w-4 ml-2" />
                  إدارة الأسئلة
                </Button>
              </Link>
              
              {hasQuestions && (
                <ConfirmModal
                  onConfirm={onPublish}
                  title={initialData.isPublished ? 'إلغاء نشر الاختبار' : 'نشر الاختبار'}
                  description={
                    initialData.isPublished 
                      ? 'هل أنت متأكد من إلغاء نشر هذا الاختبار؟ لن يتمكن الطلاب من الوصول إليه.' 
                      : 'هل أنت متأكد من نشر هذا الاختبار؟ سيتمكن الطلاب من الوصول إليه.'
                  }
                >
                  <Button
                    variant={initialData.isPublished ? "secondary" : "default"}
                    disabled={isLoading}
                    className="font-arabic"
                  >
                    {isLoading ? 'جاري التحديث...' : (initialData.isPublished ? 'إلغاء النشر' : 'نشر الاختبار')}
                  </Button>
                </ConfirmModal>
              )}

              <ConfirmModal
                onConfirm={onDelete}
                title="حذف الاختبار"
                description="هل أنت متأكد من حذف هذا الاختبار؟ سيتم حذف جميع الأسئلة والإجابات نهائياً."
              >
                <Button
                  variant="destructive"
                  disabled={isLoading}
                  className="font-arabic"
                >
                  {isLoading ? 'جاري الحذف...' : 'حذف الاختبار'}
                </Button>
              </ConfirmModal>
            </div>
          </div>
        )}

        {isEditing && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-arabic">عنوان الاختبار</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="مثال: اختبار الفصل الأول"
                        {...field}
                        className="font-arabic"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-arabic">وصف الاختبار</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={isSubmitting}
                        placeholder="وصف مختصر عن محتوى الاختبار..."
                        {...field}
                        className="font-arabic"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="timeLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-arabic">المدة الزمنية (بالدقائق)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isSubmitting}
                          placeholder="30"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription className="font-arabic">
                        اتركه فارغاً لعدم تحديد وقت
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requiredScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-arabic">الدرجة المطلوبة للنجاح (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          disabled={isSubmitting}
                          placeholder="100"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="freeAttempts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-arabic">المحاولات المجانية</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="-1"
                          disabled={isSubmitting}
                          placeholder="-1"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="font-arabic">
                        -1 للمحاولات غير المحدودة
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center gap-x-2">
                <Button disabled={!isValid || isSubmitting} type="submit" className="font-arabic">
                  {initialData ? 'حفظ التغييرات' : 'إنشاء الاختبار'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}; 