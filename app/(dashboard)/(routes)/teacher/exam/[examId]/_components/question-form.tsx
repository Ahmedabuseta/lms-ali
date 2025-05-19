'use client'

import * as z from 'zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Pencil, PlusCircle, Trash } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MathRenderer } from '@/components/math-renderer'
import { MathDropdown } from '@/components/ui/math-dropdown'

interface QuestionFormProps {
  initialData?: {
    id: string
    text: string
    type: string
    options: {
      id: string
      text: string
      isCorrect: boolean
    }[]
  }
  examId: string
  nextPosition?: number
}

const formSchema = z.object({
  text: z.string().min(1, {
    message: 'Question text is required',
  }),
  type: z.string().min(1, {
    message: 'Question type is required',
  }),
  options: z.array(
    z.object({
      id: z.string().optional(),
      text: z.string().min(1, { message: 'Option text is required' }),
      isCorrect: z.boolean(),
    })
  ).refine(options => {
    // At least one option must be marked as correct
    return options.some(option => option.isCorrect);
  }, {
    message: 'At least one option must be marked as correct',
  }).refine(options => {
    // For TRUE_FALSE type, exactly 2 options are required
    if (options.length > 0) {
      const questionType = options[0]._questionType;
      if (questionType === 'TRUE_FALSE' && options.length !== 2) {
        return false;
      }
    }
    return true;
  }, {
    message: 'True/False questions must have exactly 2 options',
  })
});

