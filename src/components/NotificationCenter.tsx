import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertTriangle, Info, ChevronDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { formatDistanceToNow } from 'date-fns';
import { translations } from '../utils/translations';
import {
  getAllNotifications,
  markNotificationAsRead,
  deleteNotification,
  Notification as NotificationType
} from '../services/EnhancedNotificationService';
import Loader from './Loader';

interface NotificationCenterProps {
  userId: string;
  onNavigate: (page: string) => void;
}

function NotificationCenter({ userId, onNavigate }: NotificationCenterProps) {
  const { theme, language } = useTheme();
  const t = translations[language];
  
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  
  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      if (!isOpen) return; // Only load when panel is open
      
      try {
        setIsLoading(true);
        const userNotifications = await getAllNotifications(userId);
        setNotifications(userNotifications);
        
        // Calculate unread count
        const unread = userNotifications.filter(notification => !notification.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNotifications();
  }, [userId, isOpen]);
  
  // Check for unread notifications every minute (when closed)
  useEffect(() => {
    if (isOpen) return;
    
    const interval = setInterval(async () => {
      try {
        const userNotifications = await getAllNotifications(userId);
        const unread = userNotifications.filter(notification => !notification.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error checking unread notifications:', error);
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [userId, isOpen]);
  
  // Handle mark as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(prev - 1, 0));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Handle delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      
      // Update local state
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update unread count if needed
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(prev - 1, 0));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(notification => !notification.read)
        .map(notification => notification.id);
      
      await Promise.all(unreadIds.map(id => markNotificationAsRead(id)));
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  // Handle notification click
  const handleNotificationClick = (notification: NotificationType) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.related_report_id) {
      onNavigate(`report/${notification.related_report_id}`);
      setIsOpen(false);
    }
  };
  
  // Get filtered notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true; // 'all' filter
  });
  
  // Get notification icon
  const getNotificationIcon = (notification: NotificationType) => {
    switch (notification.type) {
      case 'success':
        return <Check size={18} className="text-green-500" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-yellow-500" />;
      case 'error':
        return <AlertTriangle size={18} className="text-red-500" />;
      case 'info':
      default:
        return <Info size={18} className="text-blue-500" />;
    }
  };
  
  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full ${
          theme === 'dark' 
            ? 'hover:bg-gray-700 text-white' 
            : 'hover:bg-gray-100 text-gray-700'
        } transition-colors`}
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Notification Panel */}
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-lg shadow-lg z-50 overflow-hidden ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-3 border-b ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Notifications
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => onNavigate('notification-preferences')}
                className={`text-sm px-2 py-1 rounded ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-700 text-gray-200' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                Settings
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className={`text-sm px-2 py-1 rounded ${
                    theme === 'dark' 
                      ? 'hover:bg-gray-700 text-blue-400' 
                      : 'hover:bg-gray-100 text-blue-600'
                  }`}
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>
          
          {/* Filter Tabs */}
          <div className={`flex border-b ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-2 text-sm font-medium ${
                filter === 'all' 
                  ? theme === 'dark' 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-blue-600 border-b-2 border-blue-600'
                  : theme === 'dark' 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 py-2 text-sm font-medium ${
                filter === 'unread' 
                  ? theme === 'dark' 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-blue-600 border-b-2 border-blue-600'
                  : theme === 'dark' 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`flex-1 py-2 text-sm font-medium ${
                filter === 'read' 
                  ? theme === 'dark' 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-blue-600 border-b-2 border-blue-600'
                  : theme === 'dark' 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Read
            </button>
          </div>
          
          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader size="small" message="Loading notifications..." />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className={`py-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {filter === 'all' 
                  ? 'No notifications yet' 
                  : filter === 'unread' 
                    ? 'No unread notifications' 
                    : 'No read notifications'
                }
              </div>
            ) : (
              <ul>
                {filteredNotifications.map(notification => (
                  <li 
                    key={notification.id} 
                    className={`border-b last:border-b-0 ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    } ${!notification.read ? theme === 'dark' ? 'bg-gray-700/40' : 'bg-blue-50' : ''}`}
                  >
                    <div 
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-3 flex gap-3 ${
                        theme === 'dark' 
                          ? 'hover:bg-gray-700' 
                          : 'hover:bg-gray-50'
                      } cursor-pointer relative`}
                    >
                      {/* Indicator dot for unread */}
                      {!notification.read && (
                        <div className="absolute left-1 top-4 w-2 h-2 rounded-full bg-blue-500"></div>
                      )}
                      
                      {/* Icon */}
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        {getNotificationIcon(notification)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </p>
                        <p className={`text-sm line-clamp-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {notification.message}
                        </p>
                        <p className={`text-xs mt-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex flex-shrink-0 self-start space-x-1 ml-2" onClick={e => e.stopPropagation()}>
                        {!notification.read && (
                          <button 
                            onClick={() => handleMarkAsRead(notification.id)}
                            className={`p-1 rounded-full ${
                              theme === 'dark' 
                                ? 'hover:bg-gray-600 text-gray-300' 
                                : 'hover:bg-gray-200 text-gray-600'
                            }`}
                            title="Mark as read"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteNotification(notification.id)}
                          className={`p-1 rounded-full ${
                            theme === 'dark' 
                              ? 'hover:bg-gray-600 text-gray-300' 
                              : 'hover:bg-gray-200 text-gray-600'
                          }`}
                          title="Delete notification"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Footer */}
          <div className={`p-2 border-t ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={() => onNavigate('notifications-history')}
              className={`w-full py-2 text-sm font-medium flex items-center justify-center ${
                theme === 'dark' 
                  ? 'text-gray-300 hover:text-white' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              View All Notifications
              <ChevronDown size={16} className="ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
