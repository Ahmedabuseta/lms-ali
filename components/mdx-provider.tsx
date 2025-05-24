'use client';

import { MDXProvider } from '@mdx-js/react';
import { MathRenderer } from './math-renderer';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import Link from 'next/link';
import { Card, CardContent } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { InfoIcon, AlertTriangleIcon, CheckCircleIcon, FileIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface DetailsProps {
  children: ReactNode;
  summary?: ReactNode;
}

const Details = ({ children, summary }: DetailsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-4 rounded-md border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full justify-between p-4 text-left font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <div>{summary || 'Solution'}</div>
        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>
      {isOpen && <div className="border-t p-4 pt-0">{children}</div>}
    </div>
  );
};

// Custom components for MDX
const components = {
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className={cn('mt-2 scroll-m-20 text-4xl font-bold tracking-tight', className)} {...props} />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className={cn('mt-10 scroll-m-20 border-b pb-1 text-3xl font-semibold tracking-tight first:mt-0', className)}
      {...props}
    />
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn('mt-8 scroll-m-20 text-2xl font-semibold tracking-tight', className)} {...props} />
  ),
  h4: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className={cn('mt-8 scroll-m-20 text-xl font-semibold tracking-tight', className)} {...props} />
  ),
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn('leading-7 [&:not(:first-child)]:mt-6', className)} {...props} />
  ),
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn('my-6 ml-6 list-disc', className)} {...props} />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className={cn('my-6 ml-6 list-decimal', className)} {...props} />
  ),
  li: ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className={cn('mt-2', className)} {...props} />
  ),
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className={cn('mt-6 border-l-2 pl-6 italic [&>*]:text-muted-foreground', className)} {...props} />
  ),
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code className={cn('relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm', className)} {...props} />
  ),
  pre: ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className={cn('mb-4 mt-6 overflow-x-auto rounded-lg border bg-slate-950 p-4', className)} {...props} />
  ),
  a: ({ className, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    if (href?.startsWith('/')) {
      return <Link href={href} className={cn('font-medium underline underline-offset-4', className)} {...props} />;
    }
    return (
      <a
        href={href}
        className={cn('font-medium underline underline-offset-4', className)}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    );
  },
  table: ({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className={cn('w-full', className)} {...props} />
    </div>
  ),
  tr: ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className={cn('m-0 border-t p-0 even:bg-muted', className)} {...props} />
  ),
  th: ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th
      className={cn(
        'border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right',
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td
      className={cn('border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right', className)}
      {...props}
    />
  ),
  math: ({ value, display }: { value: string; display?: boolean }) => (
    <MathRenderer content={value} display={display} />
  ),
  Button: (props: any) => <Button {...props} />,
  Card: ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <Card className={cn('my-6', className)} {...props}>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  ),
  Details: Details,
  Info: ({ children, title = 'Information' }: { children: ReactNode; title?: string }) => (
    <Alert className="my-4 border-blue-500 bg-blue-50">
      <InfoIcon className="h-4 w-4 text-blue-500" />
      <AlertTitle className="text-blue-700">{title}</AlertTitle>
      <AlertDescription className="text-blue-600">{children}</AlertDescription>
    </Alert>
  ),
  Warning: ({ children, title = 'Warning' }: { children: ReactNode; title?: string }) => (
    <Alert className="my-4 border-amber-500 bg-amber-50">
      <AlertTriangleIcon className="h-4 w-4 text-amber-500" />
      <AlertTitle className="text-amber-700">{title}</AlertTitle>
      <AlertDescription className="text-amber-600">{children}</AlertDescription>
    </Alert>
  ),
  Success: ({ children, title = 'Success' }: { children: ReactNode; title?: string }) => (
    <Alert className="my-4 border-green-500 bg-green-50">
      <CheckCircleIcon className="h-4 w-4 text-green-500" />
      <AlertTitle className="text-green-700">{title}</AlertTitle>
      <AlertDescription className="text-green-600">{children}</AlertDescription>
    </Alert>
  ),
  Resource: ({ children, title, href }: { children: ReactNode; title: string; href: string }) => (
    <Card className="my-6">
      <CardContent className="flex items-center gap-4 p-4">
        <FileIcon className="h-8 w-8 text-primary" />
        <div className="flex-grow">
          <h4 className="font-bold">{title}</h4>
          <p className="text-sm text-muted-foreground">{children}</p>
        </div>
        <Button asChild variant="outline">
          <Link href={href}>Download</Link>
        </Button>
      </CardContent>
    </Card>
  ),
};

export function MDXContent({ children }: { children: ReactNode }) {
  return (
    <MDXProvider components={components}>
      <div className="mdx-content prose prose-slate dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-lead:text-slate-500 prose-a:font-semibold prose-a:text-primary hover:prose-a:text-primary/80 max-w-none">
        {children}
      </div>
    </MDXProvider>
  );
}
