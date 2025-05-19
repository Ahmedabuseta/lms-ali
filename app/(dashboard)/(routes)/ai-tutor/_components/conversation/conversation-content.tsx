import { Loader2 } from 'lucide-react';
import { CardContent } from '@/components/ui/card';
import { ChatMessage } from '../chat-message';
import { EmptyConversation } from './empty-conversation';

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
    <CardContent className="flex-grow overflow-y-auto p-0">
      <div className="space-y-1">
        {messages.length === 0 ? (
          <EmptyConversation />
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role}
                content={message.content}
              />
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
            {streamingContent && (
              <ChatMessage
                role="assistant"
                content={streamingContent}
              />
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
    </CardContent>
  );
}; 