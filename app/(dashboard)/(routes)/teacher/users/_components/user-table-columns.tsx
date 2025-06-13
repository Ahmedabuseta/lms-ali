'use client';

import { ColumnDef } from '@tanstack/react-table';
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Video,
  VideoOff,
  UserPlus,
  Shield,
  ShieldOff,
  Monitor,
  UserX,
  Gift,
  ArrowUpDown,
} from 'lucide-react';
import { User, UserRole, StudentAccessType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { GrantAccessForm } from './grant-access-form';
import { BanUserForm } from './ban-user-form';
import { SessionsManager } from './sessions-manager';

const accessTypeLabels: Record<StudentAccessType, string> = {
  NO_ACCESS: 'لا يوجد وصول',
  FREE_TRIAL: 'تجربة مجانية',
  FULL_ACCESS: 'وصول كامل مدفوع',
  LIMITED_ACCESS: 'وصول محدود مدفوع',
};

const accessTypeColors: Record<StudentAccessType, string> = {
  NO_ACCESS: 'bg-muted text-muted-foreground',
  FREE_TRIAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  FULL_ACCESS: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  LIMITED_ACCESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
};

export interface UserTableActions {
  onUpdateRole: (userId: string, role: UserRole) => void;
  onGrantAccess: (userId: string, accessType: StudentAccessType, paymentAmount?: number, paymentNotes?: string) => void;
  onRevokeAccess: (userId: string) => void;
  onBanUser: (userId: string, reason: string, duration?: number) => void;
  onUnbanUser: (userId: string) => void;
  onGrantTrial: (userId: string) => void;
  openGrantAccessModal: (user: User) => void;
  openBanModal: (user: User) => void;
  openSessionsModal: (user: User) => void;
  isPending: boolean;
}

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

  switch (user.accessType) {
    case StudentAccessType.NO_ACCESS:
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
      return <XCircle className="h-5 w-5 text-muted-foreground" />;
  }
};

export const createUserColumns = (actions: UserTableActions): ColumnDef<User>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => {
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
    cell: ({ row }) => {
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
    filterFn: (row, id, value) => {
      const user = row.original;
      const searchValue = value.toLowerCase();
      return (
        user.name?.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue)
      );
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => {
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
    cell: ({ row }) => {
      const user = row.original;
      return (
        <Select 
          value={user.role} 
          onValueChange={(value: UserRole) => actions.onUpdateRole(user.id, value)}
          disabled={actions.isPending}
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
  {
    accessorKey: 'accessType',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2 font-arabic hover:bg-white/20"
        >
          نوع الوصول
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original;
      return (
        <Badge className={`text-xs font-arabic px-3 py-1 ${accessTypeColors[user.accessType as StudentAccessType]}`}>
          {accessTypeLabels[user.accessType as StudentAccessType]}
        </Badge>
      );
    },
  },
  {
    id: 'status',
    header: () => <div className="font-arabic">الحالة</div>,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-2">
          {getStatusIcon(user)}
          <div className="text-sm">
            {user.role === UserRole.TEACHER ? (
              <span className="text-foreground font-arabic">نشط</span>
            ) : (
              <>
                {user.accessType === StudentAccessType.FREE_TRIAL ? (
                  <span className="text-blue-600 dark:text-blue-400 font-arabic">{getTrialStatus(user)}</span>
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
  {
    id: 'accountStatus',
    header: () => <div className="font-arabic">حالة الحساب</div>,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-2">
          {user.banned ? (
            <>
              <UserX className="h-4 w-4 text-red-500" />
              <div className="text-sm">
                <span className="text-red-600 dark:text-red-400 font-arabic">محظور</span>
                {user.banReason && (
                  <div className="text-xs text-muted-foreground font-arabic">
                    السبب: {user.banReason}
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
  {
    accessorKey: 'paymentAmount',
    header: ({ column }) => {
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
    cell: ({ row }) => {
      const user = row.original;
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
                <div className="text-xs text-muted-foreground font-arabic">{user.paymentAmount} ر.س</div>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground font-arabic">لم يتم الدفع</span>
          )}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: () => <div className="font-arabic">الإجراءات</div>,
    cell: ({ row }) => {
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
              disabled={actions.isPending}
              onClick={() => actions.openGrantAccessModal(user)}
            >
              <UserPlus className="mr-1 h-3 w-3" />
              منح وصول
            </Button>
          )}

          {!user.banned && user.accessType === StudentAccessType.NO_ACCESS && !user.isTrialUsed && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => actions.onGrantTrial(user.id)} 
              className="font-arabic h-7 text-xs"
              disabled={actions.isPending}
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
              onClick={() => actions.onRevokeAccess(user.id)} 
              className="font-arabic h-7 text-xs"
              disabled={actions.isPending}
            >
              إلغاء الوصول
            </Button>
          )}

          {/* Ban/Unban */}
          {user.banned ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => actions.onUnbanUser(user.id)} 
              className="font-arabic h-7 text-xs text-green-600 border-green-600 hover:bg-green-50"
              disabled={actions.isPending}
            >
              <Shield className="mr-1 h-3 w-3" />
              إلغاء الحظر
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="font-arabic h-7 text-xs text-red-600 border-red-600 hover:bg-red-50" 
              disabled={actions.isPending}
              onClick={() => actions.openBanModal(user)}
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
            disabled={actions.isPending}
            onClick={() => actions.openSessionsModal(user)}
          >
            <Monitor className="mr-1 h-3 w-3" />
            الجلسات
          </Button>
        </div>
      );
    },
  },
]; 