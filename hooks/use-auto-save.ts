'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export interface AutoSaveState { status: 'idle' | 'saving' | 'saved' | 'error' | 'offline';
  lastSaved?: Date;
  retryCount: number;
  hasUnsavedChanges: boolean; }

export interface AutoSaveOptions { debounceMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  storageKey?: string;
  onSave: (data: any) => Promise<void>;
  onError?: (error: any, retryCount: number) => void;
  onOffline?: (data: any) => void;
  showToasts?: boolean; }

export function useAutoSave<T>(options: AutoSaveOptions) { const {
    debounceMs = 1000,
    maxRetries = 3,
    retryDelayMs = 2000,
    storageKey,
    onSave,
    onError,
    onOffline,
    showToasts = true } = options;

  const [state, setState] = useState<AutoSaveState>({ status: 'idle',
    retryCount: 0,
    hasUnsavedChanges: false });

  const [isOnline, setIsOnline] = useState(true);
  const [localData, setLocalData] = useState<Record<string, T>>({});

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor online status
  useEffect(() => { const handleOnline = () => {
      setIsOnline(true);
      // Retry saving if we have unsaved changes
      if (state.hasUnsavedChanges && localData) {
        // Trigger retry for all unsaved items
        Object.entries(localData).forEach(([key, data]) => {
          if (data) {
            performSave(key, data, true); }
        });
      }
    };

    const handleOffline = () => { setIsOnline(false);
      setState(prev => ({ ...prev, status: 'offline' }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    setIsOnline(navigator.onLine);

    return () => { window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline); };
  }, [state.hasUnsavedChanges, localData]);

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !storageKey) return;

    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setLocalData(parsed);
      } catch (e) { console.error('Error parsing saved data', e);
        localStorage.removeItem(storageKey); }
    }
  }, [storageKey]);

  // Save data with retry logic
  const performSave = useCallback(async (key: string, data: T, isRetry = false) => { if (!isOnline && !isRetry) {
      // Store locally when offline
      const updatedData = { ...localData, [key]: data };
      setLocalData(updatedData);

      if (storageKey) { localStorage.setItem(storageKey, JSON.stringify(updatedData)); }

      setState(prev => ({ ...prev, status: 'offline', hasUnsavedChanges: true }));

      if (onOffline) {
        onOffline(data);
      }

      return;
    }

    try { setState(prev => ({ ...prev, status: 'saving' }));

      // Store locally first for instant feedback
      const updatedData = { ...localData, [key]: data };
      setLocalData(updatedData);

      if (storageKey) { localStorage.setItem(storageKey, JSON.stringify(updatedData)); }

      await onSave(data);

      setState({ status: 'saved',
        lastSaved: new Date(),
        retryCount: 0,
        hasUnsavedChanges: false });

      if (showToasts) {
        toast.success('تم الحفظ بنجاح');
      }

      // Clear saved indicator after 3 seconds
      setTimeout(() => { setState(prev =>
          prev.status === 'saved' ? { ...prev, status: 'idle' } : prev
        );
      }, 3000);

    } catch (error: any) { console.error('Error saving data:', error);

      const isNetworkError = !error.response || error.code === 'NETWORK_ERROR';
      const shouldRetry = isNetworkError && state.retryCount < maxRetries;

      if (shouldRetry) {
        // Exponential backoff
        const retryDelay = Math.pow(2, state.retryCount + 1) * retryDelayMs;

        setState(prev => ({
          ...prev,
          status: 'error',
          retryCount: prev.retryCount + 1,
          hasUnsavedChanges: true }));

        retryTimeoutRef.current = setTimeout(() => { performSave(key, data, true); }, retryDelay);

        if (showToasts) {
          toast.error(`فشل في الحفظ، سيتم المحاولة مرة أخرى خلال ${retryDelay / 1000} ثانية`);
        }
      } else { setState(prev => ({
          ...prev,
          status: 'error',
          hasUnsavedChanges: true }));

        if (onError) { onError(error, state.retryCount); }

        if (showToasts) {
          if (error.response?.status === 400) {
            toast.error('خطأ في البيانات المرسلة');
          } else if (error.response?.status === 403) {
            toast.error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
          } else if (error.response?.status === 404) {
            toast.error('البيانات غير موجودة');
          } else {
            toast.error('فشل في الحفظ، تم حفظ البيانات محلياً');
          }
        }
      }
    }
  }, [
    isOnline,
    localData,
    storageKey,
    onSave,
    onError,
    onOffline,
    showToasts,
    state.retryCount,
    maxRetries,
    retryDelayMs
  ]);

  // Debounced save function
  const save = useCallback((key: string, data: T) => { setState(prev => ({ ...prev, hasUnsavedChanges: true }));

    // Clear any existing timeouts
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    // Set a new timeout to save the data
    saveTimeoutRef.current = setTimeout(() => { performSave(key, data); }, debounceMs);
  }, [debounceMs, performSave]);

  // Manual save function (immediate)
  const saveNow = useCallback((key: string, data: T) => {
    // Clear timeout and save immediately
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    performSave(key, data);
  }, [performSave]);

  // Get saved data for a key
  const getSavedData = useCallback((key: string): T | undefined => {
    return localData[key];
  }, [localData]);

  // Clear saved data for a key
  const clearSavedData = useCallback((key: string) => {
    const updatedData = { ...localData };
    delete updatedData[key];
    setLocalData(updatedData);

    if (storageKey) { localStorage.setItem(storageKey, JSON.stringify(updatedData)); }
  }, [localData, storageKey]);

  // Clear all saved data
  const clearAllSavedData = useCallback(() => {
    setLocalData({});
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return { state,
    isOnline,
    save,
    saveNow,
    getSavedData,
    clearSavedData,
    clearAllSavedData,
    localData };
}
