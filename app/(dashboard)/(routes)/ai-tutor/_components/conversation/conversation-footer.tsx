import { RefreshCw, Send, Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ConversationFooterProps { input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onImageClick: () => void;
  hasMessages: boolean;
  onReset: () => void; }

export const ConversationFooter = ({
  input,
  setInput,
  isLoading,
  onSubmit,
  onImageClick,
  hasMessages,
  onReset,
}: ConversationFooterProps) => {
  return (
    <CardFooter className="p-3 sm:p-4 lg:p-6">
      <div className="w-full">
        <form onSubmit={onSubmit} className="flex w-full flex-col gap-2 sm:gap-3">
          <div className="relative flex items-center">
            <Textarea
              placeholder="اكتب سؤالك هنا..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[48px] sm:min-h-[52px] flex-1 resize-none rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-10 sm:pl-12 pr-20 sm:pr-24 text-sm sm:text-base border-2 border-white/30 bg-white/50 backdrop-blur-lg shadow-lg focus:border-blue-400/50 focus:bg-white/70 dark:border-gray-600/30 dark:bg-gray-800/50 dark:focus:border-blue-500/50 dark:focus:bg-gray-800/70 transition-all duration-300"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim() && !isLoading) {
                    onSubmit(e);
                  }
                }
              }}
            />

            {/* Image button - positioned at left */}
            <div className="absolute left-2 sm:left-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-white/60 hover:bg-white/80 border border-gray-200/50 shadow-md backdrop-blur-sm transition-all duration-300 dark:bg-gray-700/60 dark:hover:bg-gray-700/80 dark:border-gray-600/50"
                      onClick={onImageClick}
                    >
                      <Image className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-300" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Extract text from image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Buttons - positioned at right */}
            <div className="absolute right-2 sm:right-3 flex items-center gap-1 sm:gap-2">
              {hasMessages && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-white/60 hover:bg-white/80 border border-gray-200/50 shadow-md backdrop-blur-sm transition-all duration-300 dark:bg-gray-700/60 dark:hover:bg-gray-700/80 dark:border-gray-600/50"
                        onClick={onReset}
                      >
                        <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-300" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Reset conversation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="submit"
                      size="icon"
                      className={cn(
                        'h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border border-blue-400/50 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:from-blue-600 dark:to-indigo-700 dark:hover:from-blue-700 dark:hover:to-indigo-800',
                        (isLoading || !input.trim()) && 'cursor-not-allowed opacity-50'
                      )}
                      disabled={isLoading || !input.trim()}
                    >
                      {isLoading ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> : <Send className="h-3 w-3 sm:h-4 sm:w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Send message</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500 dark:text-gray-400 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 border border-white/20 dark:border-gray-600/20">
            <span className="hidden sm:inline">Press Enter to send, Shift+Enter for a new line</span>
            <span className="sm:hidden">Enter to send, Shift+Enter for new line</span>
          </div>
        </form>
      </div>
    </CardFooter>
  );
};
