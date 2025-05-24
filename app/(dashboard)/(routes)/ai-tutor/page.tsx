import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { Brain, MessageCircle, Sparkles } from 'lucide-react';
import { AITutorClient } from './_components/ai-tutor-client';

const AITutorPage = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect('/');
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/40 via-white to-indigo-50/60 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Enhanced light mode decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="to-indigo-300/15 absolute right-16 top-20 h-52 w-52 animate-pulse rounded-full bg-gradient-to-br from-purple-200/20 blur-3xl"></div>
        <div className="to-blue-300/15 animation-delay-2000 absolute bottom-1/4 left-16 h-60 w-60 animate-pulse rounded-full bg-gradient-to-br from-indigo-200/20 blur-3xl"></div>
        <div className="to-purple-300/15 animation-delay-4000 absolute left-1/4 top-1/3 h-36 w-36 animate-pulse rounded-full bg-gradient-to-br from-blue-200/20 blur-3xl"></div>
      </div>

      <div className="relative z-10 space-y-8 p-6">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-8 text-white shadow-2xl">
          <div className="relative z-10">
            <h1 className="animate-slide-up mb-2 flex items-center gap-3 text-3xl font-bold md:text-4xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Brain className="h-6 w-6 text-white" />
              </div>
              المدرس الذكي
            </h1>
            <p className="animate-slide-up animation-delay-200 mb-6 text-lg text-blue-100">
              احصل على مساعدة فورية ودعم شخصي في رحلة التعلم الخاصة بك
            </p>
          </div>

          {/* Floating Elements */}
          <div className="animate-float absolute right-4 top-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <div className="animate-float animation-delay-1000 absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* AI Tutor Component */}
        <div className="transform transition-all duration-300 hover:scale-[1.01]">
          <AITutorClient />
        </div>
      </div>
    </div>
  );
};

export default AITutorPage;
