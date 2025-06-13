import { Bot, Sparkles } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const ConversationHeader = () => {
  return (
    <CardHeader className="relative pb-4 pt-6">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute top-2 right-4 h-1 w-1 rounded-full bg-blue-400 animate-pulse"></div>
        <div className="absolute top-4 right-8 h-0.5 w-0.5 rounded-full bg-indigo-400 animate-ping"></div>
        <div className="absolute top-3 right-12 h-0.5 w-0.5 rounded-full bg-purple-400 animate-pulse delay-1000"></div>
      </div>
      
      <CardTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
        <div className="relative">
          <Bot className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-indigo-500 animate-pulse" />
        </div>
        <span className="font-arabic">المساعد التعليمي الذكي</span>
      </CardTitle>
      
      <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
        اسأل عن دوراتك، اطلب شرحاً، أو احصل على مساعدة في المفاهيم. أنا هنا لمساعدتك على التعلم بأفضل طريقة ممكنة.
      </CardDescription>
    </CardHeader>
  );
};
