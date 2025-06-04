'use client';

import Link from 'next/link';
import { FileQuestion, Plus, BookOpen, Target, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const QuestionsEmptyState = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-12 text-center shadow-lg dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25"></div>
      <div className="absolute left-8 top-8 h-20 w-20 rounded-full bg-gradient-to-br from-blue-200/40 to-indigo-300/30 blur-2xl"></div>
      <div className="absolute right-8 bottom-8 h-16 w-16 rounded-full bg-gradient-to-br from-purple-200/40 to-pink-300/30 blur-2xl"></div>
      
      <div className="relative space-y-6">
        {/* Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
          <FileQuestion className="h-10 w-10 text-white" />
        </div>
        
        {/* Main content */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-arabic">لا توجد أسئلة بعد</h3>
          <p className="mx-auto max-w-md text-gray-600 dark:text-gray-300 font-arabic leading-relaxed">
            ابدأ في بناء بنك الأسئلة الخاص بك عن طريق إضافة أسئلة تفاعلية ومتنوعة للطلاب
          </p>
        </div>
        
        {/* Features */}
        <div className="mx-auto grid max-w-md grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <BookOpen className="h-4 w-4 text-blue-500" />
            <span className="font-arabic">أسئلة متنوعة</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Target className="h-4 w-4 text-purple-500" />
            <span className="font-arabic">تقييم دقيق</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <span className="font-arabic">سهولة الإدارة</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <FileQuestion className="h-4 w-4 text-orange-500" />
            <span className="font-arabic">بنك شامل</span>
          </div>
        </div>
        
        {/* Action button */}
        <Button 
          className="transform bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl font-arabic" 
          size="lg"
          asChild
        >
          <Link href="/teacher/questions-bank/create">
            <Plus className="ml-2 h-5 w-5" />
            إنشاء أول سؤال
          </Link>
        </Button>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 font-arabic">
          يمكنك إضافة أسئلة متعددة الخيارات، أسئلة مقالية، وأكثر
        </p>
      </div>
    </div>
  );
};
