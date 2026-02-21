import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { 
  deleteNotification,
  Notification 
} from '../../services/NotificationService';
import { Trash2, ArrowLeft, Check } from 'lucide-react';

interface NotificationPanelProps {
  userId: string;
  onBack?: () => void;
  onNavigate?: (page: string) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ userId, onBack, onNavigate }) => {
  const { theme } = useTheme();
  const { notifications, markAsRead, markAllAsRead, refreshNotifications } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await refreshNotifications();
        setError(null);
      } catch (error) {
        console.error('Error refreshing notifications:', error);
        setError('Failed to load notifications. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [refreshNotifications]);

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
    if (notification.related_report_id && onNavigate) {
      onNavigate('status');
    }
  };

  const hasUnread = notifications.some(n => !n.read);

  return (
    <div className={`flex flex-col h-full ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center">
          {onBack && (
            <button
              onClick={onBack}
              className={`mr-2 p-1 rounded-full ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="font-semibold text-xl">Notifications</h2>
        </div>
        
        {hasUnread && (
          <button
            onClick={handleMarkAllAsRead}
            className={`flex items-center text-sm ${
              theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
            }`}
          >
            <Check size={16} className="mr-1" />
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className={`animate-pulse ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Loading...
            </div>
          </div>
        ) : error ? (
          <div className={`p-4 text-center ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>
            {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className={`p-6 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <p className="text-lg mb-2">No notifications</p>
            <p className="text-sm">You'll see notifications about your reports and city updates here.</p>
          </div>
        ) : (
          <div>
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 border-b ${
                  theme === 'dark' ? 'border-gray-800' : 'border-gray-100'
                } ${
                  !notification.read ? (theme === 'dark' ? 'bg-gray-800/50' : 'bg-blue-50/30') : ''
                }`}
              >
                <div className="flex justify-between">
                  <div 
                    className="flex-1 cursor-pointer" 
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
                  
                  <button
                    onClick={() => handleDelete(notification)}
                    className={`ml-2 p-1 rounded-full ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-red-400 hover:bg-gray-800'
                        : 'text-gray-500 hover:text-red-500 hover:bg-gray-100'
                    }`}
                    title="Delete notification"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
