'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Trash, PlusCircle, Plus, Minus, AlertCircle } from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmModal } from '@/components/modals/confirm-modal';

interface QuestionFormProps { initialData?: {
    id: string;
    text: string;
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
    options: {
      id: string;
      text: string;
      isCorrect: boolean; }[];
  };
  examId: string;
}

const formSchema = z.object({ text: z.string().min(1, { message: 'نص السؤال مطلوب' }),
  type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE']),
  options: z
    .array(
      z.object({ id: z.string().optional(),
        text: z.string().min(1, { message: 'نص الخيار مطلوب' }),
        isCorrect: z.boolean().default(false),
      }),
    )
    .refine(
      (options) => {
        return options.some((option) => option.isCorrect);
      },
      { message: 'يجب تحديد خيار واحد على الأقل كإجابة صحيحة', },
    ),
});

export const QuestionForm = ({ initialData, examId }: QuestionFormProps) => { const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      text: '',
      type: 'MULTIPLE_CHOICE',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
    },
  });

  const { control, watch, setValue, formState } = form;
  const questionType = watch('type');

  const { fields, append, remove } = useFieldArray({ control,
    name: 'options', });

  // Set up true/false options if the type is TRUE_FALSE
  useEffect(() => {
    // Handle initial TRUE_FALSE data
    if (initialData?.type === 'TRUE_FALSE' && initialData.options.length === 2) {
      return; // Keep initial data as is
    }

    if (questionType === 'TRUE_FALSE') { setValue('options', [
        { text: 'صحيح', isCorrect: false },
        { text: 'خطأ', isCorrect: false },
      ]);
    } else if (!initialData && questionType === 'MULTIPLE_CHOICE' && fields.length < 2) { // Restore default options for multiple choice if needed
      setValue('options', [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ]);
    }
  }, [questionType, setValue, initialData, fields.length]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      if (initialData) {
        await axios.patch(`/api/exam/${examId}/questions/${initialData.id}`, values);
        toast.success('تم تحديث السؤال');
      } else {
        // Send data in the format expected by the API route for creating new questions
        const requestData = {
          action: 'create_new',
          text: values.text,
          type: values.type,
          difficulty: 'MEDIUM',
          options: values.options,
        };
        
        await axios.post(`/api/exam/${examId}/questions`, requestData);
        toast.success('تم إنشاء السؤال');
      }

      router.push(`/teacher/exam/${examId}/questions`);
      router.refresh();
    } catch (error) {
      toast.error('حدث خطأ ما');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      await axios.delete(`/api/exam/${examId}/questions/${initialData?.id}`);
      toast.success('تم حذف السؤال');
      router.push(`/teacher/exam/${examId}/questions`);
      router.refresh();
    } catch {
      toast.error('حدث خطأ ما');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-6 rounded-md border bg-slate-50 dark:bg-slate-800 p-4" dir="rtl">
      <div className="flex items-center justify-between font-medium font-arabic">
        تفاصيل السؤال
        {initialData && (
          <ConfirmModal onConfirm={onDelete}>
            <Button disabled={isDeleting} variant="destructive" size="sm">
              <Trash className="h-4 w-4" />
            </Button>
          </ConfirmModal>
        )}
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-arabic">السؤال</FormLabel>
                <FormControl>
                  <Textarea disabled={isSubmitting} placeholder="أدخل نص السؤال" {...field} />
                </FormControl>
                <FormDescription className="font-arabic">هذا هو السؤال الذي سيظهر للطلاب.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-arabic">نوع السؤال</FormLabel>
                <div className="space-y-2">
                  <FormControl>
                    <RadioGroup
                      disabled={isSubmitting}
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="MULTIPLE_CHOICE" />
                        </FormControl>
                        <FormLabel className="font-normal font-arabic">اختيار متعدد</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="TRUE_FALSE" />
                        </FormControl>
                        <FormLabel className="font-normal font-arabic">صح / خطأ</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="font-medium font-arabic">خيارات الإجابة</div>

            {form.formState.errors.options && form.formState.errors.options.root && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="font-arabic">خطأ</AlertTitle>
                <AlertDescription className="font-arabic">{form.formState.errors.options.root.message}</AlertDescription>
              </Alert>
            )}

            { fields.map((field, index) => (
              <div key={field.id } className="flex items-center gap-x-4">
                <FormField
                  control={form.control}
                  name={`options.${index}.text`}
                  render={ ({ field: textField }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          disabled={isSubmitting || questionType === 'TRUE_FALSE'}
                          placeholder={`الخيار ${index + 1}`}
                          {...textField}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`options.${index}.isCorrect`}
                  render={ ({ field: checkboxField }) => (
                    <FormItem>
                      <FormControl>
                        <Checkbox
                          checked={checkboxField.value}
                          onCheckedChange={ (checked) => {
                            // For true/false questions, uncheck all other options first
                            if (questionType === 'TRUE_FALSE' && checked) {
                              form.setValue(
                                'options',
                                form.getValues('options').map((opt, i) => ({
                                  ...opt,
                                  isCorrect: i === index, })),
                              );
                            } else {
                              checkboxField.onChange(checked);
                            }
                          }}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormLabel className="ml-2 text-sm font-normal font-arabic">صحيح</FormLabel>
                    </FormItem>
                  )}
                />
                {questionType === 'MULTIPLE_CHOICE' && (
                  <Button
                    type="button"
                    onClick={() => remove(index)}
                    variant="ghost"
                    size="sm"
                    disabled={fields.length <= 2 || isSubmitting}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            { questionType === 'MULTIPLE_CHOICE' && (
              <Button
                type="button"
                onClick={() => append({ text: '', isCorrect: false })}
                variant="outline"
                className="flex items-center font-arabic"
                disabled={isSubmitting}
              >
                <Plus className="ml-2 h-4 w-4" />
                إضافة خيار
              </Button>
            )}
          </div>

          <div className="flex items-center gap-x-2">
            <Button disabled={!form.formState.isValid || isSubmitting} type="submit" className="font-arabic">
              { initialData ? 'حفظ التغييرات' : 'إنشاء السؤال' }
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(`/teacher/exam/${examId}/questions`)}
              disabled={isSubmitting}
              className="font-arabic"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
