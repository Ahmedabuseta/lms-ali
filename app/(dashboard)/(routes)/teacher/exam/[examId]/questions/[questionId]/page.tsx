import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { ArrowLeft } from 'lucide-react'
import { QuestionForm } from '../../_components/question-form'

interface PageProps {
  params: {
    examId: string
    questionId: string
  }
}

export default async function EditQuestionPage({ params }: PageProps) {
  const { userId } = auth()
  
  if (!userId) {
    return redirect('/')
  }

  const question = await db.question.findUnique({
    where: {
      id: params.questionId,
      examId: params.examId,
    },
    include: {
      exam: {
        include: {
          course: {
            select: {
              //createdById: true,
            }
          }
        }
      },
      options: {
        orderBy: {
          position: 'asc',
        }
      }
    }
  })

  if (!question) {
    return redirect(`/teacher/exam/${params.examId}/questions`)
  }

  // Verify ownership
  if (question.exam.course.//createdById !== userId) {
    return redirect('/teacher/exam')
  }

  // Don't allow editing questions of published exams
  if (question.exam.isPublished) {
    return redirect(`/teacher/exam/${params.examId}/questions`)
  }

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
                Edit Question
              </h1>
              <span className="text-sm text-slate-600">
                Modify this question and its options
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 max-w-2xl">
        <QuestionForm 
          initialData={question}
          examId={params.examId} 
        />
      </div>
    </div>
  )
}