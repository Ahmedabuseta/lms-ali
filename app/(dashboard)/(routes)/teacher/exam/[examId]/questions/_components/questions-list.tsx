'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { cn } from '@/lib/utils'
import { Pencil, GripVertical } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MathRenderer } from '@/components/math-renderer'

interface QuestionsListProps {
  examId: string
  questions: {
    id: string
    text: string
    type: string
    options: {
      id: string
      text: string
      isCorrect: boolean
    }[]
  }[]
  isLocked: boolean
}

export const QuestionsList = ({
  examId,
  questions,
  isLocked,
}: QuestionsListProps) => {
  const router = useRouter()
  const [items, setItems] = useState(questions)
  const [isSaving, setIsSaving] = useState(false)

  const onDragEnd = async (result: any) => {
    if (!result.destination || isLocked) return

    const updatedItems = Array.from(items)
    const [reorderedItem] = updatedItems.splice(result.source.index, 1)
    updatedItems.splice(result.destination.index, 0, reorderedItem)

    setItems(updatedItems)

    try {
      setIsSaving(true)
      await axios.put(`/api/exam/${examId}/questions/reorder`, {
        list: updatedItems.map((item, index) => ({
          id: item.id,
          position: index + 1,
        })),
      })
      toast.success('Questions reordered')
      router.refresh()
    } catch {
      toast.error('Failed to reorder questions')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mt-6">
      {questions.length === 0 && (
        <div className="text-center p-6 bg-slate-100 rounded-md">
          <p className="text-sm text-slate-500">No questions yet. Add one to get started.</p>
        </div>
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="questions">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {items.map((question, index) => (
                <Draggable
                  key={question.id}
                  draggableId={question.id}
                  index={index}
                  isDragDisabled={isLocked}
                >
                  {(provided) => (
                    <div
                      className={cn(
                        "flex items-center gap-x-2 bg-slate-100 border border-slate-200 rounded-md mb-4 p-4",
                        isLocked && "opacity-75",
                      )}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <div
                        className={cn(
                          "flex shrink-0 mr-2",
                          isLocked && "cursor-default",
                          !isLocked && "cursor-grab",
                        )}
                        {...provided.dragHandleProps}
                      >
                        <GripVertical className="h-5 w-5" />
                      </div>
                      <div className="flex-1 mr-4">
                        <div className="flex items-center gap-x-2 mb-1">
                          <Badge variant={question.type === 'MULTIPLE_CHOICE' ? 'default' : 'secondary'}>
                            {question.type === 'MULTIPLE_CHOICE' ? 'Multiple Choice' : 'True / False'}
                          </Badge>
                          <p className="text-sm text-slate-700">
                            Question {index + 1}
                          </p>
                        </div>
                        <div className="font-medium text-lg">
                          <MathRenderer content={question.text} />
                        </div>
                        <div className="mt-2">
                          <div className="text-sm text-slate-700 mb-1">Options:</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {question.options.map((option) => (
                              <div 
                                key={option.id}
                                className={cn(
                                  "text-sm p-2 border rounded-md",
                                  option.isCorrect ? "border-green-200 bg-green-50" : "border-slate-200"
                                )}
                              >
                                <MathRenderer content={option.text} /> {option.isCorrect && "(✓)"}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {!isLocked && (
                        <div>
                          <Link href={`/teacher/exam/${examId}/questions/${question.id}`}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}