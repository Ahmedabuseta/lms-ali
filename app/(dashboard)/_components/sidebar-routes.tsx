'use client'

import { BarChart, Bot, Compass, Dumbbell, FileQuestion, Layout, List, MemoryStick, Globe, ScanText } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { SidebarItem } from './sidebar-item'

const guestRoutes = [
  {
    icon: Layout,
    label: 'Dashboard',
    href: '/',
  },
  {
    icon: Compass,
    label: 'Browse',
    href: '/search',
  },
  {
    icon: FileQuestion,
    label: 'Exam',
    href: '/exam',
  },
  {
    icon: MemoryStick,
    label: 'Flashcards',
    href: '/flashcards',
  },
  {
    icon: Dumbbell,
    label: 'Practice',
    href: '/practice',
  },
  {
    icon: Bot,
    label: 'AI Tutor',
    href: '/ai-tutor',
  },
  // {
  //   icon: ScanText,
  //   label: 'Image to Text',
  //   href: '/image-to-text',
  // },
 
]

const teacherRoutes = [
  {
    icon: List,
    label: 'Courses',
    href: '/teacher/courses',
  },
  {
    icon: BarChart,
    label: 'Analytics',
    href: '/teacher/analytics',
  },
  {
    icon: FileQuestion,
    label: 'Exam',
    href: '/teacher/exam',
  },
  {
    icon: MemoryStick,
    label: 'Flashcards',
    href: '/teacher/flashcards',
  },
  {
    icon: Dumbbell,
    label: 'Practice',
    href: '/teacher/questions-bank',
  },
]

export const SidebarRoutes = () => {
  const pathname = usePathname()

  const isTeacherPage = pathname?.startsWith('/teacher')

  const routes = isTeacherPage ? teacherRoutes : guestRoutes
  return (
    <div className="flex w-full flex-col">
      {routes.map((route) => (
        <SidebarItem 
          key={route.href} 
          icon={route.icon} 
          label={route.label} 
          href={route.href} 
        />
      ))}
    </div>
  )
}
