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
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        {/* Enhanced decorative elements matching theme */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute right-10 top-20 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/5 blur-3xl dark:from-purple-400/10 dark:to-pink-400/5" />
          <div
            className="absolute bottom-1/4 left-20 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/5 blur-3xl dark:from-blue-400/10 dark:to-indigo-400/5"
            style={{ animationDelay: '2s' }}
          />
          <div
            className="absolute right-1/3 top-1/2 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-500/5 blur-3xl dark:from-emerald-400/10 dark:to-teal-400/5"
            style={{ animationDelay: '4s' }}
          />
        </div>

        <div className="relative z-10 space-y-6 p-2 sm:space-y-8 sm:p-6">
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
