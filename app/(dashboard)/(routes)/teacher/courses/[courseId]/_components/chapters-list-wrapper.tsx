'use client';

import { Chapter } from '@prisma/client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the chapters list to avoid SSR issues with drag and drop
const ChaptersListComponent = dynamic(
  () => import('./chapters-list').then((mod) => ({ default: mod.ChaptersList })),
  { ssr: false,
    loading: () => (
      <div className="space-y-2">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    ), }
);

interface ChaptersListWrapperProps { items: Chapter[];
  onReorder: (updateData: { id: string; position: number }[]) => void;
  onEdit: (id: string) => void;
}

export const ChaptersListWrapper = ({ items, onReorder, onEdit }: ChaptersListWrapperProps) => { const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); }, []);

  if (!mounted) { return (
      <div className="space-y-2">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    ); }

  return (
    <ChaptersListComponent
      items={items}
      onReorder={onReorder}
      onEdit={onEdit}
    />
  );
};
