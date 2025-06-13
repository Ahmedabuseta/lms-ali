'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import axios from 'axios';
import { BookOpen, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreateExamFormProps { courses: {
    id: string;
    title: string;
    chapters: {
      id: string;
      title: string; }[];
  }[];
  selectedCourseId?: string;
  selectedChapterId?: string;
}

const formSchema = z.object({ title: z
    .string()
    .min(1, {
      message: 'عنوان الاختبار مطلوب', })
    .max(100, 'العنوان يجب أن يكون أقل من 100 حرف'),
  description: z
    .string()
    .max(500, 'الوصف يجب أن يكون أقل من 500 حرف')
    .optional(),
  courseId: z.string().min(1, { message: 'اختيار الدورة مطلوب', }),
  chapterId: z.string().optional(),
  timeLimit: z
    .union([
      z.coerce.number().int().min(1, 'الحد الأدنى دقيقة واحدة').max(300, 'الحد الأقصى 300 دقيقة'),
      z.literal(''),
    ])
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  isPublished: z.boolean().default(false),
});

export const CreateExamForm = ({ courses, selectedCourseId, selectedChapterId }: CreateExamFormProps) => { const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableChapters, setAvailableChapters] = useState<{ id: string; title: string }[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      courseId: selectedCourseId || '',
      chapterId: selectedChapterId || '',
      timeLimit: 30,
      isPublished: false, },
  });

  const { watch, setValue, formState } = form;
  const { errors } = formState;

  // Watch courseId to update chapters when course changes
  const watchedCourseId = watch('courseId');

  // Update available chapters when course changes
  useEffect(() => { if (watchedCourseId) {
      const selectedCourse = courses.find((course) => course.id === watchedCourseId);
      if (selectedCourse) {
        setAvailableChapters(selectedCourse.chapters);
        // Reset chapter selection if it's not valid for the new course
        const currentChapterId = form.getValues('chapterId');
        if (currentChapterId && !selectedCourse.chapters.find(ch => ch.id === currentChapterId)) {
          setValue('chapterId', ''); }
      }
    } else { setAvailableChapters([]);
      setValue('chapterId', ''); }
  }, [watchedCourseId, courses, setValue, form]);

  // Set initial chapters based on selected course
  useEffect(() => {
    if (selectedCourseId) {
      const course = courses.find(c => c.id === selectedCourseId);
      if (course) {
        setAvailableChapters(course.chapters);
      }
    }
  }, [selectedCourseId, courses]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      // Validate that at least one course exists
      if (courses.length === 0) {
        toast.error('يجب أن تقوم بإنشاء دورة أولاً');
        return;
      }

      // Transform placeholder values back to proper values before submission
      const transformedValues = {
        ...values,
        chapterId: values.chapterId === 'ALL_CHAPTERS' ? undefined : values.chapterId,
      };

      const response = await axios.post('/api/exam', transformedValues);

      toast.success('تم إنشاء الاختبار بنجاح! 🎉');
      router.push(`/teacher/exam/${response.data.id}`);
    } catch (error: any) {
      console.error('Error creating exam:', error);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 403) {
        toast.error('ليس لديك صلاحية لإنشاء اختبارات');
      } else if (error.response?.status === 400) {
        toast.error('بيانات غير صحيحة، يرجى التحقق من المدخلات');
      } else {
        toast.error('حدث خطأ أثناء إنشاء الاختبار. يرجى المحاولة مرة أخرى');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (courses.length === 0) {
    return (
      <Alert className="border-amber-200 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 font-arabic">
          لا توجد دورات متاحة. يجب أن تقوم بإنشاء دورة أولاً قبل إنشاء اختبار.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardTitle className="text-xl font-arabic text-gray-800 dark:text-gray-200">
          تفاصيل الاختبار
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 p-6">
            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium font-arabic">عنوان الاختبار</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="مثال: الاختبار النهائي - الفصل الأول"
                      className="text-right font-arabic"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-sm text-gray-600 font-arabic">
                    أدخل عنواناً واضحاً ووصفياً للاختبار
                  </FormDescription>
                  <FormMessage className="font-arabic" />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium font-arabic">الوصف (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="وصف موجز للاختبار وما يغطيه من مواضيع..."
                      className="text-right font-arabic min-h-[100px] resize-none"
                      disabled={isSubmitting}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription className="text-sm text-gray-600 font-arabic">
                    سيظهر هذا الوصف للطلاب قبل بدء الاختبار
                  </FormDescription>
                  <FormMessage className="font-arabic" />
                </FormItem>
              )}
            />

            {/* Course Selection */}
            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium font-arabic">اختيار الدورة</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-1 gap-3">
                      {courses.map((course) => (
                        <Card
                          key={course.id}
                          className={ cn(
                            'cursor-pointer border-2 transition-all duration-300 hover:shadow-md',
                            field.value === course.id
                              ? 'border-blue-500 bg-blue-50 shadow-md dark:border-blue-400 dark:bg-blue-900/20'
                              : 'border-gray-200 bg-white hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600',
                            isSubmitting && 'pointer-events-none opacity-50'
                          ) }
                          onClick={() => {
                            if (!isSubmitting) {
                              field.onChange(course.id);
                            }
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={ cn(
                                  'rounded-lg p-2 transition-colors',
                                  field.value === course.id
                                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
                                ) }
                              >
                                <BookOpen className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3
                                  className={ cn(
                                    'truncate font-medium font-arabic',
                                    field.value === course.id
                                      ? 'text-blue-700 dark:text-blue-300'
                                      : 'text-gray-800 dark:text-gray-200',
                                  ) }
                                >
                                  {course.title}
                                </h3>
                                <p className="text-xs text-gray-500 font-arabic mt-1">
                                  {course.chapters.length} فصل متاح
                                </p>
                              </div>
                              {field.value === course.id && (
                                <div className="rounded-full bg-blue-500 p-1 text-white">
                                  <CheckCircle className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage className="font-arabic" />
                </FormItem>
              )}
            />

            {/* Chapter Selection */}
            {watchedCourseId && availableChapters.length > 0 && (
              <FormField
                control={form.control}
                name="chapterId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium font-arabic">الفصل (اختياري)</FormLabel>
                    <Select
                      value={field.value || 'ALL_CHAPTERS'}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="text-right font-arabic">
                          <SelectValue placeholder="اختر فصلاً أو اتركه فارغاً للدورة كاملة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ALL_CHAPTERS" className="font-arabic">جميع الفصول</SelectItem>
                        {availableChapters.map((chapter) => (
                          <SelectItem key={chapter.id} value={chapter.id} className="font-arabic">
                            {chapter.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-sm text-gray-600 font-arabic">
                      ربط الاختبار بفصل معين أو تركه عاماً للدورة
                    </FormDescription>
                    <FormMessage className="font-arabic" />
                  </FormItem>
                )}
              />
            )}

            {/* Time Limit Field */}
            <FormField
              control={form.control}
              name="timeLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium font-arabic flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    الوقت المحدد (بالدقائق)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="300"
                      placeholder="30"
                      className="text-right font-arabic"
                      disabled={isSubmitting}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription className="text-sm text-gray-600 font-arabic">
                    حدد الوقت بالدقائق (1-300) أو اتركه فارغاً لعدم تحديد وقت
                  </FormDescription>
                  <FormMessage className="font-arabic" />
                </FormItem>
              )}
            />

            {/* Publish Switch */}
            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base font-medium font-arabic">نشر الاختبار</FormLabel>
                    <FormDescription className="text-sm text-gray-600 font-arabic">
                      عند التفعيل، سيكون الاختبار مرئياً للطلاب
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Form Errors Alert */}
            {Object.keys(errors).length > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 font-arabic">
                  يرجى تصحيح الأخطاء أعلاه قبل المتابعة
                </AlertDescription>
              </Alert>
            )}
          </CardContent>

          <CardFooter className="border-t bg-gray-50 p-6 dark:bg-gray-800/50">
            <div className="flex w-full items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/teacher/exam')}
                disabled={isSubmitting}
                className="font-arabic"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || Object.keys(errors).length > 0}
                className="font-arabic min-w-[120px]"
              >
                { isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  'إنشاء الاختبار'
                ) }
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
