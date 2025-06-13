'use client';

import { useState, useEffect, useCallback } from 'react';

interface UserPermissions { canAccessVideos: boolean;
  canAccessCourses: boolean;
  canAccessExams: boolean;
  canAccessFlashcards: boolean;
  canAccessPractice: boolean;
  canAccessAI: boolean;
  isTeacher: boolean;
  accessType: string;
  canStartTrial: boolean;
  trialDaysLeft: number;
  isTrialExpired: boolean; }

interface PermissionsState { permissions: UserPermissions | null;
  loading: boolean;
  error: string | null; }

// Cache permissions in memory with timestamp
let permissionsCache: { data: UserPermissions | null;
  timestamp: number; } | null = null;

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export function usePermissions() { const [state, setState] = useState<PermissionsState>({
    permissions: null,
    loading: true,
    error: null, });

  const fetchPermissions = useCallback(async (forceRefresh = false) => { try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Check cache first (unless force refresh)
      if (!forceRefresh && permissionsCache) { const now = Date.now();
        const isValid = (now - permissionsCache.timestamp) < CACHE_DURATION;

        if (isValid && permissionsCache.data) {
          setState({
            permissions: permissionsCache.data,
            loading: false,
            error: null, });
          return permissionsCache.data;
        }
      }

      // Fetch fresh permissions
      const response = await fetch('/api/user/permissions');

      if (response.status === 401) { // User is not authenticated
        setState({
          permissions: null,
          loading: false,
          error: 'Unauthorized', });
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }

      const permissions = await response.json();

      // Update cache
      permissionsCache = { data: permissions,
        timestamp: Date.now(), };

      setState({ permissions,
        loading: false,
        error: null, });

      return permissions;
    } catch (error) { console.error('Failed to fetch permissions:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error', }));
      return null;
    }
  }, []);

  const refreshPermissions = useCallback(() => {
    return fetchPermissions(true);
  }, [fetchPermissions]);

  const hasPermission = useCallback((permission: keyof UserPermissions): boolean => {
    return state.permissions?.[permission] === true;
  }, [state.permissions]);

  const isTeacher = useCallback((): boolean => {
    return state.permissions?.isTeacher === true;
  }, [state.permissions]);

  const canStartTrial = useCallback((): boolean => {
    return state.permissions?.canStartTrial === true;
  }, [state.permissions]);

  const getTrialDaysLeft = useCallback((): number => {
    return state.permissions?.trialDaysLeft || 0;
  }, [state.permissions]);

  const isTrialExpired = useCallback((): boolean => {
    return state.permissions?.isTrialExpired === true;
  }, [state.permissions]);

  const getAccessType = useCallback((): string => {
    return state.permissions?.accessType || 'NO_ACCESS';
  }, [state.permissions]);

  // Initial fetch
  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return { permissions: state.permissions,
    loading: state.loading,
    error: state.error,
    refetch: fetchPermissions,
    refresh: refreshPermissions,
    hasPermission,
    isTeacher,
    canStartTrial,
    getTrialDaysLeft,
    isTrialExpired,
    getAccessType, };
}

// Hook for specific permission checks
export function usePermissionCheck(permission: keyof UserPermissions) { const { permissions, loading, hasPermission } = usePermissions();

  return { hasPermission: hasPermission(permission),
    loading,
    permissions, };
}

// Clear permissions cache (useful when user data changes)
export function clearPermissionsCache() {
  permissionsCache = null;
}
