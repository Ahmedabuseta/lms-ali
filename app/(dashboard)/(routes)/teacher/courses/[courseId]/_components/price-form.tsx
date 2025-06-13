'use client';

import * as z from 'zod';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Pencil, DollarSign } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Course } from '@prisma/client';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/format';

interface PriceFormProps { initialData: Course;
  courseId: string; }

const formSchema = z.object({ price: z.coerce.number({
    message: 'السعر مطلوب', }),
});

export const PriceForm = ({ initialData, courseId }: PriceFormProps) => { const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: initialData?.price || undefined, },
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
    <div className="rounded-xl border border-purple-200/60 bg-purple-50/60 backdrop-blur-xl p-6 shadow-lg transition-all duration-300 hover:bg-purple-50/80 dark:border-purple-400/20 dark:bg-purple-900/10 dark:hover:bg-purple-900/15">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-200/80 dark:bg-purple-700/50">
            <DollarSign className="h-4 w-4 text-purple-700 dark:text-purple-300" />
          </div>
          <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100 font-arabic">سعر الدورة</h4>
        </div>
        <Button onClick={toggleEdit} variant="ghost" size="sm" className="text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-100">
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
          {initialData.price ? (
            <div className="rounded-lg border border-purple-200/50 bg-purple-100/50 p-4 backdrop-blur-sm dark:border-purple-400/30 dark:bg-purple-800/20">
              <p className="text-purple-900 dark:text-purple-100 font-medium font-arabic text-2xl">{formatPrice(initialData.price) }</p>
            </div>
          ) : (
            <div className="rounded-lg border border-purple-200/50 bg-purple-50/40 p-4 text-center backdrop-blur-sm dark:border-purple-400/30 dark:bg-purple-900/20">
              <DollarSign className="mx-auto h-8 w-8 text-purple-400 dark:text-purple-500" />
              <p className="mt-2 text-sm text-purple-600 dark:text-purple-300 font-arabic">لم يتم تحديد سعر بعد</p>
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
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        disabled={isSubmitting}
                        placeholder="مثال: 99.99"
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
