import { Bot } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const ConversationHeader = () => {
  return (
    <CardHeader className="pb-3 border-b">
      <CardTitle className="text-xl flex items-center gap-2 text-primary">
        <Bot className="h-6 w-6" />
        <span>المساعد التعليمي الذكي</span>
      </CardTitle>
      <CardDescription>
        اسأل عن دوراتك، اطلب شرحاً، أو احصل على مساعدة في المفاهيم.
      </CardDescription>
    </CardHeader>
  );
}; 