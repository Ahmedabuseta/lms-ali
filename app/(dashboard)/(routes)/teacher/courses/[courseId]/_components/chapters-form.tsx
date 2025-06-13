'use client';

import * as z from 'zod';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, PlusCircle, BookOpen } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Chapter, Course } from '@prisma/client';
import { ChaptersListWrapper } from './chapters-list-wrapper';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface ChaptersFormProps {
  initialData: Course & { chapters: Chapter[] };
  courseId: string;
}

const formSchema = z.object({
  title: z.string().min(1, {
    message: 'عنوان الفصل مطلوب',
  }),
});

export const ChaptersForm = ({ initialData, courseId }: ChaptersFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleCreating = () => {
    setIsCreating((current) => !current);
  };

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post(`/api/courses/${courseId}/chapters`, values);
      toast.success('تم إنشاء الفصل بنجاح');
      toggleCreating();
      router.refresh();
      form.reset();
    } catch {
      toast.error('حدث خطأ ما، يرجى المحاولة مرة أخرى');
    }
  };

  const onReorder = async (updateData: { id: string; position: number }[]) => {
    try {
      setIsUpdating(true);

      await axios.put(`/api/courses/${courseId}/chapters/reorder`, {
        list: updateData,
      });
      toast.success('تم إعادة ترتيب الفصول بنجاح');
      router.refresh();
    } catch {
      toast.error('حدث خطأ ما، يرجى المحاولة مرة أخرى');
    } finally {
      setIsUpdating(false);
    }
  };

  const onEdit = (id: string) => {
    router.push(`/teacher/courses/${courseId}/chapters/${id}`);
  };

  return (
    <div className="relative rounded-xl border border-indigo-200/60 bg-indigo-50/60 backdrop-blur-xl p-6 shadow-lg transition-all duration-300 hover:bg-indigo-50/80 dark:border-indigo-400/20 dark:bg-indigo-900/10 dark:hover:bg-indigo-900/15">
      {isUpdating && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-xl bg-indigo-500/20 backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-lg bg-white/90 px-4 py-2 shadow-lg dark:bg-indigo-900/90">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100 font-arabic">جاري إعادة الترتيب...</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-200/80 dark:bg-indigo-700/50">
            <BookOpen className="h-4 w-4 text-indigo-700 dark:text-indigo-300" />
          </div>
          <h4 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 font-arabic">فصول الدورة</h4>
        </div>
        <Button onClick={toggleCreating} variant="ghost" size="sm" className="text-indigo-700 hover:text-indigo-900 dark:text-indigo-300 dark:hover:text-indigo-100">
          {isCreating ? (
            <span className="font-arabic">إلغاء</span>
          ) : (
            <>
              <PlusCircle className="ml-2 h-4 w-4" />
              <span className="font-arabic">إضافة فصل</span>
            </>
          )}
        </Button>
      </div>

      {isCreating && (
        <div className="mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="مثال: 'مقدمة في البرمجة'"
                        className="text-right"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-3">
                <Button
                  disabled={!isValid || isSubmitting}
                  type="submit"
                  className="font-arabic"
                  variant="default"
                >
                  إنشاء
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={toggleCreating}
                  className="font-arabic"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {!isCreating && (
        <div className="mt-4">
          {!initialData.chapters.length ? (
            <div className="rounded-lg border border-indigo-200/50 bg-indigo-50/40 p-6 text-center backdrop-blur-sm dark:border-indigo-400/30 dark:bg-indigo-900/20">
              <BookOpen className="mx-auto h-12 w-12 text-indigo-400 dark:text-indigo-500" />
              <p className="mt-2 text-sm text-indigo-600 dark:text-indigo-300 font-arabic">لا توجد فصول بعد</p>
              <p className="text-xs text-indigo-500 dark:text-indigo-400 font-arabic">انقر على "إضافة فصل" لبدء إنشاء محتوى الدورة</p>
            </div>
          ) : (
            <div className="space-y-2">
              <ChaptersListWrapper onEdit={onEdit} onReorder={onReorder} items={initialData.chapters || []} />
            </div>
          )}
        </div>
      )}

      {!isCreating && initialData.chapters.length > 0 && (
        <div className="mt-4 rounded-lg bg-indigo-100/50 p-3 backdrop-blur-sm dark:bg-indigo-800/20">
          <p className="text-xs text-indigo-700 dark:text-indigo-300 font-arabic">
            اسحب واسقط لإعادة ترتيب الفصول حسب التسلسل المطلوب
          </p>
        </div>
      )}
    </div>
  );
};
