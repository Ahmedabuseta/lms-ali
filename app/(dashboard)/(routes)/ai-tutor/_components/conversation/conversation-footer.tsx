import { RefreshCw, Send, Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ConversationFooterProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onImageClick: () => void;
  hasMessages: boolean;
  onReset: () => void;
}

export const ConversationFooter = ({
  input,
  setInput,
  isLoading,
  onSubmit,
  onImageClick,
  hasMessages,
  onReset
}: ConversationFooterProps) => {
  return (
    <CardFooter className="p-3 sm:p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full">
        <form onSubmit={onSubmit} className="flex flex-col w-full gap-2">
          <div className="relative flex items-center">
            <Textarea 
              placeholder="اكتب سؤالك هنا..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 min-h-[48px] resize-none pr-24 pl-10 py-3 rounded-full"
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
            <div className="absolute left-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={onImageClick}
                    >
                      <Image className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Extract text from image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {/* Buttons - positioned at right */}
            <div className="absolute right-2 flex items-center gap-1">
              {hasMessages && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 rounded-full"
                        onClick={onReset}
                      >
                        <RefreshCw className="h-4 w-4" />
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
                        "h-7 w-7 rounded-full",
                        (isLoading || !input.trim()) && "opacity-50 cursor-not-allowed"
                      )}
                      disabled={isLoading || !input.trim()}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Send message</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            Press Enter to send, Shift+Enter for a new line
          </div>
        </form>
      </div>
    </CardFooter>
  );
} 