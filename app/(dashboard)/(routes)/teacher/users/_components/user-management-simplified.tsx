'use client';

import { useState, useMemo, useCallback } from 'react';
import { Search, Filter, MoreVertical, CheckCircle, XCircle, Clock, Shield, Monitor, User as UserIcon } from 'lucide-react';
import { User as UserType, UserRole, StudentAccessType } from '@/lib/types';
import { useUserManagement } from '../_hooks/use-user-management-simplified';
import { GrantAccessForm } from './grant-access-form-simplified';
import { BanUserForm } from './ban-user-form-simplified';
import { SessionManager } from './session-manager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface UserManagementProps {
  users: UserType[];
}

// Simplified user card component for mobile-first design
const UserCard = ({ user, onGrantAccess, onBanUser, onImpersonate }: {
  user: UserType;
  onGrantAccess: (user: UserType) => void;
  onBanUser: (user: UserType) => void;
  onImpersonate: (user: UserType) => void;
}) => {
  const getAccessBadge = () => {
    switch (user.accessType) {
      case StudentAccessType.FULL_ACCESS:
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">وصول كامل</Badge>;
      case StudentAccessType.LIMITED_ACCESS:
        return <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">وصول محدود</Badge>;
      case StudentAccessType.FREE_TRIAL:
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">فترة تجربة</Badge>;
      case StudentAccessType.NO_ACCESS:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">بدون وصول</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const getRoleBadge = () => {
    return user.role === UserRole.TEACHER ? (
      <Badge variant="default" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
        <Shield className="w-3 h-3 mr-1" />
        مدرس
      </Badge>
    ) : (
      <Badge variant="outline">طالب</Badge>
    );
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate">
                {user.name || 'بدون اسم'}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onGrantAccess(user)}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  منح صلاحية
                </DropdownMenuItem>
                {user.role === UserRole.STUDENT && (
                  <DropdownMenuItem onClick={() => onImpersonate(user)}>
                    <UserIcon className="w-4 h-4 mr-2" />
                    تسجيل دخول كـ
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onBanUser(user)}
                  className="text-destructive"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  حظر المستخدم
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {getRoleBadge()}
            {getAccessBadge()}
            {user.banned && (
              <Badge variant="destructive">محظور</Badge>
            )}
          </div>

          {/* Meta Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div>انضم: {new Date(user.createdAt).toLocaleDateString('ar-SA')}</div>
            {user.paymentReceived && (
              <div className="text-green-600 dark:text-green-400">
                تم استلام الدفع {user.paymentAmount ? `(${user.paymentAmount} ر.س)` : ''}
              </div>
            )}
            {user.trialEndDate && user.accessType === StudentAccessType.FREE_TRIAL && (
              <div className="text-orange-600 dark:text-orange-400">
                تنتهي التجربة: {new Date(user.trialEndDate).toLocaleDateString('ar-SA')}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function UserManagement({ users }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [accessFilter, setAccessFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [dialogType, setDialogType] = useState<'grant' | 'ban' | null>(null);
  const [isSessionManagerOpen, setIsSessionManagerOpen] = useState(false);

  const { 
    grantAccess, 
    banUser, 
    isLoading 
  } = useUserManagement();

  // Optimized filtering with useMemo
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = searchTerm === '' || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      const matchesAccess = accessFilter === 'all' || user.accessType === accessFilter;

      return matchesSearch && matchesRole && matchesAccess;
    });
  }, [users, searchTerm, roleFilter, accessFilter]);

  const handleGrantAccess = useCallback((user: UserType) => {
    setSelectedUser(user);
    setDialogType('grant');
  }, []);

  const handleBanUser = useCallback((user: UserType) => {
    setSelectedUser(user);
    setDialogType('ban');
  }, []);

  const handleImpersonate = useCallback(async (user: UserType) => {
    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) throw new Error('Failed to impersonate user');

      toast.success(`تم تسجيل الدخول كـ ${user.name || user.email}`);
      
      // Open impersonated session in new tab
      window.open('/dashboard', '_blank');
    } catch (error) {
      toast.error('فشل في تسجيل الدخول كمستخدم');
      console.error('Error impersonating user:', error);
    }
  }, []);

  const handleCloseDialog = useCallback(() => {
    setSelectedUser(null);
    setDialogType(null);
  }, []);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredUsers.length;
    const students = filteredUsers.filter(u => u.role === UserRole.STUDENT).length;
    const teachers = filteredUsers.filter(u => u.role === UserRole.TEACHER).length;
    const active = filteredUsers.filter(u => 
      u.accessType === StudentAccessType.FULL_ACCESS || 
      u.accessType === StudentAccessType.LIMITED_ACCESS
    ).length;

    return { total, students, teachers, active };
  }, [filteredUsers]);

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-lg font-medium mb-2">لا توجد بيانات مستخدمين</h3>
        <p className="text-muted-foreground">لم يتم العثور على أي مستخدمين في النظام.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث بالبريد الإلكتروني أو الاسم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
            dir="rtl"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="تصفية حسب الدور" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأدوار</SelectItem>
              <SelectItem value={UserRole.STUDENT}>طالب</SelectItem>
              <SelectItem value={UserRole.TEACHER}>مدرس</SelectItem>
            </SelectContent>
          </Select>

          <Select value={accessFilter} onValueChange={setAccessFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="تصفية حسب الصلاحية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الصلاحيات</SelectItem>
              <SelectItem value={StudentAccessType.FULL_ACCESS}>وصول كامل</SelectItem>
              <SelectItem value={StudentAccessType.LIMITED_ACCESS}>وصول محدود</SelectItem>
              <SelectItem value={StudentAccessType.FREE_TRIAL}>فترة تجربة</SelectItem>
              <SelectItem value={StudentAccessType.NO_ACCESS}>بدون وصول</SelectItem>
            </SelectContent>
          </Select>

          {/* Session Manager Button */}
          <Button 
            variant="outline" 
            onClick={() => setIsSessionManagerOpen(true)}
            className="w-full sm:w-auto flex items-center gap-2"
          >
            <Monitor className="h-4 w-4" />
            إدارة الجلسات
          </Button>

          {/* Clear Filters */}
          {(searchTerm || roleFilter !== 'all' || accessFilter !== 'all') && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setAccessFilter('all');
              }}
              className="w-full sm:w-auto"
            >
              مسح التصفية
            </Button>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>المجموع: {stats.total}</span>
          <span>الطلاب: {stats.students}</span>
          <span>المدرسين: {stats.teachers}</span>
          <span>النشطين: {stats.active}</span>
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium mb-2">لم يتم العثور على نتائج</h3>
          <p className="text-muted-foreground">جرب تغيير معايير البحث أو التصفية.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onGrantAccess={handleGrantAccess}
              onBanUser={handleBanUser}
              onImpersonate={handleImpersonate}
            />
          ))}
        </div>
      )}

      {/* Grant Access Dialog */}
      <Dialog open={dialogType === 'grant'} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>منح صلاحية الوصول</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <GrantAccessForm
              user={selectedUser}
              onSuccess={handleCloseDialog}
              onCancel={handleCloseDialog}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={dialogType === 'ban'} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>حظر المستخدم</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <BanUserForm
              user={selectedUser}
              onSuccess={handleCloseDialog}
              onCancel={handleCloseDialog}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Session Manager */}
      <SessionManager
        isOpen={isSessionManagerOpen}
        onClose={() => setIsSessionManagerOpen(false)}
      />
    </div>
  );
}
