'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Trash, Plus, BookOpen, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({ text: z.string().min(1, {
    message: 'Question text is required', }),
  type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  courseId: z.string().min(1, { message: 'Course is required', }),
  chapterId: z.string().optional(),
  options: z
    .array(
      z.object({ text: z.string().min(1, { message: 'Option text is required' }),
        isCorrect: z.boolean().default(false),
      }),
    )
    .refine((options) => options.some((option) => option.isCorrect), { message: 'At least one option must be marked as correct', }),
});

interface QuestionFormProps { courseId?: string | '';
  chapterId?: string | '';
  courses: { id: string; title: string }[] | [];
  chapters: { id: string; title: string }[] | [];
}

export const QuestionForm = ({ courseId, chapterId, courses, chapters }: QuestionFormProps) => { const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
      type: 'MULTIPLE_CHOICE',
      difficulty: 'MEDIUM',
      courseId: courseId || '',
      chapterId: chapterId || '',
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
  const selectedCourseId = form.watch('courseId');

  // Reset options when changing question type
  useEffect(() => { if (questionType === 'TRUE_FALSE') {
      form.setValue('options', [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: false },
      ]);
    } else if (questionType === 'MULTIPLE_CHOICE' && fields.length < 2) { form.setValue('options', [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ]);
    }
  }, [questionType, form, fields.length]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => { try {
      setIsSubmitting(true);

      await axios.post('/api/practice/questions/create', values);

      toast.success('Question added to bank');
      router.push('/teacher/questions-bank');
      router.refresh(); } catch (error) {
      console.error(error);
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Text</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter your question here" {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Type</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={isSubmitting}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                      <option value="TRUE_FALSE">True/False</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={isSubmitting}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اختيار الدورة</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {courses.map((course) => (
                        <Card
                          key={course.id}
                          className={ cn(
                            'cursor-pointer border-2 transition-all duration-200 hover:border-primary/70',
                            field.value === course.id
                              ? 'border-primary bg-primary/10 shadow-sm'
                              : 'border-gray-200 bg-white hover:border-primary/50',
                          ) }
                          onClick={ () => {
                            field.onChange(course.id);
                            form.setValue('chapterId', ''); }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={ cn(
                                  'rounded-lg p-2',
                                  field.value === course.id
                                    ? 'bg-primary/20 text-primary'
                                    : 'bg-muted text-muted-foreground',
                                ) }
                              >
                                <BookOpen className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3
                                  className={ cn(
                                    'truncate font-medium',
                                    field.value === course.id ? 'text-primary' : 'text-foreground',
                                  ) }
                                >
                                  {course.title}
                                </h3>
                                <p className="text-xs text-muted-foreground">انقر للاختيار</p>
                              </div>
                              {field.value === course.id && (
                                <div className="rounded-full bg-primary p-1 text-primary-foreground">
                                  <CheckCircle className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
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
                  <FormLabel>Chapter (Optional)</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={isSubmitting || !selectedCourseId}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">No specific chapter</option>
                      {chapters.map((chapter) => (
                        <option key={chapter.id} value={chapter.id}>
                          {chapter.title}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormDescription>Associate this question with a specific chapter</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <FormLabel className="text-base">Answer Options</FormLabel>
                <FormDescription>
                  { questionType === 'MULTIPLE_CHOICE'
                    ? 'Add options and select the correct answer(s)'
                    : 'Select the correct answer' }
                </FormDescription>
              </div>

              <div className="space-y-4">
                { fields.map((field, index) => (
                  <div key={field.id } className="flex items-center gap-x-2">
                    <FormField
                      control={form.control}
                      name={`options.${index}.isCorrect`}
                      render={ ({ field: checkboxField }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={checkboxField.value}
                              onCheckedChange={checkboxField.onChange}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`options.${index}.text`}
                      render={ ({ field: textField }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              disabled={isSubmitting || questionType === 'TRUE_FALSE'}
                              placeholder={`Option ${index + 1}`}
                              {...textField}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {questionType === 'MULTIPLE_CHOICE' && fields.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isSubmitting}
                        onClick={() => remove(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {questionType === 'MULTIPLE_CHOICE' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={ () => append({ text: '', isCorrect: false })}
                    className="mt-2"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Option
                  </Button>
                )}

                {form.formState.errors.options?.root && (
                  <p className="text-sm font-medium text-destructive">{form.formState.errors.options.root.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              Create Practice Question
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
