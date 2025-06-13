'use client';

import { Search } from 'lucide-react';
import { UserRole, StudentAccessType } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserFiltersProps { searchTerm: string;
  setSearchTerm: (value: string) => void;
  roleFilter: UserRole | 'ALL';
  setRoleFilter: (value: UserRole | 'ALL') => void;
  accessTypeFilter: StudentAccessType | 'ALL';
  setAccessTypeFilter: (value: StudentAccessType | 'ALL') => void;
  paymentStatusFilter: 'ALL' | 'PAID' | 'UNPAID';
  setPaymentStatusFilter: (value: 'ALL' | 'PAID' | 'UNPAID') => void;
  banStatusFilter: 'ALL' | 'BANNED' | 'ACTIVE';
  setBanStatusFilter: (value: 'ALL' | 'BANNED' | 'ACTIVE') => void;
  itemsPerPage: number;
  setItemsPerPage: (value: number) => void;
  onFilterChange: () => void; }

export const UserFilters = ({ searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  accessTypeFilter,
  setAccessTypeFilter,
  paymentStatusFilter,
  setPaymentStatusFilter,
  banStatusFilter,
  setBanStatusFilter,
  itemsPerPage,
  setItemsPerPage,
  onFilterChange, }: UserFiltersProps) => { const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onFilterChange(); };

  const handleRoleFilterChange = (value: UserRole | 'ALL') => {
    setRoleFilter(value);
    onFilterChange();
  };

  const handleAccessTypeFilterChange = (value: StudentAccessType | 'ALL') => {
    setAccessTypeFilter(value);
    onFilterChange();
  };

  const handlePaymentStatusFilterChange = (value: 'ALL' | 'PAID' | 'UNPAID') => {
    setPaymentStatusFilter(value);
    onFilterChange();
  };

  const handleBanStatusFilterChange = (value: 'ALL' | 'BANNED' | 'ACTIVE') => {
    setBanStatusFilter(value);
    onFilterChange();
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    onFilterChange();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mt-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="البحث بالاسم أو البريد الإلكتروني..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 font-arabic"
        />
      </div>

      {/* Role Filter */}
      <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
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
      <Select value={accessTypeFilter} onValueChange={handleAccessTypeFilterChange}>
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
      <Select value={paymentStatusFilter} onValueChange={handlePaymentStatusFilterChange}>
        <SelectTrigger>
          <SelectValue placeholder="حالة الدفع" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">جميع الحالات</SelectItem>
          <SelectItem value="PAID">تم الدفع</SelectItem>
          <SelectItem value="UNPAID">لم يتم الدفع</SelectItem>
        </SelectContent>
      </Select>

      {/* Ban Status Filter */}
      <Select value={banStatusFilter} onValueChange={handleBanStatusFilterChange}>
        <SelectTrigger>
          <SelectValue placeholder="حالة الحظر" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">جميع المستخدمين</SelectItem>
          <SelectItem value="ACTIVE">المستخدمون النشطون</SelectItem>
          <SelectItem value="BANNED">المستخدمون المحظورون</SelectItem>
        </SelectContent>
      </Select>

      {/* Items per page */}
      <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
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
  );
};
