'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Message } from './utils/chat-utils';
import { showNotification } from '@/components/ui/notifications';
import { ConversationHeader } from './conversation/conversation-header';
import { ConversationContent } from './conversation/conversation-content';
import { ConversationFooter } from './conversation/conversation-footer';
import { useChatApi } from './api/use-chat-api';
import { useImageProcessor } from './api/use-image-processor';
import { ImageUploadDialog } from './image-upload-dialog';

export const AITutorClient = () => {
  // Message state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use custom hooks
  const {
    isLoading,
    thinking,
    streamingContent,
    connectionError,
    sendMessage,
    abortRequest
  } = useChatApi();
  
  const {
    imagePreview,
    extractedText,
    isProcessingImage,
    progress,
    imageError,
    useClientSideOCR,
    setUseClientSideOCR,
    processImage,
    resetImageProcessing,
    setExtractedText
  } = useImageProcessor();
  
  // Image dialog state
  const [imageProcessingOpen, setImageProcessingOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Clean up any active request on unmount
  useEffect(() => {
    return () => {
      abortRequest();
    };
  }, [abortRequest]);

  // Handle reset conversation button click
  const handleReset = () => {
    abortRequest();
    setMessages([]);
    showNotification.info('Conversation reset', 'Started a new chat session');
  };

  // Add extracted text to chat input
  const addExtractedTextToInput = () => {
    if (extractedText) {
      setInput((prevInput) => {
        const newInput = prevInput ? `${prevInput}\n\n${extractedText}` : extractedText;
        return newInput;
      });
      setImageProcessingOpen(false);
      resetImageProcessing();
      showNotification.success('Text added to chat input');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Add user message to the conversation
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    
    // Send message to API
    const result = await sendMessage(messages, userMessage);
    
    if (result.success) {
        // Add assistant response to messages
      setMessages(prev => [...prev, { role: 'assistant', content: result.text }]);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col border-none shadow-none">
        <ConversationHeader />
        
        <ConversationContent
          messages={messages}
          thinking={thinking}
          streamingContent={streamingContent}
          messagesEndRef={messagesEndRef}
        />
        
        <ConversationFooter
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onImageClick={() => setImageProcessingOpen(true)}
          hasMessages={messages.length > 0}
          onReset={handleReset}
        />
      </Card>

      {/* Image Processing Dialog */}
      <ImageUploadDialog
        open={imageProcessingOpen}
        onOpenChange={setImageProcessingOpen}
        onTextExtracted={(text) => {
          setInput((prevInput) => {
            return prevInput ? `${prevInput}\n\n${text}` : text;
          });
        }}
      />
    </div>
  );
};