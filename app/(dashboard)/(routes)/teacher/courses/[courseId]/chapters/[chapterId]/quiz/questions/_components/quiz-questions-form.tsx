'use client';

import * as z from 'zod';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { PlusCircle, Trash, AlertCircle } from 'lucide-react';

import { Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription, } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface QuizQuestionsFormProps { courseId: string;
  chapterId: string;
  quizId: string; }

const formSchema = z.object({ text: z.string().min(1, 'Question text is required'),
  type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  points: z.coerce.number().min(1).default(1),
  explanation: z.string().optional(),
  options: z.array(z.object({
    text: z.string().min(1, 'Option text is required'),
    isCorrect: z.boolean().default(false), })).min(2, 'At least 2 options are required'),
});

export const QuizQuestionsForm = ({ courseId, chapterId, quizId }: QuizQuestionsFormProps) => { const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
      type: 'MULTIPLE_CHOICE',
      difficulty: 'MEDIUM',
      points: 1,
      explanation: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control,
    name: 'options', });

  const questionType = form.watch('type');
  const options = form.watch('options');

  // Handle question type change
  useEffect(() => { if (questionType === 'TRUE_FALSE') {
      form.setValue('options', [
        { text: 'صحيح', isCorrect: false },
        { text: 'خطأ', isCorrect: false },
      ]);
    } else if (questionType === 'MULTIPLE_CHOICE' && fields.length === 2) { form.setValue('options', [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ]);
    }
  }, [questionType, form, fields.length]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Validate that at least one option is correct
      const hasCorrectAnswer = values.options.some(option => option.isCorrect);
      if (!hasCorrectAnswer) {
        toast.error('يجب اختيار إجابة صحيحة واحدة على الأقل');
        return;
      }

      setIsSubmitting(true);

      await axios.post(`/api/courses/${courseId}/chapters/${chapterId}/quiz/questions`, { questions: [values] });

      toast.success('تم إضافة السؤال بنجاح');

      // Reset form
      form.reset({ text: '',
        type: 'MULTIPLE_CHOICE',
        difficulty: 'MEDIUM',
        points: 1,
        explanation: '',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
      });

      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ ما');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addOption = () => { if (fields.length < 6) {
      append({ text: '', isCorrect: false });
    }
  };

  const removeOption = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  const toggleCorrectAnswer = (index: number) => { const currentOptions = form.getValues('options');
    const newOptions = currentOptions.map((option, i) => ({
      ...option,
      isCorrect: i === index ? !option.isCorrect : (questionType === 'MULTIPLE_CHOICE' ? option.isCorrect : false), }));
    form.setValue('options', newOptions);
  };

  const hasCorrectAnswer = options.some(option => option.isCorrect);

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Question Text */}
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-arabic">نص السؤال</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isSubmitting}
                      placeholder="اكتب سؤالك هنا..."
                      {...field}
                      className="font-arabic min-h-20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Question Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-arabic">نوع السؤال</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع السؤال" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MULTIPLE_CHOICE" className="font-arabic">
                          اختيار من متعدد
                        </SelectItem>
                        <SelectItem value="TRUE_FALSE" className="font-arabic">
                          صح أو خطأ
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Difficulty */}
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-arabic">مستوى الصعوبة</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المستوى" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EASY" className="font-arabic">سهل</SelectItem>
                        <SelectItem value="MEDIUM" className="font-arabic">متوسط</SelectItem>
                        <SelectItem value="HARD" className="font-arabic">صعب</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Points */}
              <FormField
                control={form.control}
                name="points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-arabic">النقاط</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel className="font-arabic">الخيارات</FormLabel>
                {questionType === 'MULTIPLE_CHOICE' && fields.length < 6 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="font-arabic"
                  >
                    <PlusCircle className="h-4 w-4 ml-2" />
                    إضافة خيار
                  </Button>
                )}
              </div>

              {!hasCorrectAnswer && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-arabic">
                    يجب اختيار إجابة صحيحة واحدة على الأقل
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                { fields.map((field, index) => (
                  <div key={field.id } className="flex items-center gap-3 p-3 border rounded-lg">
                    <FormField
                      control={form.control}
                      name={`options.${index}.isCorrect`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={() => toggleCorrectAnswer(index)}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`options.${index}.text`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              disabled={isSubmitting || (questionType === 'TRUE_FALSE')}
                              placeholder={`الخيار ${index + 1}`}
                              {...field}
                              className="font-arabic"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {questionType === 'MULTIPLE_CHOICE' && fields.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(index)}
                        disabled={isSubmitting}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <FormField
              control={form.control}
              name="explanation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-arabic">تفسير الإجابة (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isSubmitting}
                      placeholder="اكتب تفسيراً للإجابة الصحيحة..."
                      {...field}
                      className="font-arabic"
                    />
                  </FormControl>
                  <FormDescription className="font-arabic">
                    سيتم عرض هذا التفسير للطلاب بعد الإجابة
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              disabled={isSubmitting || !hasCorrectAnswer}
              type="submit"
              className="w-full font-arabic"
            >
              { isSubmitting ? 'جاري الإضافة...' : 'إضافة السؤال' }
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
