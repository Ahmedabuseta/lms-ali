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

export const MathRenderer: React.FC<MathRendererProps> = ({ content, display = false, className = '' }) => {
  const [renderedMath, setRenderedMath] = useState<string>('');
  const [useDirectKatex, setUseDirectKatex] = useState<boolean>(false);

  useEffect(() => {
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

    setUseDirectKatex(isComplexMath);

    // For complex equations, use direct KaTeX rendering
    if (isComplexMath) {
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
  }, [content, display]);

  // For complex math formulas, use direct KaTeX rendering
  if (useDirectKatex) {
    return (
      <div
        className={`math-content ${className} ${display ? 'my-4 text-center' : 'inline-block'}`}
        dangerouslySetInnerHTML={{ __html: renderedMath }}
      />
    );
  }

  // For simpler formulas, use ReactMarkdown with remark-math
  // Don't add extra delimiters if they're already present in the content
  const mathContent = content.trim().startsWith('$') ? content : display ? `$$${content}$$` : `$${content}$`;

  return (
    <div className={`math-content ${className} ${display ? 'my-4 block' : 'inline-block'}`}>
      <ReactMarkdown rehypePlugins={[rehypeKatex, rehypeRaw]} remarkPlugins={[remarkMath]}>
        {mathContent}
      </ReactMarkdown>
    </div>
  );
};
