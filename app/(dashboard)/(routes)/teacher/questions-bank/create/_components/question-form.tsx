'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Trash, Plus } from 'lucide-react'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

const formSchema = z.object({
  text: z.string().min(1, {
    message: 'Question text is required',
  }),
  type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  courseId: z.string().min(1, {
    message: 'Course is required',
  }),
  chapterId: z.string().optional(),
  options: z.array(
    z.object({
      text: z.string().min(1, { message: 'Option text is required' }),
      isCorrect: z.boolean().default(false),
    })
  ).refine(options => options.some(option => option.isCorrect), {
    message: "At least one option must be marked as correct",
  }),
})

interface QuestionFormProps {
  courseId?: string | ''
  chapterId?: string | ''
  courses: { id: string; title: string }[] |[]
  chapters: { id: string; title: string }[] | []
}

export const QuestionForm = ({
  courseId,
  chapterId,
  courses,
  chapters,
}: QuestionFormProps) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

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
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  })

  const questionType = form.watch('type')
  const selectedCourseId = form.watch('courseId')

  // Reset options when changing question type
  useEffect(() => {
    if (questionType === 'TRUE_FALSE') {
      form.setValue('options', [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: false }
      ])
    } else if (questionType === 'MULTIPLE_CHOICE' && fields.length < 2) {
      form.setValue('options', [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ])
    }
  }, [questionType, form, fields.length])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)
      
      await axios.post('/api/practice/questions/create', values)
      
      toast.success('Question added to bank')
      router.push('/teacher/questions-bank')
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
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
                      <Textarea
                        placeholder="Enter your question here"
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Type</FormLabel>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a question type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                      <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Select
                    disabled={isSubmitting}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={(value) => {
                      field.onChange(value)
                      form.setValue('chapterId', '')
                    }}
                    value={field.value}
                    defaultValue={field.value}
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
                    disabled={isSubmitting || !selectedCourseId}
                    onValueChange={field.onChange}
                    value={field.value || ''}
                    defaultValue={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a chapter" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* <SelectItem value="">No specific chapter</SelectItem> */}
                      {chapters
                        .map((chapter) => (
                          <SelectItem key={chapter.id} value={chapter.id}>
                            {chapter.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Associate this question with a specific chapter
                  </FormDescription>
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
                  {questionType === 'MULTIPLE_CHOICE'
                    ? 'Add options and select the correct answer(s)'
                    : 'Select the correct answer'}
                </FormDescription>
              </div>
              
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-x-2">
                    <FormField
                      control={form.control}
                      name={`options.${index}.isCorrect`}
                      render={({ field: checkboxField }) => (
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
                      render={({ field: textField }) => (
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
                    onClick={() => append({ text: '', isCorrect: false })}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                )}
                
                {form.formState.errors.options?.root && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.options.root.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              Create Practice Question
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}