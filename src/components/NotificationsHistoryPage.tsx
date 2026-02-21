import React, { useState, useEffect } from 'react';
import { ChevronLeft, Bell, Check, AlertTriangle, Info, Filter, X, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../utils/translations';
import { formatDistanceToNow } from 'date-fns';
import {
  getAllNotifications,
  markNotificationAsRead,
  deleteNotification,
  Notification
} from '../services/EnhancedNotificationService';
import Loader from './Loader';

interface NotificationsHistoryPageProps {
  onNavigate: (page: string) => void;
  userId: string;
}

function NotificationsHistoryPage({ onNavigate, userId }: NotificationsHistoryPageProps) {
  const { theme, language } = useTheme();
  const t = translations[language];
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'read' | 'unread'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load notifications
  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userNotifications = await getAllNotifications(userId);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial load
  useEffect(() => {
    loadNotifications();
  }, [userId]);
  
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
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Handle delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      
      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
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
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.related_report_id) {
      onNavigate(`report/${notification.related_report_id}`);
    }
  };
  
  // Get notification icon
  const getNotificationIcon = (notification: Notification) => {
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
  
  // Get filtered notifications
  const filteredNotifications = notifications.filter(notification => {
    // Filter by type
    if (filterType !== 'all' && notification.type !== filterType) {
      return false;
    }
    
    // Filter by read/unread status
    if (filterStatus === 'read' && !notification.read) {
      return false;
    }
    if (filterStatus === 'unread' && notification.read) {
      return false;
    }
    
    return true;
  });
  
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
            <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Notifications
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-800'}`}
              title="Filter notifications"
            >
              <Filter size={20} />
            </button>
            
            <button
              onClick={loadNotifications}
              className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-800'}`}
              title="Refresh notifications"
            >
              <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
        
        {/* Filter Panel */}
        {isFilterOpen && (
          <div className={`mt-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white border border-gray-200'} shadow-md`}>
            <div className="flex justify-between items-center mb-3">
              <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Filter Notifications
              </h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  Notification Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className={`w-full p-2 rounded-md ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="all">All Types</option>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  Read Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'read' | 'unread')}
                  className={`w-full p-2 rounded-md ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="all">All</option>
                  <option value="read">Read</option>
                  <option value="unread">Unread</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-between mt-3">
              <button
                onClick={() => {
                  setFilterType('all');
                  setFilterStatus('all');
                }}
                className={`px-4 py-2 text-sm rounded-md ${
                  theme === 'dark'
                    ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Reset Filters
              </button>
              
              <button
                onClick={() => setIsFilterOpen(false)}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  theme === 'dark'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className="p-4">
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-4">
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
          </p>
          
          {notifications.some(n => !n.read) && (
            <button
              onClick={handleMarkAllAsRead}
              className={`px-3 py-1 text-sm rounded-md ${
                theme === 'dark'
                  ? 'bg-gray-700 text-blue-400 hover:bg-gray-600'
                  : 'bg-gray-100 text-blue-600 hover:bg-gray-200'
              }`}
            >
              Mark all as read
            </button>
          )}
        </div>
        
        {/* Notifications List */}
        <div>
          {isLoading && notifications.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <Loader size="medium" message="Loading notifications..." />
            </div>
          ) : error ? (
            <div className={`text-center py-10 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              <AlertTriangle size={40} className={`mx-auto mb-3 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />
              <p>{error}</p>
              <button
                onClick={loadNotifications}
                className={`mt-4 px-4 py-2 rounded-md ${
                  theme === 'dark'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Try Again
              </button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className={`text-center py-16 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              <Bell size={40} className={`mx-auto mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <p className="text-lg font-medium">No notifications found</p>
              <p className="text-sm mt-1">
                {filterType !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'You have no notifications yet'
                }
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredNotifications.map(notification => (
                <li 
                  key={notification.id} 
                  className={`rounded-lg shadow ${
                    theme === 'dark' 
                      ? `bg-gray-800 ${!notification.read ? 'border-l-4 border-blue-500' : ''}`
                      : `bg-white ${!notification.read ? 'border-l-4 border-blue-500' : ''}`
                  }`}
                >
                  <div 
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 flex gap-4 ${
                      theme === 'dark' 
                        ? 'hover:bg-gray-750' 
                        : 'hover:bg-gray-50'
                    } cursor-pointer rounded-lg`}
                  >
                    {/* Icon */}
                    <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      {getNotificationIcon(notification)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className={`text-base font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </p>
                        <p className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <p className={`text-sm mt-1 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {notification.message}
                      </p>
                      
                      <div className="mt-2 flex justify-between items-center">
                        <div>
                          <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                            notification.type === 'success'
                              ? theme === 'dark' ? 'bg-green-900/50 text-green-200' : 'bg-green-100 text-green-800'
                              : notification.type === 'warning'
                                ? theme === 'dark' ? 'bg-yellow-900/50 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                                : notification.type === 'error'
                                  ? theme === 'dark' ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-800'
                                  : theme === 'dark' ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {notification.type === 'success'
                              ? 'Success'
                              : notification.type === 'warning'
                                ? 'Warning'
                                : notification.type === 'error'
                                  ? 'Error'
                                  : 'Info'
                            }
                          </span>
                        </div>
                        
                        <div className="flex space-x-2" onClick={e => e.stopPropagation()}>
                          {!notification.read && (
                            <button 
                              onClick={() => handleMarkAsRead(notification.id)}
                              className={`p-1 rounded-md ${
                                theme === 'dark' 
                                  ? 'hover:bg-gray-700 text-gray-300' 
                                  : 'hover:bg-gray-200 text-gray-600'
                              }`}
                              title="Mark as read"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteNotification(notification.id)}
                            className={`p-1 rounded-md ${
                              theme === 'dark' 
                                ? 'hover:bg-gray-700 text-gray-300' 
                                : 'hover:bg-gray-200 text-gray-600'
                            }`}
                            title="Delete notification"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationsHistoryPage;
