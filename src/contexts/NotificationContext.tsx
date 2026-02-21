import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  getUserNotifications, 
  getUnreadCount, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  Notification 
} from '../services/EnhancedNotificationService';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  userId: string;
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ userId, children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [initialized, setInitialized] = useState(false);

  const fetchNotifications = async () => {
    try {
      if (!userId) return;
      
      const userNotifications = await getUserNotifications(userId);
      setNotifications(userNotifications);
      
      const count = await getUnreadCount(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (userId && !initialized) {
      fetchNotifications();
      setInitialized(true);
      
      // Set up polling to check for new notifications
      const intervalId = setInterval(() => {
        fetchNotifications();
      }, 60000); // Check every minute
      
      return () => clearInterval(intervalId);
    }
  }, [userId, initialized]);

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      ));
      
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(userId);
      
      // Update local state
      setNotifications(notifications.map(notification => 
        ({ ...notification, read: true })
      ));
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
