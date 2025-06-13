'use client';

import { useState, useMemo } from 'react';
import { ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  Row,
  Column,
  Header,
  HeaderGroup,
  Cell, } from '@tanstack/react-table';
import { CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  UserPlus,
  Shield,
  ShieldOff,
  Monitor,
  UserX,
  Gift,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Users, } from 'lucide-react';
import { User, UserRole, StudentAccessType } from '@/lib/types';
import { useUserManagement } from '../_hooks/use-user-management';
import { GrantAccessForm } from './grant-access-form';
import { BanUserForm } from './ban-user-form';
import { SessionsManager } from './sessions-manager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle, } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface UserManagementProps { users: User[]; }

const accessTypeLabels: Record<StudentAccessType, string> = { NO_ACCESS: 'لا يوجد وصول',
  FREE_TRIAL: 'تجربة مجانية',
  FULL_ACCESS: 'وصول كامل مدفوع',
  LIMITED_ACCESS: 'وصول محدود مدفوع', };

const accessTypeColors: Record<StudentAccessType, string> = { NO_ACCESS: 'bg-muted text-muted-foreground',
  FREE_TRIAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  FULL_ACCESS: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  LIMITED_ACCESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', };

const getTrialStatus = (user: User) => {
  if (user.accessType !== StudentAccessType.FREE_TRIAL) return null;

  if (!user.trialEndDate) return 'تجربة غير صالحة';

  const now = new Date();
  const endDate = new Date(user.trialEndDate);
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return 'انتهت التجربة';
  }

  return `${diffDays} أيام متبقية`;
};

const getStatusIcon = (user: User) => {
  if (user.role === UserRole.TEACHER) {
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  }

  switch (user.accessType) { case StudentAccessType.NO_ACCESS:
      return <XCircle className="h-5 w-5 text-muted-foreground" />;
    case StudentAccessType.FREE_TRIAL:
      const trialStatus = getTrialStatus(user);
      return trialStatus?.includes('انتهت') ? (
        <XCircle className="h-5 w-5 text-red-500" />
      ) : (
        <Clock className="h-5 w-5 text-blue-500" />
      );
    case StudentAccessType.FULL_ACCESS:
    case StudentAccessType.LIMITED_ACCESS:
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    default:
      return <XCircle className="h-5 w-5 text-muted-foreground" />; }
};

