import { Bot } from 'lucide-react';

export const EmptyConversation = () => {
  return (
    <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-2 p-4 text-center">
      <Bot className="mb-4 h-12 w-12 text-muted-foreground" />
      <h3 className="text-xl font-semibold">كيف يمكنني مساعدتك اليوم؟</h3>
      <p className="max-w-md text-muted-foreground">
        اسألني عن أي موضوع من دوراتك. يمكنني شرح المفاهيم، المساعدة في حل المشكلات، أو تقديم موارد تعليمية إضافية.
      </p>
    </div>
  );
};
