'use client';

import { useState } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  searchKey?: string;
}

export function UserDataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "البحث...",
  searchKey = "name",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm font-arabic"
          />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground font-arabic">
            عرض
          </span>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground font-arabic">
            من {table.getFilteredRowModel().rows.length} عنصر
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/30 bg-gradient-to-br from-white/50 to-white/30 dark:from-white/10 dark:to-white/5 backdrop-blur-xl shadow-xl overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow 
                key={headerGroup.id}
                className="border-b border-white/20 bg-white/20 dark:bg-white/5"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="h-12">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    'border-b border-white/10 transition-all duration-200 hover:bg-white/20 dark:hover:bg-white/10',
                    index % 2 === 0 ? 'bg-white/5' : 'bg-white/10 dark:bg-white/5'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                      <Users className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <div className="text-muted-foreground font-arabic text-lg">
                      لم يتم العثور على مستخدمين
                    </div>
                    <p className="text-sm text-muted-foreground font-arabic">
                      جرب تعديل الفلاتر أو البحث بمصطلحات أخرى
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground font-arabic bg-white/30 dark:bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm">
          عرض{' '}
          <span className="font-semibold">
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
          </span>{' '}
          إلى{' '}
          <span className="font-semibold">
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}
          </span>{' '}
          من أصل{' '}
          <span className="font-semibold">
            {table.getFilteredRowModel().rows.length}
          </span>{' '}
          مستخدم
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center gap-2 bg-white/40 dark:bg-white/10 rounded-xl p-2 backdrop-blur-xl border border-white/30">
            <Button
              variant="ghost"
              className="hidden h-8 w-8 p-0 lg:flex hover:bg-white/50 dark:hover:bg-white/20"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              title="الصفحة الأولى"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-white/50 dark:hover:bg-white/20"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              title="الصفحة السابقة"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1 mx-2">
              <span className="text-sm font-medium font-arabic">
                صفحة {table.getState().pagination.pageIndex + 1} من {table.getPageCount()}
              </span>
            </div>
            
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-white/50 dark:hover:bg-white/20"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              title="الصفحة التالية"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="hidden h-8 w-8 p-0 lg:flex hover:bg-white/50 dark:hover:bg-white/20"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              title="الصفحة الأخيرة"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 