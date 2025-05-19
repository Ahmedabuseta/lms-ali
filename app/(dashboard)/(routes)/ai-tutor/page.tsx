import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { AITutorClient } from './_components/ai-tutor-client';
// import { AITutorImageClient } from './_components/ai-tutor--client';

const AITutorPage = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 h-full">
     
      
      <AITutorClient />
    </div>
  );
};

export default AITutorPage;