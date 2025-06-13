import { NextResponse } from 'next/server';
import { getUserPermissions } from '@/lib/user';
import { requireAuth } from '@/lib/api-auth';

// Define the format for messages
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Image data interface
interface ImageData {
  base64: string;
  dimensions: {
    width: number;
    height: number;
  };
}

// Set timeout configuration
const FETCH_TIMEOUT_MS = 30000; // 30 seconds timeout
const API_RETRY_ATTEMPTS = 2; // Number of retry attempts

// Custom fetch with timeout and retry logic
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number, retryAttempts: number) {
  // Create an AbortController to handle timeouts
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    try {
      controller.abort();
    } catch (e) {
      console.error('Error aborting controller:', e);
    }
  }, timeoutMs);

  // Safely merge the provided signal with our timeout signal
  const originalSignal = options.signal;

  // Create a new options object with our controller's signal
  const newOptions = { ...options };
  newOptions.signal = controller.signal;

  // If there's an original signal, listen to its abort event
  if (originalSignal) {
    // Check if already aborted
    if (originalSignal.aborted) {
      clearTimeout(timeoutId);
      try {
        controller.abort();
      } catch (e) {
        console.error('Error aborting controller after initial check:', e);
      }
      throw new DOMException('The operation was aborted.', 'AbortError');
    }

    // Use once to ensure the listener only fires once
    const abortHandler = () => {
      clearTimeout(timeoutId);
      try {
        if (!controller.signal.aborted) {
          controller.abort();
        }
      } catch (e) {
        console.error('Error in abort handler:', e);
      }
    };

    originalSignal.addEventListener('abort', abortHandler, { once: true });
  }

  let lastError: Error | null = null;

  // Retry logic
  for (let attempt = 0; attempt <= retryAttempts; attempt++) {
    try {
      // Add attempt number to request headers for debugging
      const headers = (newOptions.headers as Record<string, string>) || {};
      newOptions.headers = {
        ...headers,
        'X-Retry-Attempt': attempt.toString(),
      };

      const response = await fetch(url, newOptions);
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      lastError = error;

      console.error(`Attempt ${attempt + 1}/${retryAttempts + 1} failed:`, error.name, error.message);

      // Don't retry if it was manually aborted or if we've reached max attempts
      if (error.name === 'AbortError' || attempt === retryAttempts) {
        break;
      }

      // Check if the original signal was aborted during the retry delay
      if (originalSignal && originalSignal.aborted) {
        break;
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }

  // Clean up the timeout
  clearTimeout(timeoutId);
  throw lastError || new Error('Failed to fetch after retries');
}

export async function POST(req: Request) {
  try {
 requireAuth()

    // Check user permissions - block trial users from AI access
    const permissions = await getUserPermissions();
    if (!permissions.canAccessAI) {
      return new NextResponse('AI access not available in your current plan. Please upgrade to access AI features.', { status: 403 });
    }

    // Get conversation messages from request
    const body = await req.json();
    const {
      messages,
      streaming = false,
      image,
    } = body as {
      messages: Message[];
      streaming?: boolean;
      image?: ImageData;
    };

    if (!messages) {
      return new NextResponse('Messages are required', { status: 400 });
    }

    // Build the request payload based on whether an image is included
    const payload: any = {
      model: 'deepseek-ai/DeepSeek-V3',
      messages,
      stream: streaming,
      max_tokens: 1024,
      temperature: 0.7,
    };

    // If image data is present, modify the message to include image description
    if (image) {
      // Check if we need to use a vision-capable model
      payload.model = 'anthropic/claude-3-opus-20240229';

      // Add system message for better image handling if it's not already the first message
      if (!messages[0] || messages[0].role !== 'system') {
        payload.messages = [
          {
            role: 'system',
            content:
              'You are an AI tutor that specializes in explaining concepts from images. When a user uploads an image, analyze it carefully and provide detailed explanations based on the image content and the user\'s question. For educational materials, explain the concepts thoroughly.',
          },
          ...messages,
        ];
      }

      // Modify the last user message to include image data
      const lastUserMessageIndex = [...payload.messages].reverse().findIndex((m) => m.role === 'user');
      const actualIndex = payload.messages.length - 1 - lastUserMessageIndex;

      if (actualIndex >= 0) {
        // Format the message with image content for multimodal models
        payload.messages[actualIndex] = {
          role: 'user',
          content: [
            {
              type: 'text',
              text: payload.messages[actualIndex].content,
            },
            {
              type: 'image',
              image: {
                data: image.base64,
                width: image.dimensions.width,
                height: image.dimensions.height,
              },
            },
          ],
        };
      }
    }

    // Call the API with timeout and retry logic
    try {
      // Select API endpoint based on whether an image is included
      const apiEndpoint = image
        ? 'https://llm.chutes.ai/v1/chat/completions-vision' // Use vision endpoint if image present
        : 'https://llm.chutes.ai/v1/chat/completions'; // Use standard endpoint otherwise

      const response = await fetchWithTimeout(
        apiEndpoint,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.CHUTES_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          // Use request's signal to allow client aborts to propagate
          signal: req.signal,
        },
        FETCH_TIMEOUT_MS,
        API_RETRY_ATTEMPTS,
      );

      // Handle streaming responses
      if (streaming) {
        // Return the response stream directly
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        return new Response(
          new ReadableStream({
            async start(controller) {
              // Handle incoming stream from API
              if (!response.body) {
                // If no response body, send a fallback message
                const fallbackMessage = JSON.stringify({
                  choices: [
                    {
                      delta: {
                        content:
                          'I\'m sorry, but I couldn\'t connect to the AI service right now. Please try again in a moment.',
                      },
                    },
                  ],
                });
                controller.enqueue(encoder.encode(`data: ${fallbackMessage}\n\n`));
                controller.close();
                return;
              }

              const reader = response.body.getReader();

              try {
                while (true) {
                  // Check if the request was aborted before reading
                  if (req.signal?.aborted) {
                    throw new DOMException('The operation was aborted.', 'AbortError');
                  }

                  const { done, value } = await reader.read();
                  if (done) break;

                  // Process and forward the chunk
                  const chunk = decoder.decode(value);
                  controller.enqueue(encoder.encode(chunk));
                }
              } catch (error) {
                console.error('Stream reading error:', error);

                // Don't send error message if it was a client abort
                if (error instanceof Error && error.name === 'AbortError' && req.signal?.aborted) {
                  // Just close the stream quietly
                } else {
                  // Send error message on other stream failures
                  const errorMessage = JSON.stringify({
                    choices: [
                      {
                        delta: {
                          content:
                            '\n\nI apologize, but there was an issue with the connection. Please try asking your question again.',
                        },
                      },
                    ],
                  });
                  controller.enqueue(encoder.encode(`data: ${errorMessage}\n\n`));
                }
              } finally {
                try {
                  reader.releaseLock();
                  controller.close();
                } catch (e) {
                  console.error('Error in stream cleanup:', e);
                }
              }
            },
          }),
          {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache, no-transform',
              Connection: 'keep-alive',
            },
          },
        );
      } else {
        // Handle regular non-streaming response
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (error: any) {
      console.error('[AI_TUTOR_API_ERROR]', error);

      // If the error is due to client disconnection, just return a basic response
      if (error.name === 'AbortError' && req.signal?.aborted) {
        return new Response(null, { status: 499 }); // 499 is "Client Closed Request"
      }

      // Return a friendly error message based on the type of error
      let errorMessage = 'An unexpected error occurred.';

      if (error.name === 'AbortError') {
        errorMessage = 'The AI service took too long to respond. Please try again later.';
      } else if (error.code === 'UND_ERR_CONNECT_TIMEOUT' || error.cause?.code === 'UND_ERR_CONNECT_TIMEOUT') {
        errorMessage = 'Connection to the AI service timed out. Please check your internet connection and try again.';
      } else if (error.message?.includes('fetch failed')) {
        errorMessage = 'Failed to connect to the AI service. The service might be temporarily unavailable.';
      }

      if (streaming) {
        // For streaming requests, return the error in the stream format
        const encoder = new TextEncoder();
        const errorStreamData = JSON.stringify({
          choices: [{ delta: { content: errorMessage } }],
        });

        return new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(encoder.encode(`data: ${errorStreamData}\n\n`));
              controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
              controller.close();
            },
          }),
          {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              Connection: 'keep-alive',
            },
          },
        );
      } else {
        // For regular requests, return a JSON error response
        return NextResponse.json(
          {
            error: true,
            message: errorMessage,
          },
          { status: 503 },
        );
      }
    }
  } catch (error) {
    console.error('[AI_TUTOR_ERROR]', error);

    // Check if this was a client disconnect
    if (error instanceof Error && error.name === 'AbortError') {
      return new Response(null, { status: 499 });
    }

    return new NextResponse('Internal Error', { status: 500 });
  }
}
