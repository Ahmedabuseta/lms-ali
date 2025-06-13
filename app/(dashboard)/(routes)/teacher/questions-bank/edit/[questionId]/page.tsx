import { requireAuth } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { EditQuestionForm } from './_components/edit-question-form';

interface EditQuestionPageProps {
  params: {
    questionId: string;
  };
}

const EditQuestionPage = async ({ params }: EditQuestionPageProps) => {
  await requireAuth();

  const question = await db.question.findUnique({
    where: {
      id: params.questionId,
    },
    include: {
      options: true,
      questionBank: {
        include: {
          course: true,
          chapter: true,
        },
      },
      passage: true,
    },
  });

  if (!question) {
    redirect('/teacher/questions-bank');
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-arabic">
          تعديل السؤال
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300 font-arabic">
          قم بتعديل السؤال والخيارات المرتبطة به
        </p>
      </div>

      <EditQuestionForm 
        question={{
          ...question,
          questionBank: {
            ...question.questionBank,
            chapter: question.questionBank.chapter 
              ? { id: question.questionBank.chapter.id, title: question.questionBank.chapter.title }
              : undefined
          },
          passage: question.passage 
            ? { id: question.passage.id, title: question.passage.title, content: question.passage.content }
            : undefined
        }} 
      />
    </div>
  );
};

export default EditQuestionPage; 