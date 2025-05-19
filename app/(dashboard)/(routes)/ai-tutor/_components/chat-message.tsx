import { Bot, User } from 'lucide-react';
import { MDXRenderer } from '@/components/mdx-renderer';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  return (
    <div className={cn(
      "group relative flex items-start gap-3 p-4",
      role === 'assistant' ? "bg-muted/30" : "bg-background"
    )}>
      <div className={cn(
        "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full",
        role === 'assistant' ? "bg-primary/10" : "bg-muted"
      )}>
        {role === 'assistant' ? (
          <Bot className="h-5 w-5 text-primary" />
        ) : (
          <User className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          {role === 'assistant' ? (
            <div dir="auto" className="bidi-auto" style={{ unicodeBidi: 'isolate-override' }}>
              <MDXRenderer content={content} />
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-sm">{content}</p>
          )}
        </div>
      </div>
    </div>
  );
}; 