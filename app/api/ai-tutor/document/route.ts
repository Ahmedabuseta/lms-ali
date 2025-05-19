import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { createWorker } from 'tesseract.js';
import pdfParse from 'pdf-parse';

// Define interfaces for document handling
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface DocumentFile {
  name: string;
  url: string;
  type: 'pdf' | 'image';
}

// Set timeout configuration
const FETCH_TIMEOUT_MS = 45000; // 45 seconds timeout for document processing
const OCR_TIMEOUT_MS = 30000;   // 30 seconds timeout for OCR
const API_RETRY_ATTEMPTS = 1;   // Number of retry attempts

// Custom fetch with timeout and retry logic
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number, retryAttempts: number) {
  // Create an AbortController to handle timeouts
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    try {
      controller.abort();
    } catch (e) {
      console.error("Error aborting controller:", e);
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
        console.error("Error aborting controller after initial check:", e);
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
        console.error("Error in abort handler:", e);
      }
    };
    
    originalSignal.addEventListener('abort', abortHandler, { once: true });
  }
  
  let lastError: Error | null = null;
  
  // Retry logic
  for (let attempt = 0; attempt <= retryAttempts; attempt++) {
    try {
      // Add attempt number to request headers for debugging
      const headers = newOptions.headers as Record<string, string> || {};
      newOptions.headers = {
        ...headers,
        'X-Retry-Attempt': attempt.toString()
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
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
  
  // Clean up the timeout
  clearTimeout(timeoutId);
  throw lastError || new Error('Failed to fetch after retries');
}

// Function to extract text from an image URL using Tesseract OCR
async function extractTextFromImage(imageUrl: string): Promise<string> {
  try {
    console.log(`Starting OCR for image: ${imageUrl}`);
    
    // Create a worker with a timeout
    const worker = await createWorker();
    
    // Timeout for OCR processing
    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error('OCR processing timed out')), OCR_TIMEOUT_MS);
    });
    
    // Process the image with OCR
    const ocrPromise = (async () => {
      try {
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const { data: { text } } = await worker.recognize(imageUrl);
        await worker.terminate();
        return text;
      } catch (error) {
        console.error(`OCR processing error: ${error}`);
        await worker.terminate().catch(e => console.error(`Error terminating worker: ${e}`));
        throw error;
      }
    })();
    
    // Race between OCR and timeout
    const text = await Promise.race([ocrPromise, timeoutPromise]);
    console.log(`OCR completed for image: ${imageUrl}`);
    return text || 'No text could be extracted from the image.';
  } catch (error) {
    console.error(`Failed to extract text from image: ${error}`);
    return `Failed to extract text from image: ${error.message || 'Unknown error'}`;
  }
}

