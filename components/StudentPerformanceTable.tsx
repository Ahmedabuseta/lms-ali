'use client';

import { useState } from 'react';
import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type StudentResult = {
  userId: string;
  userName: string;
  email: string;
  score: number;
  timeTaken: number;
  completedAt: Date;
  correct: number;
  total: number;
};

interface StudentPerformanceTableProps {
  studentResults: StudentResult[];
}

type SortField = 'userName' | 'score' | 'timeTaken' | 'completedAt';
type SortDirection = 'asc' | 'desc';

export function StudentPerformanceTable({ studentResults }: StudentPerformanceTableProps) {
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortDirection === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />;
  };

  const sortedResults = [...studentResults].sort((a, b) => {
    if (sortField === 'userName') {
      return sortDirection === 'asc' ? a.userName.localeCompare(b.userName) : b.userName.localeCompare(a.userName);
    }

    if (sortField === 'score') {
      return sortDirection === 'asc' ? a.score - b.score : b.score - a.score;
    }

    if (sortField === 'timeTaken') {
      return sortDirection === 'asc' ? a.timeTaken - b.timeTaken : b.timeTaken - a.timeTaken;
    }

    if (sortField === 'completedAt') {
      return sortDirection === 'asc'
        ? new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
        : new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
    }

    return 0;
  });

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Rank</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('userName')}
                className="flex h-auto items-center p-0 font-semibold hover:bg-transparent"
              >
                Student {sortIcon('userName')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('score')}
                className="flex h-auto items-center p-0 font-semibold hover:bg-transparent"
              >
                Score {sortIcon('score')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('timeTaken')}
                className="flex h-auto items-center p-0 font-semibold hover:bg-transparent"
              >
                Time Taken {sortIcon('timeTaken')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('completedAt')}
                className="flex h-auto items-center p-0 font-semibold hover:bg-transparent"
              >
                Completed At {sortIcon('completedAt')}
              </Button>
            </TableHead>
            <TableHead>Result</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedResults.map((result, index) => (
            <TableRow key={result.userId}>
              <TableCell className="text-center font-medium">{index + 1}</TableCell>
              <TableCell>
                <div className="font-medium">{result.userName}</div>
                <div className="text-sm text-slate-500">{result.email}</div>
              </TableCell>
              <TableCell>
                <div className="font-semibold">{result.score}%</div>
                <div className="text-xs text-slate-500">
                  {result.correct}/{result.total} correct
                </div>
              </TableCell>
              <TableCell>{formatTime(result.timeTaken)}</TableCell>
              <TableCell>{new Date(result.completedAt).toLocaleString()}</TableCell>
              <TableCell>
                <div
                  className={cn(
                    'w-fit rounded-full px-2 py-1 text-xs font-semibold',
                    result.score >= 70
                      ? 'bg-green-100 text-green-700'
                      : result.score >= 50
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700',
                  )}
                >
                  {result.score >= 70 ? 'Pass' : result.score >= 50 ? 'Borderline' : 'Fail'}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
