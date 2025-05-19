'use client'

import { useState, useEffect } from 'react'
import { Trash, Plus, Pencil } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

interface Course {
  id: string
  title: string
}

interface Chapter {
  id: string
  title: string
}

interface Flashcard {
  id: string
  question: string
  answer: string
  chapterId: string
  createdAt: Date
}

interface FlashcardsClientProps {
  courses: Course[]
}

const formSchema = z.object({
  question: z.string().min(1, { message: 'Question is required' }),
  answer: z.string().min(1, { message: 'Answer is required' }),
  chapterId: z.string().min(1, { message: 'Chapter is required' }),
})

export const FlashcardsClient = ({ courses }: FlashcardsClientProps) => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [editingFlashcardId, setEditingFlashcardId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
      answer: '',
      chapterId: '',
    },
  })

  // Fetch chapters when selected course changes
  useEffect(() => {
    if (selectedCourse) {
      fetchChapters(selectedCourse)
      fetchFlashcards(selectedCourse)
    }
  }, [selectedCourse])

  // Reset form when editing flashcard changes
  useEffect(() => {
    if (editingFlashcardId) {
      const flashcard = flashcards.find((f) => f.id === editingFlashcardId)
      if (flashcard) {
        form.reset({
          question: flashcard.question,
          answer: flashcard.answer,
          chapterId: flashcard.chapterId,
        })
      }
    } else {
      form.reset({
        question: '',
        answer: '',
        chapterId: '',
      })
    }
  }, [editingFlashcardId, form, flashcards])

  const fetchChapters = async (courseId: string) => {
    try {
      setIsLoading(true)
      
      // Fixed the API endpoint to get published chapters for the course
      const response = await axios.get(`/api/courses/${courseId}/chapters?isPublished=true`)
      
      if (Array.isArray(response.data)) {
        setChapters(response.data)
      } else {
        // Log the unexpected response format
        console.error("Unexpected chapters response format:", response.data)
        setChapters([])
        toast.error('Error loading chapters (unexpected format)')
      }
    } catch (error) {
      console.error("Error fetching chapters:", error)
      toast.error('Failed to fetch chapters')
      setChapters([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFlashcards = async (courseId: string) => {
    try {
      setIsLoading(true)
      // In a real implementation, you would fetch flashcards from the API
      const response = await axios.get(`/api/courses/${courseId}/flashcards`)
      setFlashcards(response.data)
    } catch (error) {
      toast.error('Failed to fetch flashcards')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      
      if (!selectedCourse) {
        toast.error('Please select a course first');
        return;
      }
      
      if (editingFlashcardId) {
        // Update existing flashcard
        await axios.patch(`/api/flashcards/${editingFlashcardId}`, {
          ...values,
          courseId: selectedCourse // Ensure courseId is included in the update
        });
        toast.success('Flashcard updated successfully');
        setEditingFlashcardId(null);
      } else {
        // Create new flashcard
        
        await axios.post(`/api/courses/${selectedCourse}/flashcards`, {
          // courseId: selectedCourse,
          ...values,
        });
        toast.success('Flashcard created successfully');
      }
      
      // Refresh flashcards list
      fetchFlashcards(selectedCourse);
      
      // Reset form
      form.reset({
        question: '',
        answer: '',
        chapterId: '',
      });
      
    } catch (error: any) {
      console.error('Flashcard submission error:', error.response);
      toast.error(error?.response?.data?.message || 'Failed to save flashcard');
    } finally {
      setIsLoading(false);
    }
  }

  const handleDelete = async (flashcardId: string) => {
    try {
      setIsLoading(true)
      await axios.delete(`/api/flashcards/${flashcardId}`)
      toast.success('Flashcard deleted')
      
      // Refresh flashcards list
      if (selectedCourse) {
        fetchFlashcards(selectedCourse)
      }
    } catch (error) {
      toast.error('Failed to delete flashcard')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const cancelEditing = () => {
    setEditingFlashcardId(null)
    form.reset({
      question: '',
      answer: '',
      chapterId: '',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Flashcards Management</h1>
        <p className="text-sm text-slate-600">
          Create and manage flashcards for your courses
        </p>
      </div>

      <Separator />

      <div className="flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-4">
            <h2 className="text-lg font-medium mb-4">Select Course</h2>
            <Select
              value={selectedCourse || ''}
              onValueChange={(value) => setSelectedCourse(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          <Card className="p-4 md:col-span-2">
            {selectedCourse ? (
              <Tabs defaultValue="create">
                <TabsList className="mb-4">
                  <TabsTrigger value="create">
                    {editingFlashcardId ? 'Edit Flashcard' : 'Create Flashcard'}
                  </TabsTrigger>
                  <TabsTrigger value="manage">Manage Flashcards</TabsTrigger>
                </TabsList>
                
                <TabsContent value="create">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="chapterId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chapter</FormLabel>
                            <FormControl>
                              <Select 
                                value={field.value} 
                                onValueChange={field.onChange}
                                disabled={isLoading}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a chapter" />
                                </SelectTrigger>
                                <SelectContent>
                                  {chapters.map((chapter) => (
                                    <SelectItem key={chapter.id} value={chapter.id}>
                                      {chapter.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="question"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Question</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Enter the question"
                                disabled={isLoading}
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="answer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Answer</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Enter the answer"
                                disabled={isLoading}
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex gap-2">
                        <Button type="submit" disabled={isLoading}>
                          {editingFlashcardId ? 'Update Flashcard' : 'Create Flashcard'}
                        </Button>
                        {editingFlashcardId && (
                          <Button type="button" variant="outline" onClick={cancelEditing}>
                            Cancel
                          </Button>
                        )}
                      </div>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="manage">
                  {flashcards.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-slate-500">No flashcards found for this course</p>
                      <Button
                        variant="outline"
                        className="mt-2"
                        onClick={() => {
                          const element = document.querySelector('[data-value="create"]') as HTMLElement | null;
                          element?.click();
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create your first flashcard
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {flashcards.map((flashcard) => {
                        const chapter = chapters.find((c) => c.id === flashcard.chapterId);
                        
                        return (
                          <Card key={flashcard.id} className="p-4">
                            <div className="flex flex-col space-y-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm font-medium text-slate-500">
                                    Chapter: {chapter?.title || 'Unknown'}
                                  </p>
                                  <h3 className="font-semibold mt-1">Q: {flashcard.question}</h3>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingFlashcardId(flashcard.id)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(flashcard.id)}
                                  >
                                    <Trash className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                              <Separator />
                              <div>
                                <p className="text-sm font-medium text-slate-500">Answer:</p>
                                <p className="mt-1">{flashcard.answer}</p>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <p className="text-center text-sm text-slate-500 mb-4">
                  Select a course to manage its flashcards
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
