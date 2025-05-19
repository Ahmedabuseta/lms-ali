'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import axios from 'axios'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

interface CreateExamFormProps {
  courses: {
    id: string
    title: string
  }[]
  selectedCourseId?: string
  chapters: {
    id: string
    title: string
  }[]
  selectedChapterId?: string
}

const formSchema = z.object({
  title: z.string().min(1, {
    message: 'Title is required',
  }).max(100),
  description: z.string().max(500).optional(),
  courseId: z.string().min(1, {
    message: 'Course is required',
  }),
  chapterId: z.string().optional(),
  timeLimit: z.coerce.number().int().min(1).max(180).optional(),
  isPublished: z.boolean().default(false),
})

export const CreateExamForm = ({
  courses,
  selectedCourseId,
  chapters,
  selectedChapterId,
}: CreateExamFormProps) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      courseId: selectedCourseId || '',
      chapterId: selectedChapterId || '',
      timeLimit: 30,
      isPublished: false,
    },
  })

  const { watch, setValue } = form

  // Watch courseId to update chapters when course changes
  const watchedCourseId = watch('courseId')

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)
      
      const response = await axios.post('/api/exam', values)
      
      toast.success('Exam created successfully')
      router.push(`/teacher/exam/${response.data.id}`)
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exam Details</CardTitle>
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
                    <Input placeholder="e.g. Final Exam" {...field} />
                  </FormControl>
                  <FormDescription>
                    Give your exam a descriptive title.
                  </FormDescription>
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
                      placeholder="Provide a brief description of the exam"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    This will be visible to students before they start the exam.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value)
                        // Reset chapter when course changes
                        setValue('chapterId', '')
                        // Fetch chapters for the selected course
                        router.push(`/teacher/exam/create?courseId=${value}`)
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Select
                      value={field.value || ''}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a chapter" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* <SelectItem value="">
                          No specific chapter
                        </SelectItem> */}
                        {chapters.map((chapter) => (
                          <SelectItem key={chapter.id} value={chapter.id}>
                            {chapter.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Associate this exam with a specific chapter.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="timeLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Limit (Minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="180"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Set a time limit in minutes (1-180), or leave blank for no time limit.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between border rounded-md p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Publish Exam</FormLabel>
                    <FormDescription>
                      When enabled, the exam will be visible to students.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="border-t bg-slate-50 p-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto"
            >
              Create Exam
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}