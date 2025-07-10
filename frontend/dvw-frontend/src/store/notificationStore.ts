import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number; // Auto-dismiss after this many milliseconds, 0 means never auto-dismiss
  timestamp: number;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// Generate unique ID for notifications
const generateId = () => `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  
  addNotification: (notification) => {
    const id = generateId();
    const newNotification: Notification = {
      id,
      timestamp: Date.now(),
      duration: notification.duration ?? 5000, // Default 5 seconds
      ...notification,
    };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));
    
    // Auto-dismiss if duration is set and > 0
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }
    
    return id;
  },
  
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id),
    }));
  },
  
  clearNotifications: () => {
    set({ notifications: [] });
  },
}));

// Convenient helper functions
export const showNotification = {
  success: (title: string, message?: string, duration?: number) => 
    useNotificationStore.getState().addNotification({ type: 'success', title, message, duration }),
  
  error: (title: string, message?: string, duration?: number) => 
    useNotificationStore.getState().addNotification({ type: 'error', title, message, duration }),
  
  info: (title: string, message?: string, duration?: number) => 
    useNotificationStore.getState().addNotification({ type: 'info', title, message, duration }),
  
  warning: (title: string, message?: string, duration?: number) => 
    useNotificationStore.getState().addNotification({ type: 'warning', title, message, duration }),
}; 