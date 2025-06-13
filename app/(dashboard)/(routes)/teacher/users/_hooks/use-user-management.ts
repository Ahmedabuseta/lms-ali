'use client';

import { useState, useMemo, useTransition } from 'react';
import { toast } from 'react-hot-toast';
import { User, UserRole, StudentAccessType } from '@/lib/types';

type SortField = 'name' | 'email' | 'role' | 'accessType' | 'createdAt' | 'paymentAmount';
type SortDirection = 'asc' | 'desc';

// API helper functions
const callUserAPI = async (action: string, userId: string, data?: any) => { const response = await fetch('/api/users', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json', },
    body: JSON.stringify({ userId,
      action,
      data, }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API call failed');
  }

  return await response.json();
};

export const useUserManagement = (initialUsers: User[]) => { const [localUsers, setLocalUsers] = useState(initialUsers);
  const [isPending, startTransition] = useTransition();

  // Filtering and Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [accessTypeFilter, setAccessTypeFilter] = useState<StudentAccessType | 'ALL'>('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [banStatusFilter, setBanStatusFilter] = useState<'ALL' | 'BANNED' | 'ACTIVE'>('ALL');

  // Sorting States
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal States
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isGrantAccessModalOpen, setIsGrantAccessModalOpen] = useState(false);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);
  const [userSessions, setUserSessions] = useState<any[]>([]);

  // Update user in local state
  const updateUserInState = (userId: string, updates: Partial<User>) => {
    setLocalUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, ...updates } : user
      )
    );
  };

  // Filtered and Sorted Users
  const filteredAndSortedUsers = useMemo(() => {
    const filtered = localUsers.filter((user) => {
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

      // Ban status filter
      let banMatch = true;
      if (banStatusFilter === 'BANNED') {
        banMatch = user.banned === true;
      } else if (banStatusFilter === 'ACTIVE') {
        banMatch = user.banned !== true;
      }

      return searchMatch && roleMatch && accessMatch && paymentMatch && banMatch;
    });

    // Sorting
    filtered.sort((a, b) => { let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle special cases
      if (sortField === 'name') {
        aValue = a.name || '';
        bValue = b.name || ''; } else if (sortField === 'paymentAmount') {
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

      if (sortDirection === 'asc') { return aValue < bValue ? -1 : aValue > bValue ? 1 : 0; } else { return aValue > bValue ? -1 : aValue < bValue ? 1 : 0; }
    });

    return filtered;
  }, [localUsers, searchTerm, roleFilter, accessTypeFilter, paymentStatusFilter, banStatusFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const paginatedUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset pagination when filters change
  const resetPagination = () => setCurrentPage(1);

  // Sorting handlers
  const handleSort = (field: SortField) => { if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // User management handlers
  const handleUpdateUserRole = async (userId: string, role: UserRole) => { startTransition(async () => {
      try {
        const result = await callUserAPI('updateRole', userId, { role });

        updateUserInState(userId, { role });
        toast.success('تم تحديث الدور بنجاح');
      } catch (error) { console.error('Error updating user role:', error);
        toast.error('حدث خطأ أثناء التحديث'); }
    });
  };

  const handleRevokeAccess = async (userId: string) => { startTransition(async () => {
      try {
        await callUserAPI('revokeAccess', userId);

        updateUserInState(userId, {
          accessType: StudentAccessType.NO_ACCESS,
          paymentReceived: false, });
        toast.success('تم إلغاء الوصول');
      } catch (error) { console.error('Error revoking access:', error);
        toast.error('حدث خطأ أثناء إلغاء الوصول'); }
    });
  };

  const handleUnbanUser = async (userId: string) => { startTransition(async () => {
      try {
        await callUserAPI('unbanUser', userId);

        updateUserInState(userId, {
          banned: false,
          banReason: null,
          banExpires: null, });
        toast.success('تم إلغاء حظر المستخدم');
      } catch (error) { console.error('Error unbanning user:', error);
        toast.error('حدث خطأ أثناء إلغاء الحظر'); }
    });
  };

  const handleGrantTrial = async (userId: string) => { startTransition(async () => {
      try {
        await callUserAPI('grantTrial', userId);

        updateUserInState(userId, {
          accessType: StudentAccessType.FREE_TRIAL,
          isTrialUsed: true,
          trialStartDate: new Date(),
          trialEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), });
        toast.success('تم منح تجربة مجانية');
      } catch (error) { console.error('Error granting trial:', error);
        toast.error('حدث خطأ أثناء منح التجربة المجانية'); }
    });
  };

  const grantPaidAccess = async (userId: string, accessType: StudentAccessType, paymentAmount?: number, paymentNotes?: string) => { startTransition(async () => {
      try {
        await callUserAPI('grantAccess', userId, {
          accessType,
          paymentReceived: true,
          paymentAmount,
          paymentNotes, });

        updateUserInState(userId, { accessType,
          paymentReceived: true,
          paymentAmount: paymentAmount || 0,
          paymentNotes: paymentNotes || '',
          accessGrantedAt: new Date(), });
        toast.success('تم منح الوصول بنجاح');
      } catch (error) { console.error('Error granting access:', error);
        toast.error('حدث خطأ أثناء منح الوصول'); }
    });
  };

  const handleBanUser = async (userId: string, reason: string, duration?: number) => { startTransition(async () => {
      try {
        await callUserAPI('banUser', userId, { reason, duration });

        updateUserInState(userId, { banned: true,
          banReason: reason,
          banExpires: duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null, } as any);
        toast.success('تم حظر المستخدم بنجاح');
      } catch (error) { console.error('Error banning user:', error);
        toast.error('حدث خطأ أثناء حظر المستخدم'); }
    });
  };

  const loadUserSessions = async (userId: string) => { try {
      // For now, set empty sessions - implement API call when sessions endpoint is ready
      setUserSessions([]); } catch (error) { console.error('Error loading user sessions:', error);
      setUserSessions([]); }
  };

  const handleRevokeSession = async (sessionToken: string) => {
    startTransition(async () => {
      try {
        // Mock implementation - replace with actual API call when sessions endpoint is ready
        toast.success('تم إلغاء الجلسة بنجاح');
        // Reload sessions
        if (selectedUser) {
          loadUserSessions(selectedUser.id);
        }
      } catch (error) { console.error('Error revoking session:', error);
        toast.error('حدث خطأ أثناء إلغاء الجلسة'); }
    });
  };

  const handleRevokeAllSessions = async (userId: string) => {
    startTransition(async () => {
      try {
        // Mock implementation - replace with actual API call when sessions endpoint is ready
        toast.success('تم إلغاء جميع الجلسات بنجاح');
        setUserSessions([]);
      } catch (error) { console.error('Error revoking all sessions:', error);
        toast.error('حدث خطأ أثناء إلغاء الجلسات'); }
    });
  };

  // Modal handlers
  const openGrantAccessModal = (user: User) => {
    setSelectedUser(user);
    setIsGrantAccessModalOpen(true);
  };

  const openBanModal = (user: User) => {
    setSelectedUser(user);
    setIsBanModalOpen(true);
  };

  const openSessionsModal = (user: User) => {
    setSelectedUser(user);
    setIsSessionsModalOpen(true);
  };

  const closeModals = () => {
    setIsGrantAccessModalOpen(false);
    setIsBanModalOpen(false);
    setIsSessionsModalOpen(false);
    setSelectedUser(null);
  };

  return { // State
    localUsers,
    isPending,
    selectedUser,
    isGrantAccessModalOpen,
    isBanModalOpen,
    isSessionsModalOpen,
    userSessions,

    // Filters
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    accessTypeFilter,
    setAccessTypeFilter,
    paymentStatusFilter,
    setPaymentStatusFilter,
    banStatusFilter,
    setBanStatusFilter,

    // Sorting
    sortField,
    sortDirection,
    handleSort,

    // Pagination
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    resetPagination,

    // Data
    filteredAndSortedUsers,
    paginatedUsers,

    // Actions
    updateUserInState,
    handleUpdateUserRole,
    grantPaidAccess,
    handleRevokeAccess,
    handleBanUser,
    handleUnbanUser,
    handleGrantTrial,
    loadUserSessions,
    handleRevokeSession,
    handleRevokeAllSessions,

    // Modals
    openGrantAccessModal,
    openBanModal,
    openSessionsModal,
    closeModals, };
};
