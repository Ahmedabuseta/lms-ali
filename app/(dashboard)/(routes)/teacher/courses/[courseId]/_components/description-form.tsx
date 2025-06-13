'use client';

import * as z from 'zod';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Pencil, FileText } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Course } from '@prisma/client';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface DescriptionFormProps { initialData: Course;
  courseId: string; }

const formSchema = z.object({ description: z.string().min(1, {
    message: 'الوصف مطلوب', }),
});

export const DescriptionForm = ({ initialData, courseId }: DescriptionFormProps) => { const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData?.description || '', },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}`, values);
      toast.success('تم تحديث الدورة بنجاح');
      toggleEdit();
      router.refresh();
    } catch {
      toast.error('حدث خطأ ما، يرجى المحاولة مرة أخرى');
    }
  };

  return (
    <div className="rounded-xl border border-blue-200/60 bg-blue-50/60 backdrop-blur-xl p-6 shadow-lg transition-all duration-300 hover:bg-blue-50/80 dark:border-blue-400/20 dark:bg-blue-900/10 dark:hover:bg-blue-900/15">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-200/80 dark:bg-blue-700/50">
            <FileText className="h-4 w-4 text-blue-700 dark:text-blue-300" />
          </div>
          <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 font-arabic">وصف الدورة</h4>
        </div>
        <Button onClick={toggleEdit} variant="ghost" size="sm" className="text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100">
          { isEditing ? (
            <span className="font-arabic">إلغاء</span>
          ) : (
            <>
              <Pencil className="ml-2 h-4 w-4" />
              <span className="font-arabic">تعديل</span>
            </>
          ) }
        </Button>
      </div>

      { !isEditing && (
        <div className="mt-4">
          {initialData.description ? (
            <div className="rounded-lg border border-blue-200/50 bg-blue-100/50 p-4 backdrop-blur-sm dark:border-blue-400/30 dark:bg-blue-800/20">
              <p className="text-blue-900 dark:text-blue-100 leading-relaxed font-arabic whitespace-pre-wrap">{initialData.description }</p>
            </div>
          ) : (
            <div className="rounded-lg border border-blue-200/50 bg-blue-50/40 p-4 text-center backdrop-blur-sm dark:border-blue-400/30 dark:bg-blue-900/20">
              <FileText className="mx-auto h-8 w-8 text-blue-400 dark:text-blue-500" />
              <p className="mt-2 text-sm text-blue-600 dark:text-blue-300 font-arabic">لم يتم إضافة وصف بعد</p>
            </div>
          )}
        </div>
      )}

      {isEditing && (
        <div className="mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        disabled={isSubmitting}
                        placeholder="مثال: 'هذه الدورة تتناول أساسيات تطوير الويب المتقدم باستخدام أحدث التقنيات...'"
                        className="text-right min-h-[120px]"
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
                  حفظ
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={toggleEdit}
                  className="font-arabic"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
};
