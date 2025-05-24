'use client';

import { useState } from 'react';
import { User, UserRole, StudentAccessType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  MessageCircle,
  Video,
  VideoOff,
  CreditCard,
  UserPlus,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface UserManagementProps {
  users: User[];
}

const roleLabels: Record<UserRole, string> = {
  STUDENT: 'طالب',
  TEACHER: 'معلم',
};

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

const roleColors: Record<UserRole, string> = {
  STUDENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  TEACHER: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

export const UserManagement = ({ users }: UserManagementProps) => {
  const [localUsers, setLocalUsers] = useState(users);
  const [grantingAccess, setGrantingAccess] = useState<{ [key: string]: boolean }>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isGrantAccessModalOpen, setIsGrantAccessModalOpen] = useState(false);

  const updateUserRole = async (userId: string, role: UserRole) => {
    try {
      const response = await fetch(`/api/user/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (response.ok) {
        setLocalUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role } : user)));
        toast.success('تم تحديث الدور بنجاح');
      } else {
        toast.error('فشل في تحديث الدور');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء التحديث');
    }
  };

  const grantPaidAccess = async (
    userId: string,
    accessType: StudentAccessType,
    paymentAmount?: number,
    paymentNotes?: string,
  ) => {
    setGrantingAccess((prev) => ({ ...prev, [userId]: true }));

    try {
      const response = await fetch(`/api/user/${userId}/grant-access`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessType,
          paymentAmount: paymentAmount || undefined,
          paymentNotes: paymentNotes || undefined,
        }),
      });

      if (response.ok) {
        setLocalUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  accessType,
                  paymentReceived: true,
                  paymentAmount: paymentAmount || user.paymentAmount,
                  paymentNotes: paymentNotes || user.paymentNotes,
                  accessGrantedAt: new Date(),
                }
              : user,
          ),
        );
        toast.success('تم منح الوصول بنجاح');
      } else {
        toast.error('فشل في منح الوصول');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء منح الوصول');
    } finally {
      setGrantingAccess((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const revokeAccess = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/${userId}/revoke-access`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setLocalUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  accessType: StudentAccessType.NO_ACCESS,
                  paymentReceived: false,
                }
              : user,
          ),
        );
        toast.success('تم إلغاء الوصول');
      } else {
        toast.error('فشل في إلغاء الوصول');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء إلغاء الوصول');
    }
  };

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

  const GrantAccessForm = ({ user }: { user: User }) => {
    const [accessType, setAccessType] = useState<StudentAccessType>(StudentAccessType.FULL_ACCESS);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentNotes, setPaymentNotes] = useState('');

    const handleGrantAccess = () => {
      grantPaidAccess(
        user.id,
        accessType,
        paymentAmount ? parseFloat(paymentAmount) : undefined,
        paymentNotes || undefined,
      );
    };

    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          منح وصول مدفوع للطالب: <strong>{user.name}</strong>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-foreground">نوع الوصول</label>
            <Select value={accessType} onValueChange={(value: StudentAccessType) => setAccessType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={StudentAccessType.FULL_ACCESS}>
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    وصول كامل (مع الفيديوهات)
                  </div>
                </SelectItem>
                <SelectItem value={StudentAccessType.LIMITED_ACCESS}>
                  <div className="flex items-center gap-2">
                    <VideoOff className="h-4 w-4" />
                    وصول محدود (بدون فيديوهات)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">المبلغ المدفوع (اختياري)</label>
            <Input
              type="number"
              placeholder="0.00"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">ملاحظات الدفع (اختياري)</label>
            <Textarea
              placeholder="تفاصيل الدفع أو محادثة واتساب..."
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={handleGrantAccess} disabled={grantingAccess[user.id]} className="w-full">
            <CreditCard className="mr-2 h-4 w-4" />
            {grantingAccess[user.id] ? 'جاري المنح...' : 'منح الوصول'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">إدارة المستخدمين ({localUsers.length})</CardTitle>
        <div className="text-sm text-muted-foreground">
          <p>إدارة وصول المستخدمين ومنح الاشتراكات المدفوعة</p>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-foreground">المستخدم</TableHead>
              <TableHead className="text-foreground">الدور</TableHead>
              <TableHead className="text-foreground">نوع الوصول</TableHead>
              <TableHead className="text-foreground">الحالة</TableHead>
              <TableHead className="text-foreground">الدفع</TableHead>
              <TableHead className="text-foreground">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="font-medium text-foreground">{user.name || 'غير محدد'}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </TableCell>

                <TableCell>
                  <Select value={user.role} onValueChange={(value: UserRole) => updateUserRole(user.id, value)}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.STUDENT}>طالب</SelectItem>
                      <SelectItem value={UserRole.TEACHER}>معلم</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>

                <TableCell>
                  <Badge className={cn('text-xs', accessTypeColors[user.accessType as StudentAccessType])}>
                    {accessTypeLabels[user.accessType as StudentAccessType]}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(user)}
                    <div className="text-sm">
                      {user.role === UserRole.TEACHER ? (
                        <span className="text-foreground">نشط</span>
                      ) : (
                        <>
                          {user.accessType === StudentAccessType.FREE_TRIAL ? (
                            <span className="text-blue-600 dark:text-blue-400">{getTrialStatus(user)}</span>
                          ) : user.accessType === StudentAccessType.NO_ACCESS ? (
                            <span className="text-muted-foreground">لا يوجد وصول</span>
                          ) : (
                            <span className="text-green-600 dark:text-green-400">مشترك</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  {user.role === UserRole.STUDENT && (
                    <div className="text-sm">
                      {user.paymentReceived ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <DollarSign className="h-3 w-3" />
                            <span>تم الدفع</span>
                          </div>
                          {user.paymentAmount && (
                            <div className="text-xs text-muted-foreground">{user.paymentAmount} ر.س</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">لم يتم الدفع</span>
                      )}
                    </div>
                  )}
                </TableCell>

                <TableCell>
                  {user.role === UserRole.STUDENT && (
                    <div className="space-y-2">
                      {(user.accessType === StudentAccessType.NO_ACCESS ||
                        (user.accessType === StudentAccessType.FREE_TRIAL &&
                          getTrialStatus(user)?.includes('انتهت'))) && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <UserPlus className="mr-2 h-4 w-4" />
                              منح وصول
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>منح وصول مدفوع</DialogTitle>
                              <DialogDescription>قم بتحديد نوع الوصول وإدخال تفاصيل الدفع</DialogDescription>
                            </DialogHeader>
                            <GrantAccessForm user={user} />
                          </DialogContent>
                        </Dialog>
                      )}

                      {(user.accessType === StudentAccessType.FULL_ACCESS ||
                        user.accessType === StudentAccessType.LIMITED_ACCESS) && (
                        <Button variant="destructive" size="sm" onClick={() => revokeAccess(user.id)}>
                          إلغاء الوصول
                        </Button>
                      )}

                      {user.paymentNotes && (
                        <div className="max-w-[200px] rounded bg-muted/50 p-2 text-xs text-muted-foreground">
                          <strong>ملاحظات:</strong> {user.paymentNotes}
                        </div>
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
