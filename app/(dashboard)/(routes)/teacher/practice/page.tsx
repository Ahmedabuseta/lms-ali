import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs';
import { isTeacher } from '@/lib/teacher';

export default function PracticePage() {
  const { userId } = auth();

  if (!userId || !isTeacher(userId)) {
    return redirect('/');
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-medium">Practice Questions</h1>
      <p className="text-slate-600">Manage practice questions for your courses.</p>
    </div>
  );
}
