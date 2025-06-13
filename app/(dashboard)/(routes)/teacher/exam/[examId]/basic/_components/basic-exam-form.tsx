'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface BasicExamFormProps { initialData: {
    title: string;
    description: string;
    chapterId: string;
    timeLimit?: number; };
  examId: string;
  courseId: string;
  chapters: { id: string;
    title: string; }[];
}

const formSchema = z.object({ title: z
    .string()
    .min(1, {
      message: 'Title is required', })
    .max(100),
  description: z.string().max(500).optional(),
  chapterId: z.string().optional(),
  timeLimit: z.coerce.number().int().min(1).max(180).optional(),
});

export const BasicExamForm = ({ initialData, examId, courseId, chapters }: BasicExamFormProps) => { const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData.title,
      description: initialData.description || '',
      chapterId: initialData.chapterId || 'no-chapter',
      timeLimit: initialData.timeLimit || undefined, },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => { try {
      setIsSubmitting(true);

      // Convert 'no-chapter' back to null for database storage
      const submitData = {
        ...values,
        chapterId: values.chapterId === 'no-chapter' ? null : values.chapterId, };

      await axios.patch(`/api/exam/${examId}`, submitData);

      toast.success('Exam updated');
      router.push(`/teacher/exam/${examId}`);
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exam Settings</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam Title</FormLabel>
                  <FormControl>
                    <Input disabled={isSubmitting} placeholder="e.g. 'Final Exam'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isSubmitting}
                      placeholder="Enter a description for your exam"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>This will be shown to students before they start the exam.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="chapterId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chapter</FormLabel>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={field.onChange}
                    value={field.value || 'no-chapter'}
                    defaultValue={field.value || 'no-chapter'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="No specific chapter" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no-chapter">No specific chapter</SelectItem>
                      {chapters.map((chapter) => (
                        <SelectItem key={chapter.id} value={chapter.id}>
                          {chapter.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Associate this exam with a specific chapter (optional).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Limit (Minutes)</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      type="number"
                      min={1}
                      max={180}
                      step={1}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>Time limit in minutes (1-180). Leave empty for no time limit.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex justify-between border-t bg-slate-50 p-4">
            <Button
              type="button"
              disabled={isSubmitting}
              variant="ghost"
              onClick={() => router.push(`/teacher/exam/${examId}`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
