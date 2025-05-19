'use client';

import { useEffect, useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  X, 
  BellRing, 
  BookOpen,
  GraduationCap,
  Timer,
  Trophy
} from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Card } from './card';
import { motion, AnimatePresence } from 'framer-motion';

// Create a store for notifications
import { create } from 'zustand';

type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'achievement';
type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

interface Notification {
  id: string;
  title: string;
  description?: string;
  type: NotificationType;
  duration?: number; // milliseconds
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: 'bell' | 'book' | 'graduation' | 'timer' | 'trophy' | 'checkmark' | 'info' | 'warning' | 'error';
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  position: NotificationPosition;
  setPosition: (position: NotificationPosition) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  position: 'top-right',
  addNotification: (notification) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));

    // Auto remove after duration if specified
    if (notification.duration) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, notification.duration);
    }

    return id;
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
    }));
  },
  clearAllNotifications: () => {
    set({ notifications: [] });
  },
  setPosition: (position) => {
    set({ position });
  },
}));

// Create notification variants with different styles
const notificationVariants = cva(
  'relative flex gap-3 overflow-hidden rounded-lg border p-4 pr-12 shadow-lg',
  {
    variants: {
      type: {
        default: 'bg-background text-foreground',
        success: 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-100 dark:border-emerald-900',
        error: 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950/50 dark:text-red-100 dark:border-red-900',
        warning: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/50 dark:text-amber-100 dark:border-amber-900',
        info: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/50 dark:text-blue-100 dark:border-blue-900',
        achievement: 'bg-violet-50 text-violet-900 border-violet-200 dark:bg-violet-950/50 dark:text-violet-100 dark:border-violet-900',
      },
    },
    defaultVariants: {
      type: 'default',
    },
  }
);

interface NotificationProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof notificationVariants> {
  notification: Notification;
  onClose: () => void;
}

export function NotificationToast({ notification, onClose, type, className, ...props }: NotificationProps) {
  // Get icon component based on notification type and specified icon
  const getIcon = () => {
    // First check if custom icon is specified
    if (notification.icon) {
      switch (notification.icon) {
        case 'bell': return <BellRing className="h-5 w-5" />;
        case 'book': return <BookOpen className="h-5 w-5" />;
        case 'graduation': return <GraduationCap className="h-5 w-5" />;
        case 'timer': return <Timer className="h-5 w-5" />;
        case 'trophy': return <Trophy className="h-5 w-5" />;
        case 'checkmark': return <CheckCircle2 className="h-5 w-5" />;
        case 'info': return <Info className="h-5 w-5" />;
        case 'warning': return <AlertCircle className="h-5 w-5" />;
        case 'error': return <AlertCircle className="h-5 w-5" />;
      }
    }
    
    // Fallback to type-based icons
    switch (notification.type) {
      case 'success': return <CheckCircle2 className="h-5 w-5" />;
      case 'error': return <AlertCircle className="h-5 w-5" />;
      case 'warning': return <AlertCircle className="h-5 w-5" />;
      case 'info': return <Info className="h-5 w-5" />;
      case 'achievement': return <Trophy className="h-5 w-5" />;
      default: return <BellRing className="h-5 w-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={cn(notificationVariants({ type: notification.type }), className)}
      {...props}
    >
      <div className="flex-shrink-0 text-foreground">
        {getIcon()}
      </div>
      <div className="flex-1">
        <h3 className="font-medium leading-none tracking-tight">{notification.title}</h3>
        {notification.description && (
          <p className="mt-1 text-sm opacity-85">{notification.description}</p>
        )}
        {notification.action && (
          <button
            onClick={notification.action.onClick}
            className="mt-2 text-sm font-medium underline underline-offset-4 hover:opacity-80"
          >
            {notification.action.label}
          </button>
        )}
      </div>
      <button
        onClick={onClose}
        className="absolute right-2 top-2 rounded-full p-1 text-foreground/50 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export function NotificationsContainer() {
  const { notifications, removeNotification, position } = useNotificationStore();

  // Map position to CSS classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <div
      className={`fixed z-50 flex w-full max-w-sm flex-col gap-2 ${getPositionClasses()}`}
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence initial={false}>
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Helper functions to create different types of notifications
export const showNotification = {
  success: (title: string, description?: string, options?: Partial<Notification>) => {
    return useNotificationStore.getState().addNotification({
      title,
      description,
      type: 'success',
      duration: 5000,
      ...options,
    });
  },
  error: (title: string, description?: string, options?: Partial<Notification>) => {
    return useNotificationStore.getState().addNotification({
      title,
      description,
      type: 'error',
      duration: 8000, // Errors stay a bit longer
      ...options,
    });
  },
  info: (title: string, description?: string, options?: Partial<Notification>) => {
    return useNotificationStore.getState().addNotification({
      title,
      description,
      type: 'info',
      duration: 5000,
      ...options,
    });
  },
  warning: (title: string, description?: string, options?: Partial<Notification>) => {
    return useNotificationStore.getState().addNotification({
      title,
      description,
      type: 'warning',
      duration: 7000,
      ...options,
    });
  },
  achievement: (title: string, description?: string, options?: Partial<Notification>) => {
    return useNotificationStore.getState().addNotification({
      title,
      description,
      type: 'achievement',
      duration: 10000, // Achievements stay longer
      icon: 'trophy',
      ...options,
    });
  },
};