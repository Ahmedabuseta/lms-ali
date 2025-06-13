'use client';

import * as z from 'zod';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Save, X, Settings, Eye, EyeOff } from 'lucide-react';

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmModal } from '@/components/modals/confirm-modal';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  title: z.string().min(1, 'Quiz title is required'),
  description: z.string().optional(),
  timeLimit: z.coerce.number().min(1).optional(),
  requiredScore: z.coerce.number().min(0).max(100).default(100),
  freeAttempts: z.coerce.number().min(-1).default(-1),
});

interface QuizSettingsProps {
  courseId: string;
  chapterId: string;
  quiz: {
    id: string;
    title: string;
    description?: string | null;
    timeLimit?: number | null;
    requiredScore: number;
    freeAttempts: number;
    isPublished: boolean;
  };
}

export const QuizSettings = ({ courseId, chapterId, quiz }: QuizSettingsProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: quiz.title,
      description: quiz.description || '',
      timeLimit: quiz.timeLimit || undefined,
      requiredScore: quiz.requiredScore,
      freeAttempts: quiz.freeAttempts,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}/quiz`, values);

      toast.success('تم تحديث إعدادات الاختبار بنجاح');
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ ما');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsDeleting(true);

      await axios.delete(`/api/courses/${courseId}/chapters/${chapterId}/quiz`);

      toast.success('تم حذف الاختبار بنجاح');
      router.push(`/teacher/courses/${courseId}/chapters/${chapterId}`);
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ في حذف الاختبار');
    } finally {
      setIsDeleting(false);
    }
  };

  const onPublishToggle = async () => {
    try {
      setIsPublishing(true);

      const endpoint = quiz.isPublished ? 'unpublish' : 'publish';
      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}/quiz/${endpoint}`);

      const message = quiz.isPublished 
        ? 'تم إلغاء نشر الاختبار بنجاح' 
        : 'تم نشر الاختبار بنجاح';
      
      toast.success(message);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data || 'حدث خطأ ما';
      toast.error(errorMessage);
    } finally {
      setIsPublishing(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      form.reset({
        title: quiz.title,
        description: quiz.description || '',
        timeLimit: quiz.timeLimit || undefined,
        requiredScore: quiz.requiredScore,
        freeAttempts: quiz.freeAttempts,
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600" />
          <CardTitle className="font-arabic">إعدادات الاختبار</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {quiz.isPublished ? (
            <Badge variant="default" className="font-arabic bg-green-600">
              منشور
            </Badge>
          ) : (
            <Badge variant="secondary" className="font-arabic">
              غير منشور
            </Badge>
          )}
          <Button 
            onClick={onPublishToggle} 
            variant="outline" 
            size="sm"
            disabled={isPublishing}
            className="font-arabic"
          >
            {isPublishing ? (
              'جاري المعالجة...'
            ) : quiz.isPublished ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                إلغاء النشر
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                نشر الاختبار
              </>
            )}
          </Button>
          <Button onClick={toggleEdit} variant="ghost" size="sm">
            {isEditing ? (
              <>
                <X className="h-4 w-4 mr-2" />
                إلغاء
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4 mr-2" />
                تعديل
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 font-arabic">
                عنوان الاختبار
              </p>
              <p className="text-sm font-arabic">{quiz.title}</p>
            </div>
            
            {quiz.description && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 font-arabic">
                  الوصف
                </p>
                <p className="text-sm font-arabic">{quiz.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 font-arabic">
                  الحد الزمني
                </p>
                <p className="text-sm font-arabic">
                  {quiz.timeLimit ? `${quiz.timeLimit} دقيقة` : 'غير محدد'}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 font-arabic">
                  النتيجة المطلوبة
                </p>
                <p className="text-sm font-arabic">{quiz.requiredScore}%</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 font-arabic">
                  المحاولات المجانية
                </p>
                <p className="text-sm font-arabic">
                  {quiz.freeAttempts === -1 ? 'غير محدود' : quiz.freeAttempts}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <ConfirmModal
                onConfirm={onDelete}
              >
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isDeleting || quiz.isPublished}
                  className="font-arabic"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? 'جاري الحذف...' : 'حذف الاختبار'}
                </Button>
              </ConfirmModal>
              {quiz.isPublished && (
                <p className="text-xs text-muted-foreground mt-2 font-arabic">
                  لا يمكن حذف الاختبار المنشور
                </p>
              )}
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-arabic">عنوان الاختبار</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="أدخل عنوان الاختبار"
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
                    <FormLabel className="font-arabic">الوصف (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={isSubmitting}
                        placeholder="أدخل وصف الاختبار"
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
                      <FormLabel className="font-arabic">الحد الزمني (بالدقائق)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          disabled={isSubmitting}
                          placeholder="اتركه فارغاً لعدم التحديد"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="font-arabic">
                        اتركه فارغاً إذا لم تريد حد زمني
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
                      <FormLabel className="font-arabic">النتيجة المطلوبة (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="font-arabic">
                        النسبة المطلوبة لاجتياز الاختبار
                      </FormDescription>
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
                <Button
                  disabled={isSubmitting}
                  type="submit"
                  className="font-arabic"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}; 