import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { CheckCircle, Clock } from 'lucide-react'
import CoursesList from '@/components/course-list'
import { getDashboardCourses } from '@/actions/get-dashboard-courses'
import { InfoCard } from './_components/info-card'
import { LearningInsights } from './_components/learning-insights'

export default async function Dashboard() {
  const { userId } = auth()

  if (!userId) {
    return redirect('/')
  }

  const { completedCourses, coursesInProgress } = await getDashboardCourses(userId)

  // Add chaptersLength property to each course
  const coursesWithChaptersLength = [...coursesInProgress, ...completedCourses].map(course => ({
    ...course,
    chaptersLength: course.chapters.length
  }));

  // Mock data for the learning insights component
  const mockRecentActivity = [
    { type: 'course', title: 'مقدمة في تعلم الآلة', date: 'قبل ساعتين', progress: 45 },
    { type: 'exam', title: 'اختبار أساسيات رياكت', date: 'أمس', progress: 100 },
    { type: 'completion', title: 'أساسيات جافاسكريبت', date: 'قبل 3 أيام' },
    { type: 'course', title: 'تقنيات CSS متقدمة', date: 'الأسبوع الماضي', progress: 68 }
  ];

  // Calculate total hours based on courses (mock data since we don't have actual hours)
  const totalHours = completedCourses.length * 5 + coursesInProgress.length * 2;

  return (
    <div className="space-y-6 p-6">
      <LearningInsights 
        totalCourses={completedCourses.length + coursesInProgress.length}
        completedCourses={completedCourses.length}
        totalHours={totalHours}
        studyStreak={7}
        recentActivity={mockRecentActivity}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoCard icon={Clock} label="قيد التقدم" numberOfItems={coursesInProgress.length} />
        <InfoCard icon={CheckCircle} label="مكتمل" numberOfItems={completedCourses.length} variant="success" />
      </div>
      <CoursesList items={coursesWithChaptersLength} />
    </div>
  )
}
