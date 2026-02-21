import React, { useState, useEffect } from 'react';
import { ChevronLeft, Trash2, CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import { translations } from '../utils/translations';
import {
  deleteNotification,
  Notification
} from '../services/EnhancedNotificationService';
import Loader from './Loader';

interface NotificationsPageProps {
  onNavigate: (page: string) => void;
  userId: string;
}

function NotificationsPage({ onNavigate, userId }: NotificationsPageProps) {
  const { theme, language } = useTheme();
  const t = translations[language];
  const { notifications, markAsRead, markAllAsRead, refreshNotifications } = useNotifications();
  
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await refreshNotifications();
      } catch (error) {
        console.error('Error refreshing notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [userId, refreshNotifications]);
  
  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.read) return;
    
    try {
      await markAsRead(notification.id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  const handleDelete = async (notification: Notification) => {
    try {
      await deleteNotification(notification.id);
      // Refresh notifications after deletion
      refreshNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await handleMarkAsRead(notification);
    }
    
    // Navigate to related report if available
    if (notification.related_report_id) {
      onNavigate('status');
    }
  };
  
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);
    
  const hasUnread = notifications.some(n => !n.read);
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4 sticky top-0 z-10 shadow-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => onNavigate('home')}
              className={`p-2 mr-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              <ChevronLeft size={20} className={theme === 'dark' ? 'text-white' : 'text-gray-800'} />
            </button>
            <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Notifications</h1>
          </div>
          
          {hasUnread && (
            <button
              onClick={handleMarkAllAsRead}
              className={`flex items-center text-sm ${
                theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
              }`}
            >
              <CheckCircle size={16} className="mr-1" />
              Mark all read
            </button>
          )}
        </div>
      </div>
      
      {/* Filters */}
      <div className={`flex p-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`flex border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-lg overflow-hidden w-full`}>
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 px-4 text-center ${
              filter === 'all' 
                ? theme === 'dark'
                  ? 'bg-gray-700 text-white' 
                  : 'bg-blue-500 text-white'
                : theme === 'dark'
                  ? 'bg-gray-800 text-gray-400 hover:text-white' 
                  : 'bg-white text-gray-600 hover:text-gray-800'
            } transition-colors`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 py-2 px-4 text-center ${
              filter === 'unread' 
                ? theme === 'dark'
                  ? 'bg-gray-700 text-white' 
                  : 'bg-blue-500 text-white'
                : theme === 'dark'
                  ? 'bg-gray-800 text-gray-400 hover:text-white' 
                  : 'bg-white text-gray-600 hover:text-gray-800'
            } transition-colors`}
          >
            Unread
          </button>
        </div>
      </div>
      
      {/* Notifications List */}
      <div className="pb-24">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader size="medium" message="Loading notifications..." />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-12 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {filter === 'all' ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-lg font-medium mb-2">No notifications yet</p>
                <p className="text-sm text-center">
                  You'll see notifications about your reports and updates from your city here
                </p>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium mb-2">All caught up!</p>
                <p className="text-sm text-center">
                  You don't have any unread notifications
                </p>
              </>
            )}
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`${
                theme === 'dark' 
                  ? 'border-gray-800' 
                  : 'border-gray-100'
              } border-b`}
            >
              <div className={`flex p-4 ${
                !notification.read 
                  ? theme === 'dark'
                    ? 'bg-gray-800/50' 
                    : 'bg-blue-50/30'
                  : ''
              }`}>
                <div 
                  className="flex-1 pr-4 cursor-pointer"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start">
                    <div
                      className={`w-3 h-3 mt-1.5 rounded-full mr-3 flex-shrink-0 ${
                        !notification.read
                          ? 'bg-blue-500'
                          : theme === 'dark'
                          ? 'bg-gray-600'
                          : 'bg-gray-300'
                      }`}
                    />
                    <div>
                      <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {notification.title}
                      </h3>
                      <p className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {notification.message}
                      </p>
                      <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <button
                    onClick={() => handleDelete(notification)}
                    className={`p-2 rounded-full ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-red-400 hover:bg-gray-800'
                        : 'text-gray-500 hover:text-red-500 hover:bg-gray-100'
                    }`}
                    aria-label="Delete notification"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
