'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { Save, ArrowLeft, Plus, Trash2, FileText, Target, Calculator, Loader2 } from 'lucide-react';
import { MathRenderer } from '@/components/math-renderer';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

const passageSchema = z.object({
  title: z.string().min(1, 'عنوان القطعة مطلوب'),
  content: z.string().min(1, 'محتوى القطعة مطلوب'),
  courseId: z.string().min(1, 'الدورة مطلوبة'),
  chapterId: z.string().optional(),
  questions: z.array(
    z.object({
      text: z.string().min(1, 'نص السؤال مطلوب'),
      type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE']),
      difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
      points: z.number().min(1, 'النقاط مطلوبة').max(100),
      options: z.array(
        z.object({
          text: z.string().min(1, 'نص الخيار مطلوب'),
          isCorrect: z.boolean(),
        })
      ).min(2, 'يجب أن يكون هناك خياران على الأقل'),
    })
  ).min(1, 'يجب إضافة سؤال واحد على الأقل'),
});

interface Course {
  id: string;
  title: string;
}

interface Chapter {
  id: string;
  title: string;
}

interface CreatePassageFormProps {
  courses: Course[];
}

export const CreatePassageForm = ({ courses }: CreatePassageFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  const form = useForm<z.infer<typeof passageSchema>>({
    resolver: zodResolver(passageSchema),
    defaultValues: {
      title: '',
      content: '',
      courseId: courses.length > 0 ? courses[0].id : '',
      chapterId: '',
      questions: [
        {
          text: '',
          type: 'MULTIPLE_CHOICE',
          difficulty: 'MEDIUM',
          points: 1,
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
          ],
        },
      ],
    },
  });

  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  const selectedCourseId = form.watch('courseId');

  // Fetch chapters when course changes
  useEffect(() => {
    const fetchChapters = async () => {
      if (selectedCourseId) {
        try {
          const response = await fetch(`/api/courses/${selectedCourseId}/chapters`);
          if (response.ok) {
            const data = await response.json();
            setChapters(data);
          }
        } catch (error) {
          console.error('Error fetching chapters:', error);
        }
      }
    };

    fetchChapters();
  }, [selectedCourseId]);

  const addQuestion = () => {
    appendQuestion({
      text: '',
      type: 'MULTIPLE_CHOICE',
      difficulty: 'MEDIUM',
      points: 1,
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
    });
  };

  const onSubmit = async (values: z.infer<typeof passageSchema>) => {
    try {
      setIsSubmitting(true);

      // Validate course selection
      if (!values.courseId) {
        toast.error('يجب اختيار الدورة');
        return;
      }

      // Validate that each question has at least one correct answer
      for (let i = 0; i < values.questions.length; i++) {
        const question = values.questions[i];
        const hasCorrectAnswer = question.options.some(option => option.isCorrect);
        if (!hasCorrectAnswer) {
          toast.error(`السؤال ${i + 1} يجب أن يحتوي على إجابة صحيحة واحدة على الأقل`);
          return;
        }
      }

      // Convert empty chapterId to undefined for API
      const submissionData = {
        ...values,
        chapterId: values.chapterId || undefined,
      };

      const response = await fetch('/api/passages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error('Failed to create passage');
      }

      toast.success('تم إنشاء القطعة بنجاح');
      router.push('/teacher/questions-bank');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ أثناء إنشاء القطعة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Back Button */}
          <Link href="/teacher/questions-bank" className="inline-flex items-center text-sm transition hover:opacity-75">
            <ArrowLeft className="mr-2 h-4 w-4" />
            العودة إلى بنك الأسئلة
          </Link>

          {/* Passage Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-arabic">
                <FileText className="h-5 w-5" />
                معلومات القطعة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-arabic">الدورة</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          disabled={isSubmitting}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-arabic"
                        >
                          <option value="">اختر الدورة</option>
                          {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                              {course.title}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chapterId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-arabic">الفصل (اختياري)</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          disabled={isSubmitting || !selectedCourseId}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-arabic"
                        >
                          <option value="">بدون فصل محدد</option>
                          {chapters.map((chapter) => (
                            <option key={chapter.id} value={chapter.id}>
                              {chapter.title}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormDescription className="font-arabic">
                        ربط هذه القطعة بفصل معين
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-arabic">عنوان القطعة</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل عنوان القطعة" {...field} className="font-arabic" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-arabic flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      نص القطعة
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="أدخل نص القطعة هنا... يمكنك استخدام صيغ رياضية مثل $x^2$ أو $$\int x dx$$" 
                        {...field} 
                        rows={10}
                        className="font-arabic"
                      />
                    </FormControl>
                    <div className="mt-2 space-y-2">
                      <FormDescription className="font-arabic">
                        هذا النص سيكون متاحاً للطلاب أثناء الإجابة على الأسئلة
                      </FormDescription>
                      {field.value && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-arabic">معاينة:</div>
                          <div className="prose dark:prose-invert max-w-none font-arabic text-sm">
                            <MathRenderer content={field.value} />
                          </div>
                        </div>
                      )}
                      <details className="text-xs text-gray-600 dark:text-gray-400">
                        <summary className="cursor-pointer font-arabic hover:text-gray-800 dark:hover:text-gray-200">
                          <Calculator className="inline h-3 w-3 mr-1" />
                          أمثلة على الصيغ الرياضية
                        </summary>Cannot find name 'b'.ts(2304)
                        
                        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
                          <div>للرياضيات البسيطة: {'$x^2 + y^2 = z^2$'}</div>
                          <div>للكسور: {'$\\frac{a}{b}$'}</div>
                          <div>للجذور: {'$\\sqrt{x}$'} أو {'$\\sqrt[3]{x}$'}</div>
                          <div>للمعادلات المعقدة: {'$$\\int_0^1 x^2 dx = \\frac{1}{3}$$'}</div>
                        </div>
                      </details>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-arabic">
                  <Target className="h-5 w-5" />
                  الأسئلة ({questionFields.length})
                </CardTitle>
                <Button type="button" variant="outline" onClick={addQuestion} className="font-arabic">
                  <Plus className="mr-1 h-4 w-4" />
                  إضافة سؤال
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {questionFields.map((question, questionIndex) => (
                <QuestionForm
                  key={question.id}
                  questionIndex={questionIndex}
                  form={form}
                  onRemove={() => removeQuestion(questionIndex)}
                  canRemove={questionFields.length > 1}
                  isSubmitting={isSubmitting}
                />
              ))}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="pt-6 border-t">
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              size="lg" 
              className={`font-arabic bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 ${
                isSubmitting ? 'cursor-wait opacity-90' : 'cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  جارٍ الإنشاء...
                </>
              ) : (
                <>
                  <Save className="ml-2 h-5 w-5" />
                  إنشاء القطعة
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

// Question Form Component
interface QuestionFormProps {
  questionIndex: number;
  form: any;
  onRemove: () => void;
  canRemove: boolean;
  isSubmitting: boolean;
}

const QuestionForm = ({ questionIndex, form, onRemove, canRemove, isSubmitting }: QuestionFormProps) => {
  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control: form.control,
    name: `questions.${questionIndex}.options`,
  });

  const questionType = form.watch(`questions.${questionIndex}.type`);

  // Reset options when changing question type
  useEffect(() => {
    if (questionType === 'TRUE_FALSE') {
      form.setValue(`questions.${questionIndex}.options`, [
        { text: 'صحيح', isCorrect: false },
        { text: 'خطأ', isCorrect: false },
      ]);
    } else if (questionType === 'MULTIPLE_CHOICE' && optionFields.length < 2) {
      form.setValue(`questions.${questionIndex}.options`, [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ]);
    }
  }, [questionType, form, questionIndex, optionFields.length]);

  const addOption = () => {
    if (questionType === 'MULTIPLE_CHOICE') {
      appendOption({ text: '', isCorrect: false });
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-arabic">
              السؤال {questionIndex + 1}
            </Badge>
            <Badge variant="outline" className="font-arabic">
              {questionType === 'MULTIPLE_CHOICE' ? 'متعدد الخيارات' : 'صح أم خطأ'}
            </Badge>
          </div>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <FormField
            control={form.control}
            name={`questions.${questionIndex}.type`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-arabic">نوع السؤال</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    disabled={isSubmitting}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-arabic"
                  >
                    <option value="MULTIPLE_CHOICE">متعدد الخيارات</option>
                    <option value="TRUE_FALSE">صح أم خطأ</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

                      <FormField
            control={form.control}
            name={`questions.${questionIndex}.difficulty`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-arabic">الصعوبة</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    disabled={isSubmitting}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-arabic"
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
            name={`questions.${questionIndex}.points`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-arabic">النقاط</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    min={1}
                    max={100}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name={`questions.${questionIndex}.text`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-arabic">نص السؤال</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="أدخل السؤال هنا... يمكنك استخدام صيغ رياضية مثل $x^2$" 
                  {...field} 
                  rows={3}
                  className="font-arabic"
                />
              </FormControl>
              {field.value && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 font-arabic">معاينة:</div>
                  <div className="text-sm">
                    <MathRenderer content={field.value} />
                  </div>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel className="font-arabic">الخيارات</FormLabel>
            {questionType === 'MULTIPLE_CHOICE' && (
              <Button type="button" variant="outline" size="sm" onClick={addOption} className="font-arabic">
                <Plus className="mr-1 h-3 w-3" />
                إضافة خيار
              </Button>
            )}
          </div>

          {optionFields.map((option, optionIndex) => (
            <div key={option.id} className="flex items-center gap-2">
              <FormField
                control={form.control}
                name={`questions.${questionIndex}.options.${optionIndex}.isCorrect`}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`questions.${questionIndex}.options.${optionIndex}.text`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <div className="space-y-1">
                        <Input
                          placeholder={`الخيار ${optionIndex + 1}`}
                          {...field}
                          className="font-arabic"
                          disabled={questionType === 'TRUE_FALSE'}
                        />
                        {field.value && field.value.includes('$') && (
                          <div className="text-xs p-1 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                            <MathRenderer content={field.value} />
                          </div>
                        )}
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              {questionType === 'MULTIPLE_CHOICE' && optionFields.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(optionIndex)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
