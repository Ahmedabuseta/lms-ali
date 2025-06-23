'use client';

import React, { useState, useEffect } from 'react';
import { evaluate } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import ReactMarkdown, { Components } from 'react-markdown';
import { useTheme } from 'next-themes';
import { MDXContent } from './mdx-provider';
import 'katex/dist/katex.min.css';
import { MathRenderer } from './math-renderer';
import { cn } from '@/lib/utils';

interface MDXRendererProps { content: string; }

// Define custom component types for ReactMarkdown
type CustomComponentProps = { node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  value?: string; };

type CustomComponents = Components & { math?: React.ComponentType<CustomComponentProps>;
  inlineMath?: React.ComponentType<CustomComponentProps>; };

export const MDXRenderer = ({ content }: MDXRendererProps) => { const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    // Don't attempt to evaluate empty content
    if (!content || content.trim() === '') {
      setComponent(null);
      setError(null);
      return;
    }

    // Pre-process the content to prepare LaTeX expressions for MDX
    const preprocessContent = (rawContent: string): string => { return (
        rawContent
          // Fix unclosed code blocks
          .replace(/```\s*$/g, '```\n')

          // Fix unclosed math blocks
          .replace(/\$\s*$/g, '$\\')

          // Normalize multiple line breaks
          .replace(/\n{3, }/g, '\n\n')

          // Fix multi-line display math by removing line breaks within LaTeX blocks
          .replace(/\$\$([\s\S]*?)\$\$/g, (match) => match.replace(/\n/g, ' '))

          // Fix potential broken inline math formulas
          .replace(/\$([^$\n]+?)(\n)([^$\n]+?)\$/g, '$$$1 $3$$')

          // Fix specific calculus notation - ensure proper LaTeX formatting
          .replace(/\\sin\(/g, '\\\\sin(')
          .replace(/\\cos\(/g, '\\\\cos(')
          .replace(/\\tan\(/g, '\\\\tan(')
          .replace(/\\frac{d}{dx}/g, '\\\\frac{d}{dx}')
          .replace(/\\frac{d}{du}/g, '\\\\frac{d}{du}')
          .replace(/f'\(x\)/g, 'f^{\\prime}(x)')
          .replace(/\\cdot/g, '\\\\cdot')
          .replace(/\\text/g, '\\\\text')
          .replace(/\\quad/g, '\\\\quad')
          .replace(/\\Rightarrow/g, '\\\\Rightarrow')
      );
    };

    // Evaluate MDX content on the client side
    const evaluateMdx = async () => { try {
        const cleanContent = preprocessContent(content);

        const { default: MdxComponent } = await evaluate(cleanContent, { ...runtime,
          Fragment: React.Fragment,
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex, rehypeRaw], });

        setComponent(() => MdxComponent);
        setError(null);
        setIsFallback(false);
      } catch (err) { console.error('Error rendering MDX:', err);
        setError(err as Error);
        setIsFallback(true);
        setComponent(null); }
    };

    evaluateMdx();
  }, [content]);

  // If there's an error or no content, fall back to a simpler Markdown renderer
  if (error || isFallback) { // Prepare content for ReactMarkdown with proper math formatting
    const prepareForReactMarkdown = (text: string): string => {
      // Apply specific fixes for calculus problems
      const calculusFixes = text
        .replace(/\[/g, '') // Remove square brackets often used in math
        .replace(/\]/g, '') // Remove square brackets often used in math
        .replace(/\\sin\(/g, '\\sin(')
        .replace(/\\cos\(/g, '\\cos(')
        .replace(/\\tan\(/g, '\\tan(')
        .replace(/f'\(x\)/g, 'f^{\\prime }(x)')
        .replace(/\\cdot/g, '\\cdot')
        .replace(/\\text/g, '\\text')
        .replace(/\\quad/g, '\\quad')
        .replace(/\\Rightarrow/g, '\\Rightarrow')
        .replace(/\(\\?where \( ([^)]+) \)\)/g, '(where $1)');

      return (
        calculusFixes
          // Handle display math - ensure they're properly formatted for remarkMath
          .replace(/\$\$([\s\S]*?)\$\$/g, (_, formula) => `\n\n$$${formula.trim()}$$\n\n`)

          // Handle inline math - ensure they're properly formatted for remarkMath
          .replace(/\$([^$\n]+?)\$/g, (_, formula) => `$${formula.trim()}$`)
      );
    };

    // Extra handling for derivative notation
    const derivativeFixes = (text: string): string => { return text.replace(/\(\\?where \( ([^)]+) \)\)/g, '(where $1)').replace(/\( ([^)]+) \)/g, '($1)'); };

    // Detect if content is predominantly Arabic
    const isArabicDominant = (text: string): boolean => { // Simple heuristic: count Arabic characters vs Latin characters
      const arabicPattern = /[\u0600-\u06FF]/g;
      const latinPattern = /[a-zA-Z]/g;

      const arabicMatches = text.match(arabicPattern) || [];
      const latinMatches = text.match(latinPattern) || [];

      return arabicMatches.length > latinMatches.length; };

    const processedContent = prepareForReactMarkdown(derivativeFixes(content));
    const contentDirection = isArabicDominant(processedContent) ? 'rtl-dominant' : 'ltr-dominant';

    return (
      <div
        className={`markdown-content whitespace-pre-wrap ${contentDirection}`}
        style={ { unicodeBidi: 'isolate-override' }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={ [rehypeKatex, rehypeRaw] }
          components={ {
              code({ node, inline, className, children, ...props }: CustomComponentProps) { return inline ? (
                  <code
                    className={cn('bidi-isolate rounded px-1.5 py-0.5 font-mono text-sm', 'bg-[hsl(var(--code-bg))]') }
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <pre className="mb-4 mt-2 overflow-x-auto rounded-lg border bg-[hsl(var(--code-bg))] p-4">
                    <code className="font-mono text-sm" {...props}>
                      {children}
                    </code>
                  </pre>
                );
              },
              // Handle paragraphs with mixed content
              p({ children }) {
                return <p className="bidi-paragraph mb-4">{children}</p>;
              },
              // Better heading styles with dark mode support
              h1({ children }) {
                return <h1 className="mb-4 mt-6 text-2xl font-bold text-foreground">{children}</h1>;
              },
              h2({ children }) {
                return <h2 className="mb-3 mt-6 text-xl font-bold text-foreground">{children}</h2>;
              },
              h3({ children }) {
                return <h3 className="mb-2 mt-5 text-lg font-bold text-foreground">{children}</h3>;
              },
              h4({ children }) {
                return <h4 className="mb-2 mt-4 text-base font-bold text-foreground">{children}</h4>;
              },
              // Better list styling
              ul({ children }) {
                return <ul className="mb-4 list-disc pl-6">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="mb-4 list-decimal pl-6">{children}</ol>;
              },
              li({ children }) {
                return <li className="mb-1">{children}</li>;
              },
              // Blockquote styling for dark mode
              blockquote({ children }) {
                return <blockquote className="my-4 border-l-4 border-primary/40 pl-4 italic">{children}</blockquote>;
              },
              // Tables with dark mode support
              table({ children }) {
                return (
                  <div className="mb-4 overflow-x-auto">
                    <table className="w-full border-collapse border border-border">{children}</table>
                  </div>
                );
              },
              thead({ children }) {
                return <thead className="bg-muted">{children}</thead>;
              },
              tbody({ children }) {
                return <tbody>{children}</tbody>;
              },
              tr({ children }) {
                return <tr className="border-b border-border">{children}</tr>;
              },
              th({ children }) {
                return <th className="px-4 py-2 text-left font-semibold">{children}</th>;
              },
              td({ children }) { return <td className="border-r border-border px-4 py-2 last:border-r-0">{children }</td>;
              },
              // Use proper type casting for custom components
              math({ value }: CustomComponentProps) {
                return value ? <MathRenderer content={value} display={true} /> : null;
              },
              inlineMath({ value }: CustomComponentProps) {
                return value ?  <MathRenderer content={value} display={true} /> : null;
              },
              a({ children, href }) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline transition-colors hover:text-primary/80"
                  >
                    {children}
                  </a>
                );
              },
              hr() {
                return <hr className="my-6 border-t border-border" />;
              },
              img({ src, alt }) {
                return <img src={src} alt={alt || ''} className="my-4 h-auto max-w-full rounded-lg" loading="lazy" />;
              },
            } as CustomComponents
          }
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-3 text-sm text-muted-foreground">Processing content...</span>
      </div>
    );
  }

  return (
    <MDXContent>
      <Component />
    </MDXContent>
  );
};