// Function to extract text from a PDF URL
async function extractTextFromPDF(pdfUrl: string): Promise<string> {
  try {
    console.log(`Starting PDF parsing for: ${pdfUrl}`);
    
    // Fetch the PDF
    const response = await fetch(pdfUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    
    // Parse PDF with timeout
    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error('PDF parsing timed out')), OCR_TIMEOUT_MS);
    });
    
    const parsePromise = (async () => {
      const data = await pdfParse(Buffer.from(buffer));
      return data.text || 'No text could be extracted from the PDF.';
    })();
    
    // Race between parsing and timeout
    const text = await Promise.race([parsePromise, timeoutPromise]);
    console.log(`PDF parsing completed for: ${pdfUrl}`);
    return text;
  } catch (error) {
    console.error(`Failed to extract text from PDF: ${error}`);
    return `Failed to extract text from PDF: ${error.message || 'Unknown error'}`;
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    
    // Check for authentication
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Get conversation messages and document files from request
    const body = await req.json();
    const { 
      messages, 
      documentFiles,
      streaming = false 
    } = body as { 
      messages: Message[],
      documentFiles: DocumentFile[],
      streaming?: boolean
    };
    
    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }
    
    // Extract text from documents in parallel
    let extractedText = '';
    let processingErrors = [];
    
    if (documentFiles && documentFiles.length > 0) {
      console.log(`Processing ${documentFiles.length} document files`);
      
      const extractionResults = await Promise.all(
        documentFiles.map(async file => {
          try {
            let text = '';
            if (file.type === 'pdf') {
              text = await extractTextFromPDF(file.url);
            } else if (file.type === 'image') {
              text = await extractTextFromImage(file.url);
            }
            return {
              success: true,
              fileName: file.name,
              text: text
            };
          } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
            processingErrors.push(`Error processing ${file.name}: ${error.message || 'Unknown error'}`);
            return {
              success: false,
              fileName: file.name,
              error: error.message || 'Unknown error'
            };
          }
        })
      );
      
      // Combine all extracted text
      extractedText = extractionResults
        .filter(result => result.success)
        .map(result => `[Document: ${result.fileName}]\n${result.text}\n`)
        .join('\n---\n\n');
    }
    
    // If there are processing errors but no text was extracted, return an error
    if (processingErrors.length > 0 && !extractedText) {
      return NextResponse.json({
        error: true,
        message: "Failed to process document(s)",
        details: processingErrors
      }, { status: 500 });
    }
    
    // Build the request payload
    const systemMessage = {
      role: 'system' as const,
      content: 'You are a helpful AI tutor. When provided with text extracted from documents, analyze the content carefully and answer questions about it. Explain concepts thoroughly and clearly.'
    };
    
    // Construct message history with document contents
    let payload: any = {
      "model": "deepseek-ai/DeepSeek-V3",
      "messages": [systemMessage],
      "stream": streaming,
      "max_tokens": 1024,
      "temperature": 0.7
    };
    
    // If there's extracted text, add it as a system message before user questions
    if (extractedText) {
      payload.messages.push({
        role: 'system' as const,
        content: `The following text was extracted from the uploaded document(s). Use this information to answer the user's questions:\n\n${extractedText}`
      });
    }
    
    // Add user/assistant conversation history
    payload.messages = [
      ...payload.messages,
      ...messages
    ];
    
    // Call the API with timeout and retry logic
    try {
      const response = await fetchWithTimeout(
        "https://llm.chutes.ai/v1/chat/completions", 
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.CHUTES_API_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload),
          // Use request's signal to allow client aborts to propagate
          signal: req.signal
        },
        FETCH_TIMEOUT_MS,
        API_RETRY_ATTEMPTS
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
                  choices: [{ 
                    delta: { 
                      content: "I'm sorry, but I couldn't connect to the AI service right now. Please try again in a moment." 
                    }
                  }]
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
                console.error("Stream reading error:", error);
                
                // Don't send error message if it was a client abort
                if (error.name === 'AbortError' && req.signal?.aborted) {
                  // Just close the stream quietly
                } else {
                  // Send error message on other stream failures
                  const errorMessage = JSON.stringify({
                    choices: [{ 
                      delta: { 
                        content: "\n\nI apologize, but there was an issue with the connection. Please try asking your question again." 
                      }
                    }]
                  });
                  controller.enqueue(encoder.encode(`data: ${errorMessage}\n\n`));
                }
              } finally {
                try {
                  reader.releaseLock();
                  controller.close();
                } catch (e) {
                  console.error("Error in stream cleanup:", e);
                }
              }
            }
          }),
          {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache, no-transform',
              'Connection': 'keep-alive',
            },
          }
        );
      } else {
        // Handle regular non-streaming response
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (error: any) {
      console.error("[AI_DOCUMENT_TUTOR_API_ERROR]", error);
      
      // If the error is due to client disconnection, just return a basic response
      if (error.name === 'AbortError' && req.signal?.aborted) {
        return new Response(null, { status: 499 }); // 499 is "Client Closed Request"
      }
      
      // Return a friendly error message based on the type of error
      let errorMessage = "An unexpected error occurred.";
      
      if (error.name === 'AbortError') {
        errorMessage = "The AI service took too long to respond. Please try again later.";
      } else if (error.code === 'UND_ERR_CONNECT_TIMEOUT' || error.cause?.code === 'UND_ERR_CONNECT_TIMEOUT') {
        errorMessage = "Connection to the AI service timed out. Please check your internet connection and try again.";
      } else if (error.message?.includes('fetch failed')) {
        errorMessage = "Failed to connect to the AI service. The service might be temporarily unavailable.";
      }
      
      if (streaming) {
        // For streaming requests, return the error in the stream format
        const encoder = new TextEncoder();
        const errorStreamData = JSON.stringify({
          choices: [{ delta: { content: errorMessage } }]
        });
        
        return new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(encoder.encode(`data: ${errorStreamData}\n\n`));
              controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
              controller.close();
            }
          }),
          {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          }
        );
      } else {
        // For regular requests, return a JSON error response
        return NextResponse.json({ 
          error: true, 
          message: errorMessage 
        }, { status: 503 });
      }
    }
  } catch (error) {
    console.error("[AI_DOCUMENT_TUTOR_ERROR]", error);
    
    // Check if this was a client disconnect
    if (error.name === 'AbortError') {
      return new Response(null, { status: 499 });
    }
    
    return new NextResponse("Internal Error", { status: 500 });
  }
}