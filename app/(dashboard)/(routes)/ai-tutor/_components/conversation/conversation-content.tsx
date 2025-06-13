import { Loader2 } from 'lucide-react';
import { ChatMessage } from '../chat-message';
import { EmptyConversation } from './empty-conversation';
import { CardContent } from '@/components/ui/card';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ConversationContentProps {
  messages: Message[];
  thinking: boolean;
  streamingContent: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ConversationContent = ({
  messages,
  thinking,
  streamingContent,
  messagesEndRef,
}: ConversationContentProps) => {
  return (
    <CardContent className="h-full p-0">
      <div className="h-full overflow-y-auto">
        <div className="space-y-1 min-h-full">
          {messages.length === 0 ? (
            <EmptyConversation />
          ) : (
            <>
              {messages.map((message, index) => (
                <ChatMessage key={index} role={message.role} content={message.content} />
              ))}

              {/* Show thinking indicator */}
              {thinking && (
                <div className="flex justify-start p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              )}

              {/* Show streaming response */}
              {streamingContent && <ChatMessage role="assistant" content={streamingContent} />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </CardContent>
  );
};
