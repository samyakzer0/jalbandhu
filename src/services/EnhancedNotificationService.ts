import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';
import { requestNotificationPermission } from './firebase';

// Notification types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

// Notification channels
export type NotificationChannel = 'inApp' | 'push' | 'email' | 'all';

// Notification preferences
export interface NotificationPreferences {
  user_id: string;
  report_status_updates: boolean;
  community_announcements: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  do_not_disturb_start?: string; // Time in format "HH:MM"
  do_not_disturb_end?: string; // Time in format "HH:MM"
}

// Default preferences
export const DEFAULT_PREFERENCES: Omit<NotificationPreferences, 'user_id'> = {
  report_status_updates: true,
  community_announcements: true,
  email_notifications: false,
  push_notifications: true,
};

// Notification template
export interface NotificationTemplate {
  title: string;
  message: string;
  type: NotificationType;
}

// Notification object
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  related_report_id?: string;
  created_at: string;
  fcm_token?: string;
  channel: NotificationChannel;
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

// Alias for getUserNotifications to maintain backward compatibility
export const getAllNotifications = getUserNotifications;

// Create a new notification
export const createNotification = async (
  notification: Omit<Notification, 'id' | 'created_at' | 'channel'> & { channel?: NotificationChannel }
): Promise<boolean> => {
  try {
    const timestamp = new Date().toISOString();
    const id = `notif_${timestamp}_${Math.random().toString(36).substring(2, 9)}`;
    
    const newNotification: Notification = {
      ...notification,
      id,
      created_at: timestamp,
      channel: notification.channel || 'inApp'
    };
    
    // Get user preferences
    const userPreferences = await getUserNotificationPreferences(notification.user_id);
    
    // Check if notification should be sent based on preferences
    // For example, if it's a status update and user doesn't want those
    if (notification.related_report_id && !userPreferences.report_status_updates) {
      console.log('User has disabled report status updates');
      return false;
    }
    
    // Check if within do not disturb hours
    if (userPreferences.do_not_disturb_start && userPreferences.do_not_disturb_end) {
      if (isWithinDoNotDisturbHours(userPreferences.do_not_disturb_start, userPreferences.do_not_disturb_end)) {
        console.log('Within do not disturb hours, saving for later delivery');
        // Save for later delivery
        // Here you could add a field like "scheduled_delivery" to deliver later
      }
    }
    
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
      }
    }
    
    // Save to localStorage
    try {
      const storageData = localStorage.getItem('nivaran_notifications');
      const allNotifications: Notification[] = JSON.parse(storageData || '[]');
      allNotifications.push(newNotification);
      localStorage.setItem('nivaran_notifications', JSON.stringify(allNotifications));
      console.log('Notification saved to localStorage');
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
    
    // Send push notification if enabled
    if (userPreferences.push_notifications) {
      await sendPushNotification(notification.user_id, {
        title: notification.title,
        message: notification.message,
        type: notification.type
      });
    }
    
    // Send email notification if enabled
    if (userPreferences.email_notifications) {
      await sendEmailNotification(notification.user_id, {
        title: notification.title,
        message: notification.message,
        type: notification.type
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
};

// Send push notification via Firebase Cloud Messaging
export const sendPushNotification = async (
  userId: string,
  notification: NotificationTemplate
): Promise<boolean> => {
  try {
    // Get user's FCM token
    const fcmToken = await getFCMTokenForUser(userId);
    
    if (!fcmToken) {
      console.log('No FCM token available for user:', userId);
      return false;
    }
    
    // In a real app, you would send this to your backend server
    // which would then use Firebase Admin SDK to send the notification
    
    console.log(`Push notification would be sent to user ${userId} with token ${fcmToken}`);
    
    // This is just a placeholder. In a real app, you'd call your backend API
    // which would use the Firebase Admin SDK to send the notification
    
    // For demonstration, we'll simulate success
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};

// Send email notification
export const sendEmailNotification = async (
  userId: string,
  notification: NotificationTemplate
): Promise<boolean> => {
  try {
    // Get user's email
    const userEmail = await getUserEmailById(userId);
    
    if (!userEmail) {
      console.log('No email available for user:', userId);
      return false;
    }
    
    // In a real app, you would send this to your email service
    // (e.g., SendGrid, AWS SES, etc.)
    
    console.log(`Email notification would be sent to ${userEmail}`);
    
    // This is just a placeholder. In a real app, you'd call your email service
    
    // For demonstration, we'll simulate success
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
};

// Get FCM token for a user
export const getFCMTokenForUser = async (userId: string): Promise<string | null> => {
  try {
    // Check if we have token in localStorage
    const token = localStorage.getItem(`fcm_token_${userId}`);
    if (token) {
      return token;
    }
    
    // If not, try to get from Supabase
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { data, error } = await supabase
        .from('user_fcm_tokens')
        .select('token')
        .eq('user_id', userId)
        .single();
      
      if (error || !data) {
        console.log('No FCM token found in Supabase');
      } else {
        return data.token;
      }
    }
    
    // If still no token, request a new one
    const newToken = await requestNotificationPermission();
    if (newToken) {
      // Save to localStorage
      localStorage.setItem(`fcm_token_${userId}`, newToken);
      
      // Save to Supabase if configured
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        await supabase
          .from('user_fcm_tokens')
          .upsert([{ user_id: userId, token: newToken }]);
      }
      
      return newToken;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting FCM token for user:', error);
    return null;
  }
};

// Get user email by ID
export const getUserEmailById = async (userId: string): Promise<string | null> => {
  try {
    // Try to get from Supabase
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();
      
      if (error || !data) {
        console.log('User email not found in Supabase');
      } else {
        return data.email;
      }
    }
    
    // For development, return a mock email
    if (userId.includes('@')) {
      return userId; // If the userId is already an email
    }
    
    return `${userId}@example.com`; // Mock email
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
};

// Get user notification preferences
export const getUserNotificationPreferences = async (
  userId: string
): Promise<NotificationPreferences> => {
  try {
    // Try to get from Supabase
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (!error && data) {
        return data as NotificationPreferences;
      }
    }
    
    // Try to get from localStorage
    const storedPrefs = localStorage.getItem(`notification_prefs_${userId}`);
    if (storedPrefs) {
      return JSON.parse(storedPrefs);
    }
    
    // If nothing found, create default preferences
    const defaultPreferences: NotificationPreferences = {
      user_id: userId,
      ...DEFAULT_PREFERENCES
    };
    
    // Save default preferences
    await saveUserNotificationPreferences(defaultPreferences);
    
    return defaultPreferences;
  } catch (error) {
    console.error('Error getting user notification preferences:', error);
    
    // Return default preferences as fallback
    return {
      user_id: userId,
      ...DEFAULT_PREFERENCES
    };
  }
};

// Save user notification preferences
export const saveUserNotificationPreferences = async (
  preferences: NotificationPreferences
): Promise<boolean> => {
  try {
    // Try to save to Supabase
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert([preferences]);
      
      if (error) {
        console.error('Supabase error:', error);
      } else {
        console.log('Preferences saved to Supabase');
      }
    }
    
    // Always save to localStorage
    localStorage.setItem(`notification_prefs_${preferences.user_id}`, JSON.stringify(preferences));
    
    return true;
  } catch (error) {
    console.error('Error saving notification preferences:', error);
    return false;
  }
};

// Check if current time is within do not disturb hours
export const isWithinDoNotDisturbHours = (startTime: string, endTime: string): boolean => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const currentTimeMinutes = currentHour * 60 + currentMinute;
  const startTimeMinutes = startHour * 60 + startMinute;
  const endTimeMinutes = endHour * 60 + endMinute;
  
  // Handle cases where end time is on the next day
  if (endTimeMinutes < startTimeMinutes) {
    return currentTimeMinutes >= startTimeMinutes || currentTimeMinutes <= endTimeMinutes;
  } else {
    return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes;
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
      related_report_id: 'CG-RD-20250101-0001',
      channel: 'inApp' as const
    },
    {
      user_id: userId,
      title: 'Report Resolved',
      message: 'Great news! Your report on "Broken Streetlight" has been resolved.',
      type: 'success' as const,
      read: false,
      related_report_id: 'CG-EL-20250101-0002',
      channel: 'all' as const
    },
    {
      user_id: userId,
      title: 'New Announcement',
      message: 'The city will be conducting road repairs this weekend in your neighborhood.',
      type: 'warning' as const,
      read: false,
      channel: 'all' as const
    }
  ];
  
  for (const notification of examples) {
    await createNotification(notification);
  }
};

// Update user_id in notifications when user signs in
export const updateUserIdInNotifications = async (oldUserId: string, newUserId: string): Promise<boolean> => {
  try {
    // Try to update in Supabase first
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { error } = await supabase
        .from('notifications')
        .update({ user_id: newUserId })
        .eq('user_id', oldUserId);
      
      if (error) {
        console.error('Supabase error:', error);
      } else {
        return true;
      }
    }
    
    // Fallback to localStorage
    const storageData = localStorage.getItem('nivaran_notifications');
    const allNotifications: Notification[] = JSON.parse(storageData || '[]');
    const updatedNotifications = allNotifications.map(notification => {
      if (notification.user_id === oldUserId) {
        return { ...notification, user_id: newUserId };
      }
      return notification;
    });
    
    localStorage.setItem('nivaran_notifications', JSON.stringify(updatedNotifications));
    return true;
  } catch (error) {
    console.error('Error updating user_id in notifications:', error);
    return false;
  }
};
