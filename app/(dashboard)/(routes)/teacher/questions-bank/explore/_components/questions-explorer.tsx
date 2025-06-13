'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, Edit, Trash2, Eye, ChevronLeft, ChevronRight, Loader2, FileText, BookOpen, Target } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDebounce } from '@/hooks/use-debounce';
import { MathRenderer } from '@/components/math-renderer';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger, } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';

interface Question { id: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'PASSAGE';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  points: number;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean; }>;
  questionBank: { id: string;
    title: string;
    course: {
      id: string;
      title: string; };
    chapter?: { id: string;
      title: string; } | null;
  };
  passage?: { id: string;
    title: string;
    content: string; } | null;
  createdAt: Date;
}

interface Course { id: string;
  title: string; }

interface Filters { courseId: string;
  type: string;
  difficulty: string;
  search: string; }

interface QuestionsExplorerProps { questions: Question[];
  courses: Course[];
  currentPage: number;
  totalPages: number;
  totalQuestions: number;
  filters: Filters; }

// New Passage Component
interface PassageCardProps { passage: {
    id: string;
    title: string;
    content: string; };
  questionCount: number;
  onView: () => void;
}

const PassageCard = ({ passage, questionCount, onView }: PassageCardProps) => { const [isLoading, setIsLoading] = useState(false);

  const handleView = async () => {
    setIsLoading(true);
    try {
      onView(); } finally { // Reset loading after a short delay for visual feedback
      setTimeout(() => setIsLoading(false), 500); }
  };

  return (
    <div className={ `group relative overflow-hidden rounded-xl border border-white/20 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 backdrop-blur-sm transition-all duration-300 ${
      isLoading ? 'opacity-60 cursor-wait pointer-events-none' : 'hover:border-white/30 hover:shadow-lg hover:shadow-indigo-500/10' } dark:border-white/10 dark:from-indigo-400/20 dark:to-purple-500/20 dark:hover:border-white/20 dark:hover:shadow-indigo-400/20`}>
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-600/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-indigo-400/10 dark:to-purple-500/10" />

      {/* Loading overlay */}
      { isLoading && (
        <div className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex items-center gap-2 text-sm font-arabic text-gray-700 dark:text-gray-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            جارِ التحميل...
          </div>
        </div>
      ) }

      <div className="relative p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white font-arabic text-lg">
                {passage.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 rounded-full bg-indigo-100/80 dark:bg-indigo-900/50 px-2 py-1 backdrop-blur-sm">
                  <Target className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300 font-arabic">
                    {questionCount} سؤال
                  </span>
                </div>
                <div className="rounded-full bg-purple-100/80 dark:bg-purple-900/50 px-2 py-1 backdrop-blur-sm">
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-300 font-arabic">
                    قطعة
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleView}
            disabled={isLoading}
            className={ `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium backdrop-blur-sm transition-all duration-200 font-arabic ${
              isLoading
                ? 'bg-gray-300/20 text-gray-500 cursor-not-allowed border border-gray-300/30'
                : 'bg-white/20 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-white/20 hover:shadow-md cursor-pointer' }`}
          >
            { isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" /> }
            عرض
          </button>
        </div>

        <div className="rounded-lg bg-white/50 dark:bg-gray-800/50 p-4 backdrop-blur-sm border border-white/20 dark:border-gray-700/50">
          <div className="text-sm text-gray-600 dark:text-gray-300 font-arabic leading-relaxed line-clamp-3">
            <MathRenderer content={ passage.content.slice(0, 150) + (passage.content.length > 150 ? '...' : '') } />
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Question Card Component
interface QuestionCardProps { question: any;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void; }

const QuestionCard = ({ question, onView, onEdit, onDelete }: QuestionCardProps) => { const [isDeleting, setIsDeleting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE':
        return 'from-emerald-500/20 to-green-600/20 border-emerald-200/30 dark:from-emerald-400/30 dark:to-green-500/30 dark:border-emerald-400/20';
      case 'TRUE_FALSE':
        return 'from-amber-500/20 to-orange-600/20 border-amber-200/30 dark:from-amber-400/30 dark:to-orange-500/30 dark:border-amber-400/20';
      case 'PASSAGE':
        return 'from-indigo-500/20 to-purple-600/20 border-indigo-200/30 dark:from-indigo-400/30 dark:to-purple-500/30 dark:border-indigo-400/20';
      default:
        return 'from-gray-500/20 to-slate-600/20 border-gray-200/30 dark:from-gray-400/30 dark:to-slate-500/30 dark:border-gray-400/20'; }
  };

  const getTypeLabel = (type: string) => { switch (type) {
      case 'MULTIPLE_CHOICE':
        return 'اختيار متعدد';
      case 'TRUE_FALSE':
        return 'صح أم خطأ';
      case 'PASSAGE':
        return 'قطعة';
      default:
        return type; }
  };

  const getDifficultyColor = (difficulty: string) => { switch (difficulty) {
      case 'EASY':
        return 'bg-green-100/80 text-green-700 dark:bg-green-900/50 dark:text-green-300';
      case 'MEDIUM':
        return 'bg-yellow-100/80 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'HARD':
        return 'bg-red-100/80 text-red-700 dark:bg-red-900/50 dark:text-red-300';
      default:
        return 'bg-gray-100/80 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300'; }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = async () => {
    setIsNavigating(true);
    onEdit();
  };

  const isDisabled = isDeleting || isNavigating;

  return (
    <div className={ `group relative overflow-hidden rounded-xl border backdrop-blur-sm transition-all duration-300 ${
      isDisabled ? 'opacity-60 pointer-events-none cursor-wait' : 'hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20' } bg-gradient-to-br ${getTypeColor(question.type)}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Loading overlay */}
      { isDisabled && (
        <div className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex items-center gap-2 text-sm font-arabic text-gray-700 dark:text-gray-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            {isDeleting ? 'جارِ الحذف...' : 'جارِ التحميل...' }
          </div>
        </div>
      )}

      <div className="relative p-6 space-y-4">
        {/* Header with badges */}
        <div className="flex items-start justify-between">
          <div className="flex flex-wrap gap-2">
            <div className="rounded-full bg-white/20 dark:bg-white/10 px-3 py-1 backdrop-blur-sm">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 font-arabic">
                {getTypeLabel(question.type)}
              </span>
            </div>
            <div className={`rounded-full px-3 py-1 backdrop-blur-sm ${getDifficultyColor(question.difficulty)}`}>
              <span className="text-sm font-medium font-arabic">
                { question.difficulty === 'EASY' ? 'سهل' : question.difficulty === 'MEDIUM' ? 'متوسط' : 'صعب' }
              </span>
            </div>
            <div className="rounded-full bg-blue-100/80 dark:bg-blue-900/50 px-3 py-1 backdrop-blur-sm">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300 font-arabic">
                {question.points} نقطة
              </span>
            </div>
          </div>
        </div>

        {/* Passage if exists */}
        { question.passage && (
          <div className="rounded-lg bg-white/30 dark:bg-gray-900/30 p-4 backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="font-medium text-indigo-700 dark:text-indigo-300 font-arabic text-sm">
                القطعة: {question.passage.title }
              </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-arabic line-clamp-2">
              <MathRenderer content={ question.passage.content.slice(0, 100) + '...' } />
            </div>
          </div>
        )}

        {/* Question text */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white font-arabic leading-relaxed">
            <MathRenderer content={question.text} />
          </h3>

          <div className="text-sm text-gray-600 dark:text-gray-400 font-arabic">
            <div className="rounded-lg bg-white/20 dark:bg-gray-800/30 px-3 py-2 backdrop-blur-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">الدورة:</span> {question.questionBank.course.title}
              { question.questionBank.chapter && (
                <>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">الفصل:</span> {question.questionBank.chapter.title }
                </>
              )}
            </div>
          </div>
        </div>

        {/* Options */}
        { question.options && question.options.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {question.options.slice(0, 4).map((option: any, index: number) => (
              <div
                key={option.id }
                className={ `p-3 rounded-lg backdrop-blur-sm font-arabic transition-all duration-200 border ${
                  option.isCorrect
                    ? 'bg-green-500/20 border-green-300/40 text-green-800 dark:bg-green-400/20 dark:border-green-500/40 dark:text-green-200'
                    : 'bg-white/20 border-white/20 text-gray-700 dark:bg-gray-800/30 dark:border-gray-600/30 dark:text-gray-300' }`}
              >
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-xs bg-white/40 dark:bg-gray-700/50 rounded px-1.5 py-0.5 border border-white/30 dark:border-gray-600/30 backdrop-blur-sm">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <div className="flex-1">
                    <MathRenderer content={option.text} />
                  </div>
                  { option.isCorrect && (
                    <span className="text-green-600 dark:text-green-400 font-bold text-sm">✓</span>
                  ) }
                </div>
              </div>
            ))}
            { question.options.length > 4 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 font-arabic col-span-full pt-2 border-t border-white/20 dark:border-gray-700/30">
                و {question.options.length - 4 } خيارات أخرى...
              </div>
            )}
          </div>
        )}

        {/* Enhanced Actions with loading states */}
        <div className="flex items-center justify-between pt-4 border-t border-white/20 dark:border-gray-700/30">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-arabic">
            {question.createdAt.toLocaleDateString('ar-SA')}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onView}
              disabled={isDisabled}
              className={ `flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium backdrop-blur-sm transition-all duration-200 border font-arabic ${
                isDisabled
                  ? 'bg-gray-300/20 border-gray-300/30 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-300/30 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 hover:shadow-md cursor-pointer' }`}
            >
              <Eye className="h-4 w-4" />
              عرض
            </button>
            <button
              onClick={handleEdit}
              disabled={isDisabled}
              className={ `flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium backdrop-blur-sm transition-all duration-200 border font-arabic ${
                isDisabled
                  ? 'bg-gray-300/20 border-gray-300/30 text-gray-500 cursor-not-allowed'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-300/30 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:shadow-md cursor-pointer' }`}
            >
              { isNavigating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4" /> }
              تعديل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const QuestionsExplorer = ({ questions,
  courses,
  currentPage,
  totalPages,
  totalQuestions,
  filters, }: QuestionsExplorerProps) => { const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);
  const [navigatingToEdit, setNavigatingToEdit] = useState<string | null>(null);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search to avoid too many requests
  const debouncedSearch = useDebounce(searchValue, 500);

  // Update search filter when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      updateFilters({ search: debouncedSearch });
    }
  }, [debouncedSearch, filters.search]);

  const updateFilters = useCallback((newFilters: Partial<Filters>) => { setIsLoading(true);
    const params = new URLSearchParams(searchParams || '');

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value); } else {
        params.delete(key);
      }
    });

    params.set('page', '1'); // Reset to first page when filters change
    router.push(`/teacher/questions-bank/explore?${params.toString()}`);

    // Reset loading state after navigation
    setTimeout(() => setIsLoading(false), 300);
  }, [searchParams, router]);

  const goToPage = useCallback((page: number) => { setIsLoading(true);
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('page', page.toString());
    router.push(`/teacher/questions-bank/explore?${params.toString() }`);

    // Reset loading state after navigation
    setTimeout(() => setIsLoading(false), 300);
  }, [searchParams, router]);

  // Reset loading state when component re-renders with new data
  useEffect(() => {
    setIsLoading(false);
  }, [questions]);

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      setDeletingQuestionId(questionId);

      const response = await fetch(`/api/questions/${questionId}`, { method: 'DELETE', });

      if (!response.ok) {
        throw new Error('Failed to delete question');
      }

      toast.success('تم حذف السؤال بنجاح');
      router.refresh();
    } catch (error) { console.error('Delete error:', error);
      toast.error('حدث خطأ أثناء حذف السؤال'); } finally {
      setDeletingQuestionId(null);
    }
  };

  const handleEditQuestion = async (questionId: string) => {
    setNavigatingToEdit(questionId);
    router.push(`/teacher/questions-bank/edit/${questionId}`);
  };

  const getTypeLabel = (type: string) => { switch (type) {
      case 'MULTIPLE_CHOICE':
        return 'اختيار متعدد';
      case 'TRUE_FALSE':
        return 'صح أم خطأ';
      case 'PASSAGE':
        return 'قطعة';
      default:
        return type; }
  };

  const getDifficultyLabel = (difficulty: string) => { switch (difficulty) {
      case 'EASY':
        return 'سهل';
      case 'MEDIUM':
        return 'متوسط';
      case 'HARD':
        return 'صعب';
      default:
        return difficulty; }
  };

  const getTypeColor = (type: string) => { switch (type) {
      case 'MULTIPLE_CHOICE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'TRUE_FALSE':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'PASSAGE':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'; }
  };

  const getDifficultyColor = (difficulty: string) => { switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'HARD':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'; }
  };

  const clearAllFilters = () => { setIsLoading(true);
    setSearchValue('');
    updateFilters({
      courseId: '',
      type: '',
      difficulty: '',
      search: '' });
    // Reset loading state after a short delay
    setTimeout(() => setIsLoading(false), 300);
  };

  const hasActiveFilters = filters.courseId || filters.type || filters.difficulty || filters.search;

  return (
    <div className="space-y-8 min-h-screen bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-indigo-100/30 dark:from-gray-900/30 dark:via-gray-800/20 dark:to-gray-800/30 rounded-2xl p-8">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <Button
          onClick={clearAllFilters}
          variant="outline"
          className="font-arabic bg-white/20 dark:bg-white/10 backdrop-blur-md border-white/30 dark:border-white/20 hover:bg-white/30 dark:hover:bg-white/15 transition-colors duration-200"
          disabled={!hasActiveFilters}
        >
          <Filter className="ml-2 h-4 w-4" />
          مسح الفلاتر
        </Button>
      </div>

      {/* Enhanced Filters */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-2xl shadow-black/5 dark:shadow-black/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg font-arabic">
            <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            الفلاتر والبحث
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 font-arabic">البحث</label>
              <div className="relative">
                <Search className={ `absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                  isLoading ? 'text-blue-500 animate-pulse' : 'text-gray-500 dark:text-gray-400' }`} />
                <Input
                  placeholder="ابحث في الأسئلة..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  disabled={isLoading}
                  className={ `pl-10 font-arabic border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200 hover:bg-white/70 dark:hover:bg-gray-800/70 ${
                    isLoading ? 'cursor-wait opacity-60' : 'cursor-text' }`}
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 font-arabic">الدورة</label>
              <div className="relative">
                <select
                  value={filters.courseId}
                  onChange={ (e) => updateFilters({ courseId: e.target.value })}
                  disabled={isLoading}
                  className={ `flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 font-arabic transition-all duration-200 hover:bg-white/70 dark:hover:bg-gray-800/70 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236B7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.5rem_center] bg-no-repeat pr-10 ${
                    isLoading ? 'cursor-wait opacity-60' : 'cursor-pointer' }`}
                >
                  <option value="">جميع الدورات</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                {isLoading && (
                  <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 font-arabic">نوع السؤال</label>
              <div className="relative">
                <select
                  value={filters.type}
                  onChange={ (e) => updateFilters({ type: e.target.value })}
                  disabled={isLoading}
                  className={ `flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 font-arabic transition-all duration-200 hover:bg-white/70 dark:hover:bg-gray-800/70 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236B7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.5rem_center] bg-no-repeat pr-10 ${
                    isLoading ? 'cursor-wait opacity-60' : 'cursor-pointer' }`}
                >
                  <option value="">جميع الأنواع</option>
                  <option value="MULTIPLE_CHOICE">اختيار متعدد</option>
                  <option value="TRUE_FALSE">صح أم خطأ</option>
                  <option value="PASSAGE">قطعة</option>
                </select>
                {isLoading && (
                  <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 font-arabic">مستوى الصعوبة</label>
              <div className="relative">
                <select
                  value={filters.difficulty}
                  onChange={ (e) => updateFilters({ difficulty: e.target.value })}
                  disabled={isLoading}
                  className={ `flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 font-arabic transition-all duration-200 hover:bg-white/70 dark:hover:bg-gray-800/70 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236B7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.5rem_center] bg-no-repeat pr-10 ${
                    isLoading ? 'cursor-wait opacity-60' : 'cursor-pointer' }`}
                >
                  <option value="">جميع المستويات</option>
                  <option value="EASY">سهل</option>
                  <option value="MEDIUM">متوسط</option>
                  <option value="HARD">صعب</option>
                </select>
                {isLoading && (
                  <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          { hasActiveFilters && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-gray-600 font-arabic">الفلاتر النشطة:</span>
                {filters.courseId && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 font-arabic">
                    دورة: {courses.find(c => c.id === filters.courseId)?.title }
                  </Badge>
                )}
                { filters.type && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 font-arabic">
                    نوع: {getTypeLabel(filters.type) }
                  </Badge>
                )}
                { filters.difficulty && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 font-arabic">
                    صعوبة: {getDifficultyLabel(filters.difficulty) }
                  </Badge>
                )}
                { filters.search && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200 font-arabic">
                    بحث: "{filters.search }"
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Results Summary */}
      <div className="flex items-center justify-between bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/20 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/10">
        <div className="text-sm text-gray-700 dark:text-gray-300 font-arabic">
          <span className="font-semibold">عرض {questions.length}</span> من أصل <span className="font-semibold">{totalQuestions}</span> سؤال
        </div>
        { totalPages > 1 && (
          <div className="text-sm text-gray-600 dark:text-gray-400 font-arabic">
            الصفحة <span className="font-semibold">{currentPage }</span> من <span className="font-semibold">{totalPages}</span>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        { isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-sm p-8 border border-white/20 dark:border-white/10">
              <div className="flex items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
                <span className="text-lg font-arabic text-gray-700 dark:text-gray-300">جاري تحميل النتائج...</span>
              </div>
            </div>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto max-w-md">
              <div className="mx-auto h-32 w-32 rounded-full bg-gradient-to-br from-gray-400/20 to-gray-600/20 flex items-center justify-center mb-8 border border-gray-300/30 backdrop-blur-sm">
                <Search className="h-16 w-16 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-sm p-8 border border-white/20 dark:border-white/10">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white font-arabic mb-3">لا توجد أسئلة</h3>
                <p className="text-gray-600 dark:text-gray-400 font-arabic mb-6">لم يتم العثور على أسئلة تطابق المعايير المحددة.</p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearAllFilters }
                    className="font-arabic border-white/30 hover:bg-white/10 backdrop-blur-sm"
                  >
                    مسح الفلاتر
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Group questions by passage and render separately
          (() => { const passageQuestions = questions.filter(q => q.passage);
            const regularQuestions = questions.filter(q => !q.passage);
            const passageGroups = passageQuestions.reduce((acc, question) => {
              const passageId = question.passage!.id;
              if (!acc[passageId]) {
                acc[passageId] = {
                  passage: question.passage!,
                  questions: [] };
              }
              acc[passageId].questions.push(question);
              return acc;
            }, {} as Record<string, { passage: any; questions: Question[] }>);

            return (
              <>
                {/* Render Passage Groups */}
                {Object.values(passageGroups).map((group) => (
                  <PassageCard
                    key={group.passage.id}
                    passage={group.passage}
                    questionCount={group.questions.length}
                    onView={() => {
                      // Show first question from this passage
                      if (group.questions.length > 0) {
                        setSelectedQuestion(group.questions[0]);
                      }
                    }}
                  />
                ))}

                {/* Render Regular Questions */}
                {regularQuestions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    onView={() => setSelectedQuestion(question)}
                    onEdit={() => router.push(`/teacher/questions-bank/edit/${question.id}`)}
                    onDelete={() => handleDeleteQuestion(question.id)}
                  />
                ))}
              </>
            );
          })()
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !isLoading && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="font-arabic border-gray-300 hover:bg-gray-50"
          >
            <ChevronRight className="h-4 w-4" />
            السابق
          </Button>

          { Array.from({ length: Math.min(5, totalPages) }, (_, i) => { const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
            return (
              <Button
                key={page }
                variant={ page === currentPage ? 'default' : 'outline' }
                size="sm"
                onClick={() => goToPage(page)}
                className={ `min-w-[40px] ${page === currentPage ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300 hover:bg-gray-50' }`}
              >
                {page}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="font-arabic border-gray-300 hover:bg-gray-50"
          >
            التالي
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Enhanced Question Details Modal */}
      {selectedQuestion && (
        <AlertDialog open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
          <AlertDialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border border-white/20 dark:border-white/10">
            <AlertDialogHeader className="border-b border-white/20 dark:border-white/10 pb-4">
              <AlertDialogTitle className="font-arabic text-gray-900 dark:text-white text-xl">تفاصيل السؤال</AlertDialogTitle>
            </AlertDialogHeader>

            <div className="space-y-6 py-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="rounded-full bg-white/20 dark:bg-white/10 px-4 py-2 backdrop-blur-sm border border-white/30 dark:border-white/20">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 font-arabic">
                    {getTypeLabel(selectedQuestion.type)}
                  </span>
                </div>
                <div className={ `rounded-full px-4 py-2 backdrop-blur-sm border border-white/30 dark:border-white/20 ${getDifficultyColor(selectedQuestion.difficulty) }`}>
                  <span className="text-sm font-medium font-arabic">
                    {getDifficultyLabel(selectedQuestion.difficulty)}
                  </span>
                </div>
                <div className="rounded-full bg-blue-100/80 dark:bg-blue-900/50 px-4 py-2 backdrop-blur-sm border border-blue-200/50 dark:border-blue-400/30">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300 font-arabic">
                    {selectedQuestion.points} نقطة
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-arabic">
                  {selectedQuestion.createdAt.toLocaleDateString('ar-SA')}
                </div>
              </div>

              {/* Enhanced passage display in modal */}
              { selectedQuestion.passage && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="font-semibold font-arabic text-gray-900 dark:text-gray-100">القطعة المرجعية:</h3>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 p-6 backdrop-blur-sm border border-indigo-200/30 dark:border-indigo-400/20">
                    <h4 className="font-medium font-arabic mb-4 text-indigo-800 dark:text-indigo-300 text-lg">
                      {selectedQuestion.passage.title }
                    </h4>
                    <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-white/20 dark:border-gray-700/50 font-arabic text-sm leading-relaxed max-h-60 overflow-y-auto backdrop-blur-sm">
                      <MathRenderer content={selectedQuestion.passage.content} />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="font-semibold font-arabic text-gray-900 dark:text-gray-100">نص السؤال:</h3>
                <div className="rounded-lg bg-white/50 dark:bg-gray-800/50 p-4 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 font-arabic leading-relaxed">
                  <MathRenderer content={selectedQuestion.text} />
                </div>
              </div>

              { selectedQuestion.options && selectedQuestion.options.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold font-arabic text-gray-900 dark:text-gray-100">الخيارات:</h3>
                  <div className="space-y-3">
                    {selectedQuestion.options.map((option, index) => (
                      <div
                        key={option.id }
                        className={ `p-4 rounded-lg font-arabic transition-all duration-200 backdrop-blur-sm border ${
                          option.isCorrect
                            ? 'bg-green-500/20 border-green-300/40 text-green-800 dark:bg-green-400/20 dark:border-green-500/40 dark:text-green-200'
                            : 'bg-white/30 border-white/20 text-gray-700 dark:bg-gray-800/30 dark:border-gray-600/30 dark:text-gray-300' }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="font-semibold bg-white/40 dark:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center text-sm border border-white/30 dark:border-gray-600/30 backdrop-blur-sm">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <div className="flex-1 pt-1">
                            <MathRenderer content={option.text} />
                          </div>
                          { option.isCorrect && (
                            <div className="flex items-center gap-2">
                              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                              <span className="text-xs text-green-700 dark:text-green-300 font-arabic bg-green-100/80 dark:bg-green-900/50 px-2 py-1 rounded backdrop-blur-sm">
                                الإجابة الصحيحة
                              </span>
                            </div>
                          ) }
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-lg bg-white/30 dark:bg-gray-800/30 p-4 backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
                <div className="text-sm text-gray-600 dark:text-gray-400 font-arabic">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">الدورة:</span> {selectedQuestion.questionBank.course.title}
                    </div>
                    { selectedQuestion.questionBank.chapter && (
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">الفصل:</span> {selectedQuestion.questionBank.chapter.title }
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">تاريخ الإنشاء:</span> {selectedQuestion.createdAt.toLocaleDateString('ar-SA')}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">النوع:</span> {getTypeLabel(selectedQuestion.type)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <AlertDialogFooter className="border-t border-white/20 dark:border-white/10 pt-4">
              <AlertDialogCancel className="font-arabic border-white/30 dark:border-white/20 hover:bg-white/10 dark:hover:bg-white/5 backdrop-blur-sm">
                إغلاق
              </AlertDialogCancel>
              <Button
                onClick={() => {
                  setSelectedQuestion(null);
                  router.push(`/teacher/questions-bank/edit/${selectedQuestion.id}`);
                }}
                className="bg-blue-600/80 hover:bg-blue-700/80 backdrop-blur-sm font-arabic border border-blue-500/30"
              >
                <Edit className="mr-2 h-4 w-4" />
                تعديل السؤال
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};
