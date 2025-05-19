import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { ArrowLeft } from 'lucide-react'
import { QuestionForm } from '../_components/question-form'

interface PageProps {
  params: {
    examId: string
  }
}

export default async function CreateQuestionPage({ params }: PageProps) {
  const { userId } = auth()
  
  if (!userId) {
    return redirect('/')
  }

  const exam = await db.exam.findUnique({
    where: {
      id: params.examId,
    },
    include: {
      course: {
        select: {
          //createdById: true,
        }
      }
    }
  })

  if (!exam) {
    return redirect('/teacher/exam')
  }

  // Verify ownership
  if (exam.course.//createdById !== userId) {
    return redirect('/teacher/exam')
  }

  // Don't allow adding questions to published exams
  if (exam.isPublished) {
    return redirect(`/teacher/exam/${params.examId}/questions`)
  }

  // Get the current highest position
  const questionsCount = await db.question.count({
    where: {
      examId: params.examId,
    }
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="w-full">
          <Link
            href={`/teacher/exam/${params.examId}/questions`}
            className="flex items-center text-sm hover:opacity-75 transition mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to questions
          </Link>
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col gap-y-2">
              <h1 className="text-2xl font-bold">
                Add Question
              </h1>
              <span className="text-sm text-slate-600">
                Create a new question for this exam
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 max-w-2xl">
        <QuestionForm 
          examId={params.examId} 
          nextPosition={questionsCount + 1}
        />
      </div>
    </div>
  )
}