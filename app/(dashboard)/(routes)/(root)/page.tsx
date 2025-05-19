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

  // Mock data for the learning insights component
  const mockRecentActivity = [
    { type: 'course', title: 'Introduction to Machine Learning', date: '2 hours ago', progress: 45 },
    { type: 'exam', title: 'React Fundamentals Quiz', date: 'Yesterday', progress: 100 },
    { type: 'completion', title: 'JavaScript Basics', date: '3 days ago' },
    { type: 'course', title: 'Advanced CSS Techniques', date: 'Last week', progress: 68 }
  ];

  const mockRecommendedCourses = [
    { id: '1', title: 'Data Science Fundamentals', category: 'Data Science' },
    { id: '2', title: 'Advanced React Patterns', category: 'Web Development' },
    { id: '3', title: 'UX Design Principles', category: 'Design' },
    { id: '4', title: 'Blockchain Development', category: 'Blockchain' }
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
        recommendedCourses={mockRecommendedCourses}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoCard icon={Clock} label="In Progress" numberOfItems={coursesInProgress.length} />
        <InfoCard icon={CheckCircle} label="Completed" numberOfItems={completedCourses.length} variant="success" />
      </div>
      <CoursesList items={[...coursesInProgress, ...completedCourses]} />
    </div>
  )
}