export const UserManagement = ({ users }: UserManagementProps) => { const {
    localUsers,
    isPending,
    selectedUser,
    isGrantAccessModalOpen,
    isBanModalOpen,
    isSessionsModalOpen,
    userSessions,
    handleUpdateUserRole,
    grantPaidAccess,
    handleRevokeAccess,
    handleBanUser,
    handleUnbanUser,
    handleGrantTrial,
    loadUserSessions,
    handleRevokeSession,
    handleRevokeAllSessions,
    openGrantAccessModal,
    openBanModal,
    openSessionsModal,
    closeModals, } = useUserManagement(users);

  // TanStack Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Column definitions
  const columns: ColumnDef<User>[] = useMemo(() => [
    { accessorKey: 'name',
      header: ({ column }: { column: Column<User, unknown> }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2 font-arabic hover:bg-white/20"
          >
            المستخدم
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }: { row: Row<User> }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-foreground font-arabic">{user.name || 'غير محدد'}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
        );
      },
      filterFn: (row: Row<User>, id: string, value: any) => {
        const user = row.original;
        const searchValue = value.toLowerCase();
        return (
          user.name?.toLowerCase().includes(searchValue) ||
          user.email.toLowerCase().includes(searchValue)
        );
      },
    },
    { accessorKey: 'role',
      header: ({ column }: { column: Column<User, unknown> }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2 font-arabic hover:bg-white/20"
          >
            الدور
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }: { row: Row<User> }) => {
        const user = row.original;
        return (
          <Select
            value={user.role}
            onValueChange={ (value: UserRole) => handleUpdateUserRole(user.id, value) }
            disabled={isPending}
          >
            <SelectTrigger className="w-28 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UserRole.STUDENT}>طالب</SelectItem>
              <SelectItem value={UserRole.TEACHER}>معلم</SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
    { accessorKey: 'accessType',
      header: ({ column }: { column: Column<User, unknown> }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2 w-max-content font-arabic hover:bg-white/20"
          >
            نوع الوصول
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }: { row: Row<User> }) => {
        const user = row.original;
        return (
          <Badge className={`text-xs w-max-content font-arabic px-3 py-1 ${accessTypeColors[user.accessType as StudentAccessType]}`}>
            {accessTypeLabels[user.accessType as StudentAccessType]}
          </Badge>
        );
      },
    },
    { id: 'status',
      header: () => <div className="font-arabic">الحالة</div>,
      cell: ({ row }: { row: Row<User> }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-2">
            {getStatusIcon(user)}
            <div className="text-sm">
              { user.role === UserRole.TEACHER ? (
                <span className="text-foreground font-arabic">نشط</span>
              ) : (
                <>
                  {user.accessType === StudentAccessType.FREE_TRIAL ? (
                    <span className="text-blue-600 dark:text-blue-400 font-arabic">{getTrialStatus(user) }</span>
                  ) : user.accessType === StudentAccessType.NO_ACCESS ? (
                    <span className="text-muted-foreground font-arabic">لا يوجد وصول</span>
                  ) : (
                    <span className="text-green-600 dark:text-green-400 font-arabic">مشترك</span>
                  )}
                </>
              )}
            </div>
          </div>
        );
      },
    },
    { id: 'accountStatus',
      header: () => <div className="font-arabic">حالة الحساب</div>,
      cell: ({ row }: { row: Row<User> }) => { const user = row.original;
        return (
          <div className="flex items-center gap-2">
            {user.banned ? (
              <>
                <UserX className="h-4 w-4 text-red-500" />
                <div className="text-sm">
                  <span className="text-red-600 dark:text-red-400 font-arabic">محظور</span>
                  {user.banReason && (
                    <div className="text-xs text-muted-foreground font-arabic">
                      السبب: {user.banReason }
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-600 dark:text-green-400 text-sm font-arabic">نشط</span>
              </>
            )}
          </div>
        );
      },
    },
    { accessorKey: 'paymentAmount',
      header: ({ column }: { column: Column<User, unknown> }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2 font-arabic hover:bg-white/20"
          >
            الدفع
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }: { row: Row<User> }) => { const user = row.original;
        if (user.role === UserRole.TEACHER) return null;

        return (
          <div className="text-sm">
            {user.paymentReceived ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <DollarSign className="h-3 w-3" />
                  <span className="font-arabic">تم الدفع</span>
                </div>
                {user.paymentAmount && (
                  <div className="text-xs text-muted-foreground font-arabic">{user.paymentAmount } ر.س</div>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground font-arabic">لم يتم الدفع</span>
            )}
          </div>
        );
      },
    },
    { id: 'actions',
      header: () => <div className="font-arabic">الإجراءات</div>,
      cell: ({ row }: { row: Row<User> }) => {
        const user = row.original;

        if (user.role === UserRole.TEACHER) {
          return <span className="text-muted-foreground text-sm font-arabic">معلم</span>;
        }

        return (
          <div className="flex flex-wrap items-center gap-1">
            {/* Access Management */}
            {!user.banned && (user.accessType === StudentAccessType.NO_ACCESS ||
                          (user.accessType === StudentAccessType.FREE_TRIAL &&
                            getTrialStatus(user)?.includes('انتهت'))) && (
              <Button
                variant="outline"
                size="sm"
                className="font-arabic h-7 text-xs"
                disabled={isPending}
                onClick={() => openGrantAccessModal(user)}
              >
                <UserPlus className="mr-1 h-3 w-3" />
                منح وصول
              </Button>
            )}

            {!user.banned && user.accessType === StudentAccessType.NO_ACCESS && !user.isTrialUsed && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGrantTrial(user.id)}
                className="font-arabic h-7 text-xs"
                disabled={isPending}
              >
                <Gift className="mr-1 h-3 w-3" />
                تجربة مجانية
              </Button>
            )}

            {!user.banned && (user.accessType === StudentAccessType.FULL_ACCESS ||
                          user.accessType === StudentAccessType.LIMITED_ACCESS) && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRevokeAccess(user.id)}
                className="font-arabic h-7 text-xs"
                disabled={isPending}
              >
                إلغاء الوصول
              </Button>
            )}

            {/* Ban/Unban */}
            {user.banned ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUnbanUser(user.id)}
                className="font-arabic h-7 text-xs text-green-600 border-green-600 hover:bg-green-50"
                disabled={isPending}
              >
                <Shield className="mr-1 h-3 w-3" />
                إلغاء الحظر
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="font-arabic h-7 text-xs text-red-600 border-red-600 hover:bg-red-50"
                disabled={isPending}
                onClick={() => openBanModal(user)}
              >
                <ShieldOff className="mr-1 h-3 w-3" />
                حظر
              </Button>
            )}

            {/* Session Management */}
            <Button
              variant="outline"
              size="sm"
              className="font-arabic h-7 text-xs"
              disabled={isPending}
              onClick={() => openSessionsModal(user)}
            >
              <Monitor className="mr-1 h-3 w-3" />
              الجلسات
            </Button>
          </div>
        );
      },
    },
  ], [isPending, handleUpdateUserRole, openGrantAccessModal, handleGrantTrial, handleRevokeAccess, handleUnbanUser, openBanModal, openSessionsModal]);

  // Initialize table
  const table = useReactTable({ data: localUsers,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row: Row<User>, columnId: string, value: any) => {
      const user = row.original;
      const searchValue = value.toLowerCase();
      return (
        user.name?.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue)
      ); },
    state: { sorting,
      columnFilters,
      globalFilter, },
    initialState: { pagination: {
        pageSize: 10, },
    },
  });

  return (
    <Card className="bg-white/60 dark:bg-white/10 backdrop-blur-xl border-white/20">
      <CardHeader>
        <CardTitle className="text-foreground font-arabic">
          إدارة المستخدمين ({table.getFilteredRowModel().rows.length} من أصل {localUsers.length})
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Search and Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="البحث عن المستخدمين..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="max-w-sm font-arabic"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground font-arabic">عرض</span>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                { [5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize } value={`${pageSize}`}>
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
              { table.getHeaderGroups().map((headerGroup: HeaderGroup<User>) => (
                <TableRow
                  key={headerGroup.id }
                  className="border-b border-white/20 bg-white/20 dark:bg-white/5"
                >
                  { headerGroup.headers.map((header: Header<User, unknown>) => (
                    <TableHead key={header.id } className="h-12">
                      { header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext()) }
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              { table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row: Row<User>, index: number) => (
                  <TableRow
                    key={row.id }
                    className={ cn(
                      'border-b border-white/10 transition-all duration-200 hover:bg-white/20 dark:hover:bg-white/10',
                      index % 2 === 0 ? 'bg-white/5' : 'bg-white/10 dark:bg-white/5'
                    ) }
                  >
                    { row.getVisibleCells().map((cell: Cell<User, unknown>) => (
                      <TableCell key={cell.id } className="py-4">
                        { flexRender(cell.column.columnDef.cell, cell.getContext()) }
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                        <Users className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <div className="text-muted-foreground font-arabic text-lg">
                        لم يتم العثور على مستخدمين
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground font-arabic">
            عرض {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} إلى{' '}
            { Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            ) }{' '}
            من أصل {table.getFilteredRowModel().rows.length} مستخدم
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="font-arabic"
            >
              <ChevronRight className="h-4 w-4 mr-1" />
              السابق
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="font-arabic"
            >
              التالي
              <ChevronLeft className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Modals */}
      <Dialog open={isGrantAccessModalOpen} onOpenChange={closeModals}>
        <DialogContent className="sm:max-w-[425px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-white/20">
          <DialogHeader>
            <DialogTitle className="font-arabic">منح وصول مدفوع</DialogTitle>
            <DialogDescription className="font-arabic">قم بتحديد نوع الوصول وإدخال تفاصيل الدفع</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <GrantAccessForm
              user={selectedUser}
              onGrantAccess={grantPaidAccess}
              isPending={isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isBanModalOpen} onOpenChange={closeModals}>
        <DialogContent className="sm:max-w-[425px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-white/20">
          <DialogHeader>
            <DialogTitle className="font-arabic">حظر المستخدم</DialogTitle>
            <DialogDescription className="font-arabic">قم بإدخال سبب الحظر ومدته (اختياري)</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <BanUserForm
              user={selectedUser}
              onBanUser={handleBanUser}
              isPending={isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isSessionsModalOpen} onOpenChange={closeModals}>
        <DialogContent className="sm:max-w-[600px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-white/20">
          <DialogHeader>
            <DialogTitle className="font-arabic">إدارة جلسات المستخدم</DialogTitle>
            <DialogDescription className="font-arabic">عرض وإدارة جلسات المستخدم النشطة</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <SessionsManager
              user={selectedUser}
              userSessions={userSessions}
              onLoadSessions={loadUserSessions}
              onRevokeSession={handleRevokeSession}
              onRevokeAllSessions={handleRevokeAllSessions}
              isPending={isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
