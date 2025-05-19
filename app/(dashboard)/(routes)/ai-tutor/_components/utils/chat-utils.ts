// Helper function to sanitize markdown content
export const sanitizeMarkdown = (content: string): string => {
  // Fix common streaming issues
  return content
    .replace(/```\s*$/g, '```\n') // Fix unclosed code blocks
    .replace(/\$\s*$/g, '$\\') // Fix unclosed math expressions
    .replace(/\n{3,}/g, '\n\n'); // Normalize multiple line breaks
};

// Define message interface
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Constants
export const CLIENT_TIMEOUT_MS = 60000; // 60 seconds client-side timeout 