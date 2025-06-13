'use client';

import { Brain, MessageCircle, Sparkles } from 'lucide-react';
import { AITutorClient } from './_components/ai-tutor-client';
import { PageProtection } from '@/components/page-protection';

const AITutorPage = () => {
  return (
    <PageProtection 
      requiredPermission="canAccessAI"
      customMessage={{
        title: 'المدرس الذكي غير متاح',
        description: 'تحتاج إلى اشتراك كامل للوصول إلى المدرس الذكي والاستفادة من الذكاء الاصطناعي في التعلم.',
        icon: Brain,
      }}
    >
      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/40 via-white to-indigo-50/60 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="relative z-10 space-y-6 p-4 sm:space-y-8 sm:p-6">
          {/* AI Tutor Component */}
          <div className="">
            <AITutorClient />
          </div>
        </div>
      </div>
    </PageProtection>
  );
};

export default AITutorPage;
