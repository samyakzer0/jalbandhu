import { supabase } from './supabase';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  related_report_id?: string;
  created_at: string;
}

// Get notifications for a user
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    // Try to get from Supabase first
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      return data as Notification[];
    }
    
    // Fallback to localStorage
    const storageData = localStorage.getItem('nivaran_notifications');
    const allNotifications: Notification[] = JSON.parse(storageData || '[]');
    return allNotifications.filter(notification => notification.user_id === userId);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    
    // Final fallback
    try {
      const storageData = localStorage.getItem('nivaran_notifications');
      const allNotifications: Notification[] = JSON.parse(storageData || '[]');
      return allNotifications.filter(notification => notification.user_id === userId);
    } catch (e) {
      console.error('Failed to parse localStorage data:', e);
      return [];
    }
  }
};

// Create a new notification
export const createNotification = async (notification: Omit<Notification, 'id' | 'created_at'>): Promise<boolean> => {
  try {
    const timestamp = new Date().toISOString();
    const id = `notif_${timestamp}_${Math.random().toString(36).substring(2, 9)}`;
    
    const newNotification: Notification = {
      ...notification,
      id,
      created_at: timestamp
    };
    
    // Try to insert into Supabase if configured
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { error } = await supabase
        .from('notifications')
        .insert([newNotification]);
      
      if (error) {
        console.error('Supabase error:', error);
        // Don't throw - continue with localStorage fallback
      } else {
        console.log('Notification stored in Supabase');
        return true;
      }
    }
    
    // Always save to localStorage for backup or local development
    try {
      const storageData = localStorage.getItem('nivaran_notifications');
      const allNotifications: Notification[] = JSON.parse(storageData || '[]');
      allNotifications.push(newNotification);
      localStorage.setItem('nivaran_notifications', JSON.stringify(allNotifications));
      console.log('Notification saved to localStorage');
      return true;
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      return false;
    }
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    // Try to update in Supabase first
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (error) {
        console.error('Supabase error:', error);
        // Don't throw - continue with localStorage fallback
      } else {
        return true;
      }
    }
    
    // Fallback to localStorage
    const storageData = localStorage.getItem('nivaran_notifications');
    const allNotifications: Notification[] = JSON.parse(storageData || '[]');
    
    const notificationIndex = allNotifications.findIndex(n => n.id === notificationId);
    if (notificationIndex === -1) return false;
    
    allNotifications[notificationIndex].read = true;
    localStorage.setItem('nivaran_notifications', JSON.stringify(allNotifications));
    
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId: string): Promise<boolean> => {
  try {
    // Try to update in Supabase first
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);
      
      if (error) {
        console.error('Supabase error:', error);
        // Don't throw - continue with localStorage fallback
      } else {
        return true;
      }
    }
    
    // Fallback to localStorage
    const storageData = localStorage.getItem('nivaran_notifications');
    const allNotifications: Notification[] = JSON.parse(storageData || '[]');
    
    const updatedNotifications = allNotifications.map(notification => {
      if (notification.user_id === userId && !notification.read) {
        return { ...notification, read: true };
      }
      return notification;
    });
    
    localStorage.setItem('nivaran_notifications', JSON.stringify(updatedNotifications));
    
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};

// Get unread notifications count
export const getUnreadCount = async (userId: string): Promise<number> => {
  try {
    const notifications = await getUserNotifications(userId);
    return notifications.filter(notification => !notification.read).length;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

// Delete a notification
export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  try {
    // Try to delete from Supabase first
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      
      if (error) {
        console.error('Supabase error:', error);
        // Don't throw - continue with localStorage fallback
      } else {
        return true;
      }
    }
    
    // Fallback to localStorage
    const storageData = localStorage.getItem('nivaran_notifications');
    const allNotifications: Notification[] = JSON.parse(storageData || '[]');
    
    const updatedNotifications = allNotifications.filter(n => n.id !== notificationId);
    localStorage.setItem('nivaran_notifications', JSON.stringify(updatedNotifications));
    
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
};

// Create some example notifications (for testing)
export const createExampleNotifications = async (userId: string): Promise<void> => {
  const examples = [
    {
      user_id: userId,
      title: 'Report Status Update',
      message: 'Your report on "Pothole on Main Street" has been marked as "In Review".',
      type: 'info' as const,
      read: false,
      related_report_id: 'CG-RD-20250101-0001'
    },
    {
      user_id: userId,
      title: 'Report Resolved',
      message: 'Great news! Your report on "Broken Streetlight" has been resolved.',
      type: 'success' as const,
      read: false,
      related_report_id: 'CG-EL-20250101-0002'
    },
    {
      user_id: userId,
      title: 'New Announcement',
      message: 'The city will be conducting road repairs this weekend in your neighborhood.',
      type: 'warning' as const,
      read: false
    }
  ];
  
  for (const notification of examples) {
    await createNotification(notification);
  }
};
