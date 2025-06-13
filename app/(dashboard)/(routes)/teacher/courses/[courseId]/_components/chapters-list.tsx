'use client';

import { Chapter } from '@prisma/client';
import { useEffect, useState } from 'react';
import { DragDropContext,
  Droppable,
  Draggable,
  DropResult } from '@hello-pangea/dnd';
import { Grip, Pencil, Eye, Lock } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ChaptersListProps { items: Chapter[];
  onReorder: (updateData: { id: string; position: number }[]) => void;
  onEdit: (id: string) => void;
}

export const ChaptersList = ({ items, onReorder, onEdit }: ChaptersListProps) => { const [isMounted, setIsMounted] = useState(false);
  const [chapters, setChapters] = useState(items);
  const [dragError, setDragError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true); }, []);

  useEffect(() => {
    setChapters(items);
  }, [items]);

  const onDragEnd = (result: DropResult) => { try {
      if (!result.destination) return;

      const items = Array.from(chapters);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      const startIndex = Math.min(result.source.index, result.destination.index);
      const endIndex = Math.max(result.source.index, result.destination.index);

      const updatedChapters = items.slice(startIndex, endIndex + 1);

      setChapters(items);

      const bulkUpdateData = updatedChapters.map((chapter) => ({
        id: chapter.id,
        position: items.findIndex((item) => item.id === chapter.id), }));

      onReorder(bulkUpdateData);
      setDragError(null);
    } catch (error) { console.error('Drag and drop error:', error);
      setDragError('حدث خطأ أثناء إعادة ترتيب الفصول');
      setChapters(items); // Reset to original state }
  };

  if (!isMounted) { return (
      <div className="space-y-2">
        {items.map((chapter, index) => (
          <div
            key={chapter.id }
            className={ cn(
              'group flex items-center rounded-lg border backdrop-blur-xl shadow-sm',
              chapter.isPublished
                ? 'border-emerald-200/60 bg-emerald-50/70 dark:border-emerald-400/30 dark:bg-emerald-900/20'
                : 'border-indigo-200/60 bg-indigo-50/70 dark:border-indigo-400/30 dark:bg-indigo-900/20'
            ) }
          >
            <div className="flex flex-1 items-center justify-between py-2 px-3">
              <div className="flex items-center flex-wrap gap-2 flex-1 min-w-0">
                <div
                  className={ cn(
                    'flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold shrink-0',
                    chapter.isPublished
                      ? 'bg-emerald-200/80 text-emerald-800 dark:bg-emerald-700/50 dark:text-emerald-200'
                      : 'bg-indigo-200/80 text-indigo-800 dark:bg-indigo-700/50 dark:text-indigo-200'
                  ) }
                >
                  {index + 1}
                </div>
                <h4 className="text-sm font-semibold font-arabic truncate">
                  {chapter.title}
                </h4>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // If there's a drag error, show a fallback without drag functionality
  if (dragError) { return (
      <div className="space-y-2">
        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300 font-arabic">{dragError }</p>
          <button
            onClick={() => setDragError(null)}
            className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 mt-1"
          >
            إعادة المحاولة
          </button>
        </div>
        { chapters.map((chapter, index) => (
          <div
            key={chapter.id }
            className={ cn(
              'group flex items-center rounded-lg border backdrop-blur-xl shadow-sm',
              chapter.isPublished
                ? 'border-emerald-200/60 bg-emerald-50/70 dark:border-emerald-400/30 dark:bg-emerald-900/20'
                : 'border-indigo-200/60 bg-indigo-50/70 dark:border-indigo-400/30 dark:bg-indigo-900/20'
            ) }
          >
            <div className="flex flex-1 items-center justify-between py-2 px-3">
              <div className="flex items-center flex-wrap gap-2 flex-1 min-w-0">
                <div
                  className={ cn(
                    'flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold shrink-0',
                    chapter.isPublished
                      ? 'bg-emerald-200/80 text-emerald-800 dark:bg-emerald-700/50 dark:text-emerald-200'
                      : 'bg-indigo-200/80 text-indigo-800 dark:bg-indigo-700/50 dark:text-indigo-200'
                  ) }
                >
                  {index + 1}
                </div>
                <h4 className="text-sm font-semibold font-arabic truncate">
                  {chapter.title}
                </h4>
              </div>
              <button
                onClick={() => onEdit(chapter.id)}
                className="text-sm text-blue-600 hover:text-blue-800 font-arabic"
              >
                تعديل
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  try {
    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="chapters">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              { chapters.map((chapter, index) => (
                <Draggable key={chapter.id } draggableId={chapter.id} index={index}>
                  { (provided, snapshot) => (
                    <div
                      className={cn(
                        'group flex items-center rounded-lg border backdrop-blur-xl shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]',
                        chapter.isPublished
                          ? 'border-emerald-200/60 bg-emerald-50/70 dark:border-emerald-400/30 dark:bg-emerald-900/20'
                          : 'border-indigo-200/60 bg-indigo-50/70 dark:border-indigo-400/30 dark:bg-indigo-900/20',
                        snapshot.isDragging && 'rotate-1 scale-105 shadow-xl'
                      ) }
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      {/* Compact Drag Handle */}
                      <div
                        className={ cn(
                          'flex h-10 w-10 items-center justify-center rounded-r-lg border-l transition-all duration-300 hover:scale-110',
                          chapter.isPublished
                            ? 'border-l-emerald-200/60 bg-emerald-100/80 hover:bg-emerald-200/80 dark:border-l-emerald-400/30 dark:bg-emerald-800/30 dark:hover:bg-emerald-700/40'
                            : 'border-l-indigo-200/60 bg-indigo-100/80 hover:bg-indigo-200/80 dark:border-l-indigo-400/30 dark:bg-indigo-800/30 dark:hover:bg-indigo-700/40'
                        ) }
                        {...provided.dragHandleProps}
                      >
                        <Grip
                          className={ cn(
                            'h-4 w-4 transition-colors duration-300',
                            chapter.isPublished
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-indigo-600 dark:text-indigo-400'
                          ) }
                        />
                      </div>

                      {/* Compact Chapter Content */}
                      <div className="flex flex-1 items-center justify-between py-2 px-3">
                        <div className="flex items-center flex-wrap gap-2 flex-1 min-w-0">
                          {/* Compact Chapter Number */}
                          <div
                            className={ cn(
                              'flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold shrink-0',
                              chapter.isPublished
                                ? 'bg-emerald-200/80 text-emerald-800 dark:bg-emerald-700/50 dark:text-emerald-200'
                                : 'bg-indigo-200/80 text-indigo-800 dark:bg-indigo-700/50 dark:text-indigo-200'
                            ) }
                          >
                            {index + 1}
                          </div>

                          {/* Compact Chapter Title */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4
                                className={ cn(
                                  'text-sm font-semibold font-arabic truncate',
                                  chapter.isPublished
                                    ? 'text-emerald-900 dark:text-emerald-100'
                                    : 'text-indigo-900 dark:text-indigo-100'
                                ) }
                              >
                                {chapter.title}
                              </h4>
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-arabic shrink-0">
                                الفصل {index + 1}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Compact Actions and Badges */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Compact Free Badge */}
                          { chapter.isFree && (
                            <Badge
                              variant="outline"
                              className="h-5 px-1.5 text-xs bg-orange-50/80 border-orange-200/60 text-orange-700 backdrop-blur-sm dark:bg-orange-900/20 dark:border-orange-400/30 dark:text-orange-300 font-arabic"
                            >
                              <Eye className="ml-0.5 h-2.5 w-2.5" />
                              مجاني
                            </Badge>
                          ) }

                          {/* Compact Published Status Badge */}
                          <Badge
                            className={ cn(
                              'h-5 px-1.5 text-xs backdrop-blur-sm font-arabic',
                              chapter.isPublished
                                ? 'bg-emerald-500/90 hover:bg-emerald-600/90 text-white'
                                : 'bg-gray-500/90 hover:bg-gray-600/90 text-white'
                            ) }
                          >
                            { chapter.isPublished ? (
                              <>
                                <Eye className="ml-0.5 h-2.5 w-2.5" />
                                منشور
                              </>
                            ) : (
                              <>
                                <Lock className="ml-0.5 h-2.5 w-2.5" />
                                مسودة
                              </>
                            ) }
                          </Badge>

                          {/* Compact Edit Button */}
                          <button
                            onClick={() => onEdit(chapter.id)}
                            className={ cn(
                              'group/edit flex h-6 w-6 items-center justify-center rounded-md transition-all duration-300 hover:scale-110',
                              chapter.isPublished
                                ? 'bg-emerald-100/80 text-emerald-600 hover:bg-emerald-200/90 hover:text-emerald-700 dark:bg-emerald-800/30 dark:text-emerald-400 dark:hover:bg-emerald-700/50'
                                : 'bg-indigo-100/80 text-indigo-600 hover:bg-indigo-200/90 hover:text-indigo-700 dark:bg-indigo-800/30 dark:text-indigo-400 dark:hover:bg-indigo-700/50'
                            ) }
                            title="تعديل الفصل"
                          >
                            <Pencil className="h-3 w-3 transition-transform duration-300 group-hover/edit:rotate-12" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}

              {/* Compact Empty State */}
              { chapters.length === 0 && (
                <div className="rounded-lg border border-indigo-200/60 bg-indigo-50/40 p-6 text-center backdrop-blur-sm dark:border-indigo-400/30 dark:bg-indigo-900/20">
                  <div className="mx-auto h-12 w-12 rounded-full bg-indigo-100/80 flex items-center justify-center dark:bg-indigo-800/40">
                    <Grip className="h-6 w-6 text-indigo-400 dark:text-indigo-500" />
                  </div>
                  <p className="mt-3 text-sm text-indigo-700 dark:text-indigo-300 font-arabic">لا توجد فصول بعد</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-arabic">ابدأ بإضافة فصول لتنظيم محتوى دورتك</p>
                </div>
              ) }
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  } catch (error) {
    console.error('DragDropContext error:', error);
    setDragError('حدث خطأ في نظام السحب والإفلات');
    return null;
  }
};
