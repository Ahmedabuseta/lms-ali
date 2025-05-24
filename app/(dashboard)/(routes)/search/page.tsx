import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { Search, BookOpen, Filter } from 'lucide-react';

import { db } from '@/lib/db';
import { Categories } from './_component/category';
import { SearchInput } from '@/components/search-input';
import { getCourses } from '@/actions/get-courses';
import CoursesList from '@/components/course-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SearchPageProps {
  searchParams: {
    title: string;
    categoryId: string;
  };
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const { userId } = auth();

  if (!userId) {
    return redirect('/');
  }

  const categories = await db.category.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  const courses = await getCourses({
    userId,
    ...searchParams,
  });

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 via-white to-indigo-50/60 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Enhanced light mode decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="to-indigo-300/15 absolute left-10 top-16 h-56 w-56 animate-pulse rounded-full bg-gradient-to-br from-blue-200/20 blur-3xl"></div>
        <div className="to-indigo-300/15 animation-delay-2000 absolute bottom-1/3 right-20 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-purple-200/20 blur-3xl"></div>
        <div className="to-blue-300/15 animation-delay-4000 absolute left-1/3 top-1/2 h-40 w-40 animate-pulse rounded-full bg-gradient-to-br from-indigo-200/20 blur-3xl"></div>
      </div>

      <div className="relative z-10 space-y-8 p-6">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white shadow-2xl">
          <div className="relative z-10">
            <h1 className="animate-slide-up mb-2 flex items-center gap-3 text-3xl font-bold md:text-4xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Search className="h-6 w-6 text-white" />
              </div>
              استكشف الدورات
            </h1>
            <p className="animate-slide-up animation-delay-200 mb-6 text-lg text-blue-100">
              اكتشف مجموعة واسعة من الدورات التعليمية المتخصصة
            </p>
          </div>

          {/* Floating Elements */}
          <div className="animate-float absolute right-4 top-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <div className="animate-float animation-delay-1000 absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <Filter className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Mobile Search */}
        <div className="block md:hidden">
          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
            <CardContent className="p-4">
              <SearchInput />
            </CardContent>
          </Card>
        </div>

        {/* Categories Section */}
        {/* <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <Filter className="w-6 h-6 text-blue-600" />
              تصفية حسب الفئة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Categories items={categories} />
          </CardContent>
        </Card> */}

        {/* Results Section */}
        <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
              <BookOpen className="h-6 w-6 text-blue-600" />
              نتائج البحث ({courses.length} دورة)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {courses.length > 0 ? (
              <CoursesList items={courses} />
            ) : (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                  <Search className="h-12 w-12 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-700 dark:text-gray-300">لم يتم العثور على دورات</h3>
                <p className="mx-auto max-w-md text-gray-600 dark:text-gray-400">
                  جرب تغيير مصطلحات البحث أو تصفح فئات مختلفة للعثور على الدورة المناسبة لك
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SearchPage;
