'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { Save, ArrowLeft, Calculator, FileText, Loader2 } from 'lucide-react';
import { MathRenderer } from '@/components/math-renderer';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage, } from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface Question { id: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'PASSAGE';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  points: number;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean; }>;
  questionBank: { id: string;
    title: string;
    course: {
      id: string;
      title: string; };
    chapter?: { id: string;
      title: string; };
  };
  passage?: { id: string;
    title: string;
    content: string; };
}

interface EditQuestionFormProps { question: Question; }

const formSchema = z.object({ text: z.string().min(1, 'نص السؤال مطلوب'),
  type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'PASSAGE']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  points: z.number().min(1, 'النقاط يجب أن تكون أكثر من 0'),
  options: z.array(z.object({
    text: z.string().min(1, 'نص الخيار مطلوب'),
    isCorrect: z.boolean(), })).min(2, 'يجب إضافة خيارين على الأقل'),
});

type FormData = z.infer<typeof formSchema>;

export const EditQuestionForm = ({ question }: EditQuestionFormProps) => { const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: question.text,
      type: question.type,
      difficulty: question.difficulty,
      points: question.points,
      options: question.options.map(option => ({
        text: option.text,
        isCorrect: option.isCorrect, })),
    },
  });

  const addOption = () => { const currentOptions = form.getValues('options');
    form.setValue('options', [
      ...currentOptions,
      { text: '', isCorrect: false },
    ]);
  };

  const removeOption = (index: number) => { const currentOptions = form.getValues('options');
    if (currentOptions.length > 2) {
      form.setValue(
        'options',
        currentOptions.filter((_, i) => i !== index)
      ); }
  };

  const setCorrectAnswer = (index: number) => { const currentOptions = form.getValues('options');
    const updatedOptions = currentOptions.map((option, i) => ({
      ...option,
      isCorrect: i === index, }));
    form.setValue('options', updatedOptions);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Validate that exactly one option is correct for multiple choice and passage types
      if ((data.type === 'MULTIPLE_CHOICE' || data.type === 'PASSAGE')) {
        const correctAnswers = data.options.filter(option => option.isCorrect);
        if (correctAnswers.length !== 1) {
          toast.error('يجب اختيار إجابة صحيحة واحدة فقط');
          return;
        }
      }

      const response = await fetch(`/api/questions/${question.id}`, { method: 'PATCH',
        headers: {
          'Content-Type': 'application/json', },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('فشل في تحديث السؤال');
      }

      toast.success('تم تحديث السؤال بنجاح!');
      router.push('/teacher/questions-bank/explore');
      router.refresh();
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث السؤال');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeLabel = (type: string) => { switch (type) {
      case 'MULTIPLE_CHOICE':
        return 'اختيار متعدد';
      case 'TRUE_FALSE':
        return 'صح أم خطأ';
      case 'PASSAGE':
        return 'قطعة';
      default:
        return type; }
  };

  return (
    <div className={ `${isSubmitting ? 'cursor-wait' : '' }`}>
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className={ `flex items-center gap-2 font-arabic ${
            isSubmitting ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' }`}
        >
          <ArrowLeft className="h-4 w-4" />
          العودة
        </Button>

        { question.passage && (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-arabic">
              مرتبط بالقطعة: {question.passage.title }
            </span>
          </div>
        )}
      </div>

      {/* Loading overlay */}
      { isSubmitting && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-lg font-medium font-arabic text-gray-900 dark:text-white">
                جاري حفظ التغييرات...
              </span>
            </div>
          </div>
        </div>
      ) }

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={ `space-y-6 ${isSubmitting ? 'pointer-events-none' : '' }`}>
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="font-arabic text-gray-900 dark:text-gray-100">تعديل السؤال</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-arabic">نص السؤال</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="أدخل نص السؤال... يمكنك استخدام صيغ رياضية مثل $x^2$ أو $$\int x dx$$"
                        className={ `font-arabic ${isSubmitting ? 'cursor-wait' : 'cursor-text' }`}
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    { field.value && (
                      <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-arabic">معاينة:</div>
                        <div className="text-sm">
                          <MathRenderer content={field.value } />
                        </div>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-arabic">مستوى الصعوبة</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          disabled={isSubmitting}
                          className={ `flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-arabic ${
                            isSubmitting ? 'cursor-wait' : 'cursor-pointer' }`}
                        >
                          <option value="EASY">سهل</option>
                          <option value="MEDIUM">متوسط</option>
                          <option value="HARD">صعب</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-arabic">النقاط</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          disabled={isSubmitting}
                          className={ `font-arabic ${
                            isSubmitting ? 'cursor-wait' : 'cursor-text' }`}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium font-arabic">نوع السؤال</label>
                  <Badge variant="outline" className="w-full justify-center py-2">
                    {getTypeLabel(question.type)}
                  </Badge>
                  <p className="text-xs text-gray-600 font-arabic">
                    لا يمكن تغيير نوع السؤال
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-arabic text-gray-900 dark:text-gray-100">الخيارات</CardTitle>
              {question.type !== 'TRUE_FALSE' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="font-arabic border-gray-300 dark:border-gray-600"
                >
                  إضافة خيار
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              { form.watch('options').map((_, optionIndex) => (
                <div key={optionIndex } className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={form.watch(`options.${optionIndex}.isCorrect`)}
                    onChange={() => setCorrectAnswer(optionIndex)}
                    className="h-4 w-4 text-blue-600 mt-1"
                  />

                  <FormField
                    control={form.control}
                    name={`options.${optionIndex}.text`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <div className="space-y-2">
                            <Input
                              placeholder={`الخيار ${optionIndex + 1} - يمكنك استخدام صيغ رياضية`}
                              {...field}
                              className="font-arabic"
                            />
                            { field.value && (field.value.includes('$') || field.value.includes('\\')) && (
                              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                                <div className="text-xs text-blue-700 dark:text-blue-300 mb-1 font-arabic">معاينة:</div>
                                <MathRenderer content={field.value } />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {question.type !== 'TRUE_FALSE' && form.watch('options').length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(optionIndex)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 mt-1"
                    >
                      حذف
                    </Button>
                  )}
                </div>
              ))}

              <p className="text-sm text-gray-600 dark:text-gray-400 font-arabic">
                اختر الدائرة بجانب الإجابة الصحيحة
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className={ `font-arabic ${
                isSubmitting ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' }`}
            >
              إلغاء
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className={ `bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-arabic ${
                isSubmitting ? 'cursor-wait opacity-90' : 'cursor-pointer' }`}
            >
              { isSubmitting ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="ml-2 h-4 w-4" />
                  حفظ التغييرات
                </>
              ) }
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
