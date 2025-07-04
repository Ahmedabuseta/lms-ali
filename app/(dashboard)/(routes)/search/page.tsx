import { redirect } from 'next/navigation';
import { Search, BookOpen, Filter } from 'lucide-react';
import { Suspense } from 'react';
import { PageProtection } from '@/components/page-protection';

import { Categories } from './_component/category';
import { db } from '@/lib/db';
import { SearchInput } from '@/components/search-input';
import { getCourses } from '@/actions/get-courses';
import CoursesList from '@/components/course-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth-helpers';

interface SearchPageProps { searchParams: {
    title: string;
    categoryId: string; };
}

const SearchPage = async ({ searchParams }: SearchPageProps) => { const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  const categories = await db.category.findMany({
    orderBy: {
      name: 'asc', },
  });

  const courses = await getCourses({ userId: user.id,
    ...searchParams, });

  return (
    <PageProtection requiredPermission="canAccessCourses">
      <div className="relative min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Removed heavy decorative elements for performance */}

        <div className="relative z-10 space-y-6 p-4 sm:space-y-8 sm:p-6">
          {/* Header Section */}
          <div className="relative overflow-hidden rounded-2xl bg-blue-600 p-6 text-white shadow-2xl sm:rounded-3xl sm:p-8">
            <div className="relative z-10">
              <h1 className="mb-2 flex items-center gap-3 text-2xl font-bold sm:text-3xl md:text-4xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 sm:h-12 sm:w-12">
                  <Search className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                </div>
                استكشف الدورات
              </h1>
              <p className="mb-4 text-base text-blue-100 sm:mb-6 sm:text-lg">
                اكتشف مجموعة واسعة من الدورات التعليمية المتخصصة
              </p>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="block md:hidden">
            <Card className="border-0 bg-white/80 shadow-lg dark:bg-gray-800/80">
              <CardContent className="p-3 sm:p-4">
                <Suspense fallback={<div className="h-10 w-full animate-pulse rounded-md bg-gray-200" />}> 
                  <SearchInput />
                </Suspense>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <Card className="border-0 bg-white/80 shadow-lg dark:bg-gray-800/80">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-blue-700 dark:text-blue-300 sm:text-2xl">
                <BookOpen className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" />
                نتائج البحث ({courses.length} دورة)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {courses.length > 0 ? (
                <CoursesList items={courses} />
              ) : (
                <div className="py-8 text-center sm:py-12">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500 sm:h-24 sm:w-24">
                    <Search className="h-10 w-10 text-white sm:h-12 sm:w-12" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-gray-700 dark:text-gray-300 sm:text-xl">لم يتم العثور على دورات</h3>
                  <p className="mx-auto max-w-md text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                    جرب تغيير مصطلحات البحث أو تصفح فئات مختلفة للعثور على الدورة المناسبة لك
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageProtection>
  );
};

export default SearchPage;
