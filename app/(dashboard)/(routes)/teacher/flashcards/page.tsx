import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'

import { FlashcardsClient } from './_components/flashcards-client'

const TeacherFlashcardsPage = async () => {
  const { userId } = auth()

  if (!userId) {
    return redirect('/')
  }

  // Fetch courses created by the teacher
  const courses = await db.course.findMany({
    where: {
      // //createdById: userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="p-6">
      <FlashcardsClient courses={courses} />
    </div>
  )
}

export default TeacherFlashcardsPage
