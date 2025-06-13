'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Pencil, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MathRenderer } from '@/components/math-renderer';

interface QuestionsListProps {
  examId: string;
  initialItems: {
    id: string;
    position: number;
    question: {
      id: string;
      text: string;
      type: string;
      options: {
        id: string;
        text: string;
        isCorrect: boolean;
      }[];
    };
  }[];
}

export const QuestionsList = ({ examId, initialItems }: QuestionsListProps) => {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [isSaving, setIsSaving] = useState(false);

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const updatedItems = Array.from(items);
    const [reorderedItem] = updatedItems.splice(result.source.index, 1);
    updatedItems.splice(result.destination.index, 0, reorderedItem);

    setItems(updatedItems);

    try {
      setIsSaving(true);
      await axios.put(`/api/exam/${examId}/questions/reorder`, {
        list: updatedItems.map((item, index) => ({
          id: item.id,
          position: index + 1,
        })),
      });
      toast.success('Questions reordered');
      router.refresh();
    } catch {
      toast.error('Failed to reorder questions');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-6" dir="rtl">
      {initialItems.length === 0 && (
        <div className="rounded-md bg-slate-100 dark:bg-slate-800 p-6 text-center">
          <p className="text-sm text-slate-500 font-arabic">لا توجد أسئلة بعد. أضف سؤالاً للبدء.</p>
        </div>
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="questions">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {items.map((examQuestion, index) => (
                <Draggable key={examQuestion.id} draggableId={examQuestion.id} index={index}>
                  {(provided) => (
                    <div
                      className="mb-4 flex items-center gap-x-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-4"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <div
                        className="mr-2 flex shrink-0 cursor-grab"
                        {...provided.dragHandleProps}
                      >
                        <GripVertical className="h-5 w-5" />
                      </div>
                      <div className="mr-4 flex-1">
                        <div className="mb-1 flex items-center gap-x-2">
                          <Badge variant={examQuestion.question.type === 'MULTIPLE_CHOICE' ? 'default' : 'secondary'}>
                            {examQuestion.question.type === 'MULTIPLE_CHOICE' ? 'اختيار متعدد' : 'صح / خطأ'}
                          </Badge>
                          <p className="text-sm text-slate-700 dark:text-slate-300 font-arabic">السؤال {index + 1}</p>
                        </div>
                        <div className="text-lg font-medium">
                          <MathRenderer content={examQuestion.question.text} />
                        </div>
                        <div className="mt-2">
                          <div className="mb-1 text-sm text-slate-700 dark:text-slate-300 font-arabic">الخيارات:</div>
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            {examQuestion.question.options.map((option) => (
                              <div
                                key={option.id}
                                className={cn(
                                  'rounded-md border p-2 text-sm',
                                  option.isCorrect 
                                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800',
                                )}
                              >
                                <MathRenderer content={option.text} /> {option.isCorrect && '(✓)'}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <Link href={`/teacher/exam/${examId}/questions/${examQuestion.question.id}`}>
                          <Button variant="ghost" size="sm" className="font-arabic">
                            <Pencil className="ml-2 h-4 w-4" />
                            تحرير
                          </Button>
                        </Link>
                      </div>
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
  );
};
