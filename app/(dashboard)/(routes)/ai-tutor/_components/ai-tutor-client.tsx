'use client';

import { useState, useRef, useEffect } from 'react';
import { Message } from './utils/chat-utils';
import { ConversationHeader } from './conversation/conversation-header';
import { ConversationContent } from './conversation/conversation-content';
import { ConversationFooter } from './conversation/conversation-footer';
import { useChatApi } from './api/use-chat-api';
import { useImageProcessor } from './api/use-image-processor';
import { ImageUploadDialog } from './image-upload-dialog';
import { showNotification } from '@/components/ui/notifications';
import { Card } from '@/components/ui/card';

export const AITutorClient = () => { // Message state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use custom hooks
  const { isLoading, thinking, streamingContent, connectionError, sendMessage, abortRequest } = useChatApi();

  const { imagePreview,
    extractedText,
    isProcessingImage,
    progress,
    imageError,
    useClientSideOCR,
    setUseClientSideOCR,
    processImage,
    resetImageProcessing,
    setExtractedText, } = useImageProcessor();

  // Image dialog state
  const [imageProcessingOpen, setImageProcessingOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Clean up any active request on unmount
  useEffect(() => {
    return () => {
      abortRequest();
    };
  }, [abortRequest]);

  // Handle reset conversation button click
  const handleReset = () => { abortRequest();
    setMessages([]);
    showNotification.info('Conversation reset', 'Started a new chat session'); };

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

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault();

    if (!input.trim() || isLoading) return;

    // Add user message to the conversation
    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');

    // Send message to API
    const result = await sendMessage(messages, userMessage);

    if (result.success) { // Add assistant response to messages
      setMessages((prev) => [...prev, { role: 'assistant', content: result.text }]);
    }
  };

  // Prevent hydration issues by not rendering until mounted
  if (!isMounted) { return (
      <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900">
        <div className="h-full max-w-4xl mx-auto p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading AI Tutor...</p>
          </div>
        </div>
      </div>
    ); }

  return (
    // <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900">
      <div className="h-full max-w-4xl mx-auto md:p-4">
        <Card className="flex flex-col h-full border border-white/20 shadow-xl backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-2xl overflow-hidden">
          {/* Header with enhanced styling */}
          <div className="shrink-0 border-b border-white/20 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-400/10 dark:to-indigo-400/10">
            <ConversationHeader />
          </div>

          {/* Scrollable content area with custom styling */}
          <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent dark:via-gray-800/30 pointer-events-none"></div>
            <div className="flex-1 overflow-y-auto">
              <ConversationContent
                messages={messages}
                thinking={thinking}
                streamingContent={streamingContent}
                messagesEndRef={messagesEndRef}
              />
            </div>
          </div>

          {/* Enhanced input footer */}
          <div className="shrink-0 border-t border-white/20 bg-gradient-to-r from-white/70 via-white/80 to-white/70 dark:from-gray-800/70 dark:via-gray-800/80 dark:to-gray-800/70 backdrop-blur-md">
            <div className="relative">
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/10 to-purple-500/5 dark:from-blue-400/5 dark:via-indigo-400/10 dark:to-purple-400/5"></div>
              <ConversationFooter
                input={input}
                setInput={setInput}
                isLoading={isLoading}
                onSubmit={handleSubmit}
                onImageClick={() => setImageProcessingOpen(true)}
                hasMessages={messages.length > 0}
                onReset={handleReset}
              />
            </div>
          </div>
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
    // {/* </div> */}
  );
};
