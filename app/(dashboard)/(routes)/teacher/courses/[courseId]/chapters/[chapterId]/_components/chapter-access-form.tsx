'use client';

import * as z from 'zod';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Pencil, Eye, Lock } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Chapter } from '@prisma/client';
import { Form, FormControl, FormDescription, FormField, FormItem } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

interface ChapterAccessFormProps {
  initialData: Chapter;
  courseId: string;
  chapterId: string;
}

const formSchema = z.object({
  isFree: z.boolean().default(false),
});

export const ChapterAccessForm = ({ initialData, courseId, chapterId }: ChapterAccessFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isFree: !!initialData.isFree,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, values);
      toast.success('تم تحديث الفصل بنجاح');
      toggleEdit();
      router.refresh();
    } catch {
      toast.error('حدث خطأ ما، يرجى المحاولة مرة أخرى');
    }
  };

  return (
    <div className="rounded-xl border border-teal-200/60 bg-teal-50/60 backdrop-blur-xl p-6 shadow-lg transition-all duration-300 hover:bg-teal-50/80 dark:border-teal-400/20 dark:bg-teal-900/10 dark:hover:bg-teal-900/15">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-200/80 dark:bg-teal-700/50">
            {initialData.isFree ? (
              <Eye className="h-4 w-4 text-teal-700 dark:text-teal-300" />
            ) : (
              <Lock className="h-4 w-4 text-teal-700 dark:text-teal-300" />
            )}
          </div>
          <h4 className="text-lg font-semibold text-teal-900 dark:text-teal-100 font-arabic">إعدادات الوصول</h4>
        </div>
        <Button onClick={toggleEdit} variant="ghost" size="sm" className="text-teal-700 hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-100">
          {isEditing ? (
            <span className="font-arabic">إلغاء</span>
          ) : (
            <>
              <Pencil className="ml-2 h-4 w-4" />
              <span className="font-arabic">تعديل</span>
            </>
          )}
        </Button>
      </div>
      
      {!isEditing && (
        <div className="mt-4">
          <div className={cn(
            "rounded-lg border p-4 backdrop-blur-sm",
            initialData.isFree 
              ? "border-emerald-200/50 bg-emerald-100/50 dark:border-emerald-400/30 dark:bg-emerald-800/20"
              : "border-orange-200/50 bg-orange-100/50 dark:border-orange-400/30 dark:bg-orange-800/20"
          )}>
            <div className="flex items-center gap-3">
              {initialData.isFree ? (
                <>
                  <Eye className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="font-medium text-emerald-900 dark:text-emerald-100 font-arabic">فصل مجاني للمعاينة</p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 font-arabic">يمكن للطلاب الوصول إلى هذا الفصل مجاناً</p>
                  </div>
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <div>
                    <p className="font-medium text-orange-900 dark:text-orange-100 font-arabic">فصل مدفوع</p>
                    <p className="text-sm text-orange-700 dark:text-orange-300 font-arabic">يتطلب شراء الدورة للوصول إلى هذا الفصل</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {isEditing && (
        <div className="mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="isFree"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-teal-200/60 bg-teal-50/40 p-4 backdrop-blur-sm dark:border-teal-400/30 dark:bg-teal-900/20">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormDescription className="text-teal-700 dark:text-teal-300 font-arabic">
                        ضع علامة في هذا المربع إذا كنت تريد جعل هذا الفصل مجانياً للمعاينة
                      </FormDescription>
                    </div>
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
