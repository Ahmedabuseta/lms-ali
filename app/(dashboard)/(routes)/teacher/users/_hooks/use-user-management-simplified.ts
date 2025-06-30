'use client';

import { useState, useTransition } from 'react';
import { toast } from 'react-hot-toast';
import { User, StudentAccessType } from '@/lib/types';

// API helper functions
const callUserAPI = async (action: string, userId: string, data?: any) => {
  const response = await fetch('/api/users', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      action,
      data,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'فشل في العملية');
  }

  return await response.json();
};

export const useUserManagement = () => {
  const [isPending, startTransition] = useTransition();

  const grantAccess = async (
    userId: string,
    accessType: StudentAccessType,
    paymentAmount?: number,
    paymentNotes?: string
  ) => {
    try {
      startTransition(async () => {
        await callUserAPI('grantAccess', userId, {
          accessType,
          paymentAmount,
          paymentNotes,
        });
        
        toast.success('تم منح الصلاحية بنجاح');
        
        // Refresh the page to show updated data
        window.location.reload();
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء منح الصلاحية');
    }
  };

  const banUser = async (
    userId: string,
    banReason: string,
    banDuration?: number
  ) => {
    try {
      startTransition(async () => {
        await callUserAPI('banUser', userId, {
          banReason,
          banDuration,
        });
        
        toast.success('تم حظر المستخدم بنجاح');
        
        // Refresh the page to show updated data
        window.location.reload();
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء حظر المستخدم');
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      startTransition(async () => {
        await callUserAPI('unbanUser', userId);
        
        toast.success('تم إلغاء حظر المستخدم بنجاح');
        
        // Refresh the page to show updated data
        window.location.reload();
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء إلغاء حظر المستخدم');
    }
  };

  const activateTrial = async (userId: string) => {
    try {
      startTransition(async () => {
        await callUserAPI('activateTrial', userId);
        
        toast.success('تم تفعيل الفترة التجريبية بنجاح');
        
        // Refresh the page to show updated data
        window.location.reload();
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء تفعيل الفترة التجريبية');
    }
  };

  return {
    grantAccess,
    banUser,
    unbanUser,
    activateTrial,
    isLoading: isPending,
  };
};
