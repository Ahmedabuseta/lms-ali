'use client';

import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';

// Direct KaTeX rendering option for complex equations
import katex from 'katex';

interface MathRendererProps {
  content: string;
  display?: boolean;
  className?: string;
}

// Function to detect if text contains Arabic characters
const containsArabic = (text: string): boolean => {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
};

// Function to detect if text is primarily mathematical content
const isMathContent = (text: string): boolean => {
  const mathSymbols = /[\$\\{}^_=+\-*/()[\]|<>≤≥≠∑∫∏√∞±∆∇∂]/;
  const mathCommands = /\\[a-zA-Z]+/;
  return mathSymbols.test(text) || mathCommands.test(text);
};

export const MathRenderer: React.FC<MathRendererProps> = ({ 
  content, 
  display = false, 
  className = '' 
}) => {
  const [renderedMath, setRenderedMath] = useState<string>('');
  const [useDirectKatex, setUseDirectKatex] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [hasArabic, setHasArabic] = useState<boolean>(false);

  // Track if we're on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Check if content contains Arabic text
    const arabicDetected = containsArabic(content);
    setHasArabic(arabicDetected);

    // Determine if the content is complex enough to warrant direct KaTeX rendering
    const isComplexMath =
      content.includes('\\frac') ||
      content.includes('\\sum') ||
      content.includes('\\int') ||
      content.includes('\\prod') ||
      content.includes('\\begin{') ||
      content.includes('\\left') ||
      content.includes('\\right') ||
      content.includes('\\mathbb') ||
      content.includes('\\overrightarrow') ||
      content.includes('\\partial');

    // Only use direct KaTeX for complex math that doesn't contain Arabic
    const shouldUseDirectKatex = isComplexMath && !arabicDetected && isMathContent(content);
    setUseDirectKatex(shouldUseDirectKatex);

    // For complex equations without Arabic, use direct KaTeX rendering
    if (shouldUseDirectKatex) {
      try {
        const html = katex.renderToString(content, {
          displayMode: display,
          throwOnError: false,
          trust: true,
        });
        setRenderedMath(html);
      } catch (err) {
        console.error('KaTeX rendering failed:', err);
        // Fallback to regular rendering if KaTeX fails
        setUseDirectKatex(false);
      }
    }
  }, [content, display, isClient]);

  // Show initial render (server-safe) while client is loading
  if (!isClient) {
    const mathContent = content.trim().startsWith('$') ? content : display ? `$$${content}$$` : `$${content}$`;
    return (
      <div 
        className={`math-content ${className} ${display ? 'my-4 block' : 'inline-block'}`}
        dir={containsArabic(content) ? 'rtl' : 'ltr'}
        style={{ 
          fontFamily: hasArabic ? 'Arial, "Times New Roman", serif' : 'inherit',
          lineHeight: '1.6',
          wordSpacing: 'normal',
          letterSpacing: 'normal'
        }}
      >
        <ReactMarkdown 
          rehypePlugins={[rehypeKatex, rehypeRaw]} 
          remarkPlugins={[remarkMath]}
        >
          {mathContent}
        </ReactMarkdown>
      </div>
    );
  }

  // For complex math formulas without Arabic, use direct KaTeX rendering
  if (useDirectKatex) {
    return (
      <div
        className={`math-content ${className} ${display ? 'my-4 text-center' : 'inline-block'}`}
        dangerouslySetInnerHTML={{ __html: renderedMath }}
        suppressHydrationWarning={true}
      />
    );
  }

  // For content with Arabic or simpler formulas, use ReactMarkdown with proper RTL support
  const mathContent = content.trim().startsWith('$') ? content : display ? `$$${content}$$` : `$${content}$`;

  return (
    <div 
      className={`math-content ${className} ${display ? 'my-4 block' : 'inline-block'}`}
      dir={hasArabic ? 'rtl' : 'ltr'}
      suppressHydrationWarning={true}
      style={{ 
        fontFamily: hasArabic ? 'Arial, "Amiri", "Times New Roman", serif' : 'inherit',
        lineHeight: '1.6',
        wordSpacing: 'normal',
        letterSpacing: 'normal',
        textAlign: hasArabic && display ? 'center' : 'inherit',
        unicodeBidi: hasArabic ? 'embed' : 'normal'
      }}
    >
      <ReactMarkdown 
        rehypePlugins={[rehypeKatex, rehypeRaw]} 
        remarkPlugins={[remarkMath]}
      >
        {mathContent}
      </ReactMarkdown>
    </div>
  );
};