export const QuestionForm = ({
  initialData,
  examId,
  nextPosition,
}: QuestionFormProps) => {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(!initialData);

  const defaultOptions = initialData?.options || [
    { text: '', isCorrect: false, _questionType: 'MULTIPLE_CHOICE' },
    { text: '', isCorrect: false, _questionType: 'MULTIPLE_CHOICE' },
    { text: '', isCorrect: false, _questionType: 'MULTIPLE_CHOICE' },
    { text: '', isCorrect: false, _questionType: 'MULTIPLE_CHOICE' },
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: initialData?.text || '',
      type: initialData?.type || 'MULTIPLE_CHOICE',
      options: defaultOptions,
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    name: "options",
    control: form.control,
  });

  const questionType = form.watch("type");

  // When the question type changes, update the options accordingly
  const handleTypeChange = (value: string) => {
    form.setValue('type', value);

    if (value === 'TRUE_FALSE') {
      // Set up True/False options
      form.setValue('options', [
        { text: 'True', isCorrect: false, _questionType: 'TRUE_FALSE' },
        { text: 'False', isCorrect: false, _questionType: 'TRUE_FALSE' },
      ]);
    } else {
      // Set up Multiple Choice options if switching from True/False
      if (form.getValues('options').length === 2) {
        form.setValue('options', [
          { text: '', isCorrect: false, _questionType: 'MULTIPLE_CHOICE' },
          { text: '', isCorrect: false, _questionType: 'MULTIPLE_CHOICE' },
          { text: '', isCorrect: false, _questionType: 'MULTIPLE_CHOICE' },
          { text: '', isCorrect: false, _questionType: 'MULTIPLE_CHOICE' },
        ]);
      } else {
        // Just update _questionType for all options
        const currentOptions = form.getValues('options');
        form.setValue('options', currentOptions.map(option => ({
          ...option,
          _questionType: 'MULTIPLE_CHOICE'
        })));
      }
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)
      
      if (initialData) {
        // Update existing question
        await axios.patch(`/api/exam/${examId}/questions/${initialData.id}`, values)
        toast.success('Question updated')
        router.push(`/teacher/exam/${examId}/questions`)
        router.refresh()
      } else {
        // Create new question
        await axios.post(`/api/exam/${examId}/questions`, values)
        toast.success('Question created')
        // Reset form for new question
        form.reset({
          text: '',
          type: 'MULTIPLE_CHOICE',
          options: [
            { text: '', isCorrect: false, _questionType: 'MULTIPLE_CHOICE' },
            { text: '', isCorrect: false, _questionType: 'MULTIPLE_CHOICE' },
            { text: '', isCorrect: false, _questionType: 'MULTIPLE_CHOICE' },
            { text: '', isCorrect: false, _questionType: 'MULTIPLE_CHOICE' },
          ],
        })
        // Refresh the page without redirecting
        router.refresh()
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Question details
        <Button onClick={() => setIsEditing(!isEditing)} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit question
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <div className="mt-4">
          <div className="text-lg font-medium">
            <MathRenderer content={initialData?.text || 'New Question'} />
          </div>
          <div className="mt-2 text-sm text-slate-700">
            Type: {initialData?.type === 'MULTIPLE_CHOICE' ? 'Multiple Choice' : 'True/False'}
          </div>
          {initialData?.options && initialData.options.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium">Options:</div>
              <div className="mt-2 space-y-2">
                {initialData.options.map(option => (
                  <div 
                    key={option.id} 
                    className={cn(
                      "p-2 border rounded-md",
                      option.isCorrect ? "border-green-300 bg-green-50" : "border-slate-200"
                    )}
                  >
                    <MathRenderer content={option.text} /> {option.isCorrect && "(Correct)"}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Text</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isSubmitting}
                      placeholder="Enter the question text. Use LaTeX syntax for math formulas e.g., $x^2$ or $$\int_0^1 x^2 dx$$"
                      {...field}
                    />
                  </FormControl>
                  <MathDropdown
                    title="Math Formatting Examples"
                    content="**Inline Math Examples:**\n\n- Basic expressions: $x + y = z$\n- Fractions: $\\frac{a}{b}$\n- Powers: $x^2 + y^2 = z^2$\n- Square roots: $\\sqrt{x^2 + y^2}$\n\n**Display Math Examples:**\n\n$$\\int_0^1 x^2 dx = \\frac{1}{3}$$\n\n$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$\n\n$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$"
                    defaultOpen={false}
                    className="mt-2 border-slate-200"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Type</FormLabel>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={handleTypeChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select question type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MULTIPLE_CHOICE">
                        Multiple Choice
                      </SelectItem>
                      <SelectItem value="TRUE_FALSE">
                        True / False
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <div className="font-medium flex items-center justify-between">
                Options
                <MathDropdown
                  title="Math Examples for Options"
                  content="**Basic Examples:**\n\n- Simple answer: $15$\n- Fraction: $\\frac{2}{3}$\n- Expression: $x^2 - 4x + 4$\n- With units: $5 \\text{ m/s}$\n- Mathematical set: $\\{1, 2, 3, 4\\}$\n\nYou can use the same math syntax in options as in questions."
                  className="w-auto"
                  titleClassName="text-sm py-1"
                />
              </div>
              
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-x-4">
                  <FormField
                    control={form.control}
                    name={`options.${index}.text`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            disabled={isSubmitting || (questionType === 'TRUE_FALSE')}
                            placeholder={`Option ${index + 1}`}
                            {...field}
                          />
                        </FormControl>
                        {index === 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            <MathRenderer content="Use $ for math formulas: $x^2$" />
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`options.${index}.isCorrect`}
                    render={({ field }) => (
                      <FormItem className="flex items-center space-y-0 space-x-2">
                        <FormControl>
                          <Checkbox
                            disabled={isSubmitting}
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              if (questionType === 'TRUE_FALSE') {
                                // For TRUE_FALSE, only one option can be correct
                                // Uncheck the other option before checking this one
                                if (checked) {
                                  const otherIndex = index === 0 ? 1 : 0;
                                  form.setValue(`options.${otherIndex}.isCorrect`, false);
                                }
                              }
                              field.onChange(checked);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Correct
                        </FormLabel>
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
              
              {questionType === 'MULTIPLE_CHOICE' && fields.length < 8 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({
                    text: '',
                    isCorrect: false,
                    _questionType: 'MULTIPLE_CHOICE'
                  })}
                  className="flex items-center mt-2"
                  disabled={isSubmitting}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-x-2">
              <Button
                disabled={isSubmitting}
                type="submit"
              >
                Save
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  )
}