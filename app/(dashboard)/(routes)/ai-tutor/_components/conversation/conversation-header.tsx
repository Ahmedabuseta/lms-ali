import { Bot } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const ConversationHeader = () => {
  return (
    <CardHeader className="border-b pb-3">
      <CardTitle className="flex items-center gap-2 text-xl text-primary">
        <Bot className="h-6 w-6" />
        <span>المساعد التعليمي الذكي</span>
      </CardTitle>
      <CardDescription>اسأل عن دوراتك، اطلب شرحاً، أو احصل على مساعدة في المفاهيم.</CardDescription>
    </CardHeader>
  );
};
