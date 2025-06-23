import { Bot, User } from 'lucide-react';
import { MDXRenderer } from '@/components/mdx-renderer';
import { cn } from '@/lib/utils';

interface ChatMessageProps { role: 'user' | 'assistant';
  content: string; }

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        'group relative flex items-start gap-2 sm:gap-3 lg:gap-4 p-3 sm:p-4 mx-1 sm:mx-2 my-1 rounded-xl sm:rounded-2xl transition-all duration-300',
        role === 'assistant'
          ? 'bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border border-blue-100/50 dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-blue-800/30'
          : 'bg-gradient-to-br from-gray-50/80 to-slate-50/80 border border-gray-100/50 dark:from-gray-800/30 dark:to-slate-800/30 dark:border-gray-700/30 ml-4 sm:ml-6 lg:ml-8',
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 shrink-0 select-none items-center justify-center rounded-full border-2 shadow-lg transition-all duration-300',
          role === 'assistant'
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-300 text-white dark:from-blue-600 dark:to-indigo-700 dark:border-blue-400'
            : 'bg-gradient-to-br from-gray-500 to-slate-600 border-gray-300 text-white dark:from-gray-600 dark:to-slate-700 dark:border-gray-400',
        )}
      >
        {role === 'assistant' ? (
          <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          <User className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-hidden min-w-0">
        <div className="prose prose-neutral dark:prose-invert max-w-none text-sm sm:text-base">
          {role === 'assistant' ? (
            <div dir="auto" className="bidi-auto text-gray-800 dark:text-gray-200" style={{ unicodeBidi: 'isolate-override' }}>
              <MDXRenderer content={content} />
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed break-words">{content}</p>
          )}
        </div>
      </div>

      {/* Subtle hover effect */}
      <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};
