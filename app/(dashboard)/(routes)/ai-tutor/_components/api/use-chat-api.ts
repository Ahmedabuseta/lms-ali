import { useState, useRef, useCallback } from 'react';
import { Message } from '../utils/chat-utils';

export const useChatApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [connectionError, setConnectionError] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (messages: Message[], userMessage: string) => {
    try {
      // Reset states
      setConnectionError(false);

      // Cancel any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create a new controller for this request
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setThinking(true);
      setStreamingContent('');

      // Simple delay to indicate "thinking" state
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Call our server-side API which handles communication with the AI service
      const response = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          streaming: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      // Handle errors
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      setThinking(false);

      // Get stream reader
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let fullText = '';
      const decoder = new TextDecoder();

      // Process the stream
      while (true) {
        // Check if the request was aborted
        if (abortControllerRef.current.signal.aborted) {
          break;
        }

        const { done, value } = await reader.read();
        if (done) break;

        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });

        // Process SSE format (data: {...})
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.choices?.[0]?.delta?.content) {
                const content = data.choices[0].delta.content;
                fullText += content;
                setStreamingContent((prev) => prev + content);
              }
            } catch (e) {
              console.error('Error parsing SSE chunk:', e);
            }
          }
        }
      }

      // Reset states
      setIsLoading(false);
      setStreamingContent('');

      // Return the full message
      return {
        success: true,
        text: fullText,
      };
    } catch (error) {
      console.error('Chat API error:', error);

      // Don't show error if it was an abort
      if ((error as Error).name !== 'AbortError') {
        setConnectionError(true);
      }

      setIsLoading(false);
      setThinking(false);
      setStreamingContent('');

      return {
        success: false,
        text: '',
      };
    }
  }, []);

  // Function to abort the current request
  const abortRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    isLoading,
    thinking,
    streamingContent,
    connectionError,
    sendMessage,
    abortRequest,
  };
};
