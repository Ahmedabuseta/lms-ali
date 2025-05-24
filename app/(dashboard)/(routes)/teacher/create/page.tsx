'use client';

import * as z from 'zod';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { Form, FormControl, FormDescription, FormField, FormLabel, FormMessage, FormItem } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  title: z.string().min(1, {
    message: 'Title is required',
  }),
});

const CreatePage = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post('/api/courses', values);
      router.push(`/teacher/courses/${response.data.id}`);
      toast.success('Course created');
    } catch {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Enhanced decorative elements for both themes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-10 top-20 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/5 blur-3xl dark:from-blue-400/10 dark:to-indigo-400/5"></div>
        <div
          className="absolute bottom-1/4 right-20 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/5 blur-3xl dark:from-purple-400/10 dark:to-pink-400/5"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-5xl p-6 md:items-center md:justify-center">
        <div className="w-full max-w-lg rounded-lg border border-border/50 bg-card/60 p-8 shadow-lg backdrop-blur-sm">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground">إنشاء دورة جديدة</h1>
            <p className="mt-2 text-muted-foreground">
              ما اسم الدورة التي تريد إنشاءها؟ لا تقلق، يمكنك تغيير هذا لاحقاً.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-foreground">عنوان الدورة</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="مثال: 'تطوير المواقع المتقدم'"
                        className="border-border/60 bg-background/50 focus:border-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-muted-foreground">ماذا ستُدرِّس في هذه الدورة؟</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-x-4 pt-4">
                <Button asChild type="button" variant="outline" className="flex-1">
                  <Link href="/teacher">إلغاء</Link>
                </Button>
                <Button type="submit" disabled={!isValid || isSubmitting} className="flex-1">
                  {isSubmitting ? 'جاري الإنشاء...' : 'متابعة'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
