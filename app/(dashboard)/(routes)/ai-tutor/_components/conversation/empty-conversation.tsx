import { Bot } from 'lucide-react';

export const EmptyConversation = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-2 text-center p-4">
      <Bot className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="font-semibold text-xl">كيف يمكنني مساعدتك اليوم؟</h3>
      <p className="text-muted-foreground max-w-md">
        اسألني عن أي موضوع من دوراتك. يمكنني شرح المفاهيم، المساعدة في حل المشكلات، أو تقديم موارد تعليمية إضافية.
      </p>
    </div>
  );
} 