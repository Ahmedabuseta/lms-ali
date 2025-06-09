'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Course } from '@prisma/client';
import { PencilIcon, Tag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Combobox } from '@/components/ui/combobox';

type CategoryFormProps = {
  initialData: Course;
  courseId: string;
  options: Array<{ label: string; value: string }>;
};

const formSchema = z.object({
  categoryId: z.string().min(1, {
    message: 'التصنيف مطلوب',
  }),
});

type FormSchema = z.infer<typeof formSchema>;

export default function CategoryForm({ initialData, courseId, options }: CategoryFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { categoryId: initialData.categoryId ?? '' },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: FormSchema) => {
    try {
      await axios.patch(`/api/courses/${courseId}`, values);
      toast.success('تم تحديث الدورة بنجاح');
      toggleEdit();
      router.refresh();
    } catch {
      toast.error('حدث خطأ ما، يرجى المحاولة مرة أخرى');
    }
  };

  const selectedOption = options.find((option) => option.value === initialData?.categoryId);

  return (
    <div className="rounded-xl border border-blue-200/60 bg-blue-50/60 backdrop-blur-xl p-6 shadow-lg transition-all duration-300 hover:bg-blue-50/80 dark:border-blue-400/20 dark:bg-blue-900/10 dark:hover:bg-blue-900/15">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-200/80 dark:bg-blue-700/50">
            <Tag className="h-4 w-4 text-blue-700 dark:text-blue-300" />
          </div>
          <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 font-arabic">تصنيف الدورة</h4>
        </div>
        <Button variant="ghost" onClick={toggleEdit} size="sm" className="text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100">
          {isEditing ? (
            <span className="font-arabic">إلغاء</span>
          ) : (
            <>
              <PencilIcon className="ml-2 h-4 w-4" />
              <span className="font-arabic">تعديل</span>
            </>
          )}
        </Button>
      </div>

      {!isEditing ? (
        <div className="mt-4">
          {selectedOption?.label ? (
            <div className="rounded-lg border border-blue-200/50 bg-blue-100/50 p-4 backdrop-blur-sm dark:border-blue-400/30 dark:bg-blue-800/20">
              <p className="text-blue-900 dark:text-blue-100 font-medium font-arabic">{selectedOption.label}</p>
            </div>
          ) : (
            <div className="rounded-lg border border-blue-200/50 bg-blue-50/40 p-4 text-center backdrop-blur-sm dark:border-blue-400/30 dark:bg-blue-900/20">
              <Tag className="mx-auto h-8 w-8 text-blue-400 dark:text-blue-500" />
              <p className="mt-2 text-sm text-blue-600 dark:text-blue-300 font-arabic">لم يتم اختيار تصنيف بعد</p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Combobox options={options} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-3">
                <Button disabled={!isValid || isSubmitting} type="submit" className="font-arabic">
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
}
