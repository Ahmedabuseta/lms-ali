'use client';

import { useState, useMemo } from 'react';
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
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Users,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface UserManagementProps {
  users: User[];
}

type SortField = 'name' | 'email' | 'role' | 'accessType' | 'createdAt' | 'paymentAmount';
type SortDirection = 'asc' | 'desc';

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

  // Filtering and Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [accessTypeFilter, setAccessTypeFilter] = useState<StudentAccessType | 'ALL'>('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');

  // Sorting States
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filtered and Sorted Users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = localUsers.filter((user) => {
      // Search filter
      const searchMatch = 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      // Role filter
      const roleMatch = roleFilter === 'ALL' || user.role === roleFilter;

      // Access type filter
      const accessMatch = accessTypeFilter === 'ALL' || user.accessType === accessTypeFilter;

      // Payment status filter
      let paymentMatch = true;
      if (paymentStatusFilter === 'PAID') {
        paymentMatch = user.paymentReceived === true;
      } else if (paymentStatusFilter === 'UNPAID') {
        paymentMatch = user.paymentReceived === false || user.paymentReceived == null;
      }

      return searchMatch && roleMatch && accessMatch && paymentMatch;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle special cases
      if (sortField === 'name') {
        aValue = a.name || '';
        bValue = b.name || '';
      } else if (sortField === 'paymentAmount') {
        aValue = a.paymentAmount || 0;
        bValue = b.paymentAmount || 0;
      } else if (sortField === 'createdAt') {
        aValue = new Date(a.createdAt || 0).getTime();
        bValue = new Date(b.createdAt || 0).getTime();
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [localUsers, searchTerm, roleFilter, accessTypeFilter, paymentStatusFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const paginatedUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset pagination when filters change
  const resetPagination = () => setCurrentPage(1);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-foreground transition-colors font-arabic"
    >
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

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
        setIsGrantAccessModalOpen(false);
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
        <div className="text-sm text-muted-foreground font-arabic">
          منح وصول مدفوع للطالب: <strong>{user.name}</strong>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-foreground font-arabic">نوع الوصول</label>
            <Select value={accessType} onValueChange={(value: StudentAccessType) => setAccessType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={StudentAccessType.FULL_ACCESS}>
                  <div className="flex items-center gap-2 font-arabic">
                    <Video className="h-4 w-4" />
                    وصول كامل (مع الفيديوهات)
                  </div>
                </SelectItem>
                <SelectItem value={StudentAccessType.LIMITED_ACCESS}>
                  <div className="flex items-center gap-2 font-arabic">
                    <VideoOff className="h-4 w-4" />
                    وصول محدود (بدون فيديوهات)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground font-arabic">المبلغ المدفوع (اختياري)</label>
            <Input
              type="number"
              placeholder="0.00"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground font-arabic">ملاحظات الدفع (اختياري)</label>
            <Textarea
              placeholder="تفاصيل الدفع أو محادثة واتساب..."
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={handleGrantAccess} disabled={grantingAccess[user.id]} className="w-full font-arabic">
            <CreditCard className="mr-2 h-4 w-4" />
            {grantingAccess[user.id] ? 'جاري المنح...' : 'منح الوصول'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-white/60 dark:bg-white/10 backdrop-blur-xl border-white/20">
      <CardHeader>
        <CardTitle className="text-foreground font-arabic">
          إدارة المستخدمين ({filteredAndSortedUsers.length} من أصل {localUsers.length})
        </CardTitle>
        
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث بالاسم أو البريد الإلكتروني..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                resetPagination();
              }}
              className="pl-10 font-arabic"
            />
          </div>

          {/* Role Filter */}
          <Select
            value={roleFilter}
            onValueChange={(value: UserRole | 'ALL') => {
              setRoleFilter(value);
              resetPagination();
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="فلترة الأدوار" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">جميع الأدوار</SelectItem>
              <SelectItem value={UserRole.STUDENT}>طالب</SelectItem>
              <SelectItem value={UserRole.TEACHER}>معلم</SelectItem>
            </SelectContent>
          </Select>

          {/* Access Type Filter */}
          <Select
            value={accessTypeFilter}
            onValueChange={(value: StudentAccessType | 'ALL') => {
              setAccessTypeFilter(value);
              resetPagination();
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="نوع الوصول" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">جميع الأنواع</SelectItem>
              <SelectItem value={StudentAccessType.NO_ACCESS}>لا يوجد وصول</SelectItem>
              <SelectItem value={StudentAccessType.FREE_TRIAL}>تجربة مجانية</SelectItem>
              <SelectItem value={StudentAccessType.FULL_ACCESS}>وصول كامل</SelectItem>
              <SelectItem value={StudentAccessType.LIMITED_ACCESS}>وصول محدود</SelectItem>
            </SelectContent>
          </Select>

          {/* Payment Status Filter */}
          <Select
            value={paymentStatusFilter}
            onValueChange={(value: 'ALL' | 'PAID' | 'UNPAID') => {
              setPaymentStatusFilter(value);
              resetPagination();
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="حالة الدفع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">جميع الحالات</SelectItem>
              <SelectItem value="PAID">تم الدفع</SelectItem>
              <SelectItem value="UNPAID">لم يتم الدفع</SelectItem>
            </SelectContent>
          </Select>

          {/* Items per page */}
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(parseInt(value));
              resetPagination();
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 عناصر</SelectItem>
              <SelectItem value="10">10 عناصر</SelectItem>
              <SelectItem value="20">20 عنصر</SelectItem>
              <SelectItem value="50">50 عنصر</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {/* Enhanced Table Container */}
        <div className="rounded-xl border border-white/30 bg-gradient-to-br from-white/50 to-white/30 dark:from-white/10 dark:to-white/5 backdrop-blur-xl shadow-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/20 bg-white/20 dark:bg-white/5">
                <TableHead className="h-12">
                  <SortButton field="name">المستخدم</SortButton>
                </TableHead>
                <TableHead className="h-12">
                  <SortButton field="role">الدور</SortButton>
                </TableHead>
                <TableHead className="h-12">
                  <SortButton field="accessType">نوع الوصول</SortButton>
                </TableHead>
                <TableHead className="h-12 text-foreground font-arabic">الحالة</TableHead>
                <TableHead className="h-12">
                  <SortButton field="paymentAmount">الدفع</SortButton>
                </TableHead>
                <TableHead className="h-12 text-foreground font-arabic">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user, index) => (
                <TableRow 
                  key={user.id} 
                  className={cn(
                    "border-b border-white/10 transition-all duration-200 hover:bg-white/20 dark:hover:bg-white/10",
                    index % 2 === 0 ? "bg-white/5" : "bg-white/10 dark:bg-white/5"
                  )}
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-foreground font-arabic">{user.name || 'غير محدد'}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <Select value={user.role} onValueChange={(value: UserRole) => updateUserRole(user.id, value)}>
                      <SelectTrigger className="w-28 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UserRole.STUDENT}>طالب</SelectItem>
                        <SelectItem value={UserRole.TEACHER}>معلم</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell className="py-4">
                    <Badge className={cn('text-xs font-arabic px-3 py-1', accessTypeColors[user.accessType as StudentAccessType])}>
                      {accessTypeLabels[user.accessType as StudentAccessType]}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-4">
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
                  </TableCell>

                  <TableCell className="py-4">
                    {user.role === UserRole.STUDENT && (
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
                    )}
                  </TableCell>

                  <TableCell className="py-4">
                    {user.role === UserRole.STUDENT && (
                      <div className="flex items-center gap-2">
                        {(user.accessType === StudentAccessType.NO_ACCESS ||
                          (user.accessType === StudentAccessType.FREE_TRIAL &&
                            getTrialStatus(user)?.includes('انتهت'))) && (
                          <Dialog open={isGrantAccessModalOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                            setIsGrantAccessModalOpen(open);
                            if (open) setSelectedUser(user);
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="font-arabic h-8">
                                <UserPlus className="mr-2 h-3 w-3" />
                                منح وصول
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-white/20">
                              <DialogHeader>
                                <DialogTitle className="font-arabic">منح وصول مدفوع</DialogTitle>
                                <DialogDescription className="font-arabic">قم بتحديد نوع الوصول وإدخال تفاصيل الدفع</DialogDescription>
                              </DialogHeader>
                              <GrantAccessForm user={user} />
                            </DialogContent>
                          </Dialog>
                        )}

                        {(user.accessType === StudentAccessType.FULL_ACCESS ||
                          user.accessType === StudentAccessType.LIMITED_ACCESS) && (
                          <Button variant="destructive" size="sm" onClick={() => revokeAccess(user.id)} className="font-arabic h-8">
                            إلغاء الوصول
                          </Button>
                        )}

                        {user.paymentNotes && (
                          <div className="max-w-[180px] rounded-lg bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-400/30 p-2 text-xs">
                            <strong className="font-arabic text-amber-800 dark:text-amber-200">ملاحظات:</strong>
                            <p className="text-amber-700 dark:text-amber-300 mt-1">{user.paymentNotes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              
              {paginatedUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
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

        {/* Enhanced Pagination */}
        {filteredAndSortedUsers.length > 0 && (
          <div className="mt-8 space-y-4">
            {/* Pagination Stats */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground font-arabic bg-white/30 dark:bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm">
                عرض <span className="font-semibold text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> إلى{' '}
                <span className="font-semibold text-foreground">{Math.min(currentPage * itemsPerPage, filteredAndSortedUsers.length)}</span> من أصل{' '}
                <span className="font-semibold text-foreground">{filteredAndSortedUsers.length}</span> مستخدم
              </div>
              
              {totalPages > 1 && (
                <div className="text-sm text-muted-foreground font-arabic">
                  صفحة {currentPage} من {totalPages}
                </div>
              )}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 bg-white/40 dark:bg-white/10 rounded-xl p-2 backdrop-blur-xl border border-white/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="h-9 w-9 p-0 hover:bg-white/50 dark:hover:bg-white/20"
                    title="الصفحة الأولى"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-9 w-9 p-0 hover:bg-white/50 dark:hover:bg-white/20"
                    title="الصفحة السابقة"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1 mx-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNumber)}
                          className={cn(
                            "h-9 w-9 p-0 transition-all duration-200",
                            currentPage === pageNumber 
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-700 hover:to-purple-700" 
                              : "hover:bg-white/50 dark:hover:bg-white/20"
                          )}
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-9 w-9 p-0 hover:bg-white/50 dark:hover:bg-white/20"
                    title="الصفحة التالية"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-9 w-9 p-0 hover:bg-white/50 dark:hover:bg-white/20"
                    title="الصفحة الأخيرة"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
