import React, { useState, useEffect } from 'react';
import { ChevronLeft, Bell, Mail, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../utils/translations';
import {
  getUserNotificationPreferences,
  saveUserNotificationPreferences,
  NotificationPreferences
} from '../services/EnhancedNotificationService';
import Loader from './Loader';

interface NotificationPreferencesPageProps {
  onNavigate: (page: string) => void;
  userId: string;
}

function NotificationPreferencesPage({ onNavigate, userId }: NotificationPreferencesPageProps) {
  const { theme, language } = useTheme();
  const t = translations[language];
  
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState<boolean>(false);
  
  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setIsLoading(true);
        const userPrefs = await getUserNotificationPreferences(userId);
        setPreferences(userPrefs);
      } catch (error) {
        console.error('Error loading notification preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPreferences();
  }, [userId]);
  
  // Handle save preferences
  const handleSavePreferences = async () => {
    if (!preferences) return;
    
    try {
      setIsSaving(true);
      const success = await saveUserNotificationPreferences(preferences);
      
      if (success) {
        setSavedSuccessfully(true);
        setTimeout(() => setSavedSuccessfully(false), 3000);
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle toggle switch change
  const handleToggle = (field: keyof NotificationPreferences) => {
    if (!preferences) return;
    
    setPreferences({
      ...preferences,
      [field]: !preferences[field]
    });
  };
  
  // Handle time input change
  const handleTimeChange = (field: 'do_not_disturb_start' | 'do_not_disturb_end', value: string) => {
    if (!preferences) return;
    
    setPreferences({
      ...preferences,
      [field]: value
    });
  };
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4 sticky top-0 z-10 shadow-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => onNavigate('profile')}
              className={`p-2 mr-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              <ChevronLeft size={20} className={theme === 'dark' ? 'text-white' : 'text-gray-800'} />
            </button>
            <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Notification Preferences
            </h1>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader size="medium" message="Loading preferences..." />
          </div>
        ) : preferences ? (
          <div className="space-y-6">
            {/* Notification Types */}
            <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow p-4`}>
              <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Notification Types
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      Report Status Updates
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Get notified when your reports change status
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.report_status_updates}
                      onChange={() => handleToggle('report_status_updates')}
                    />
                    <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer ${
                      theme === 'dark' ? 'peer-checked:bg-blue-600 peer-checked:after:border-white' : 'peer-checked:bg-blue-600'
                    } after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full`}></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      Community Announcements
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Updates and news from your city
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.community_announcements}
                      onChange={() => handleToggle('community_announcements')}
                    />
                    <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer ${
                      theme === 'dark' ? 'peer-checked:bg-blue-600 peer-checked:after:border-white' : 'peer-checked:bg-blue-600'
                    } after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full`}></div>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Notification Channels */}
            <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow p-4`}>
              <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Notification Channels
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell size={20} className={`mr-3 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div>
                      <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        Push Notifications
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Receive notifications on your device
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.push_notifications}
                      onChange={() => handleToggle('push_notifications')}
                    />
                    <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer ${
                      theme === 'dark' ? 'peer-checked:bg-blue-600 peer-checked:after:border-white' : 'peer-checked:bg-blue-600'
                    } after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full`}></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail size={20} className={`mr-3 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div>
                      <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        Email Notifications
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Receive notifications via email
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.email_notifications}
                      onChange={() => handleToggle('email_notifications')}
                    />
                    <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer ${
                      theme === 'dark' ? 'peer-checked:bg-blue-600 peer-checked:after:border-white' : 'peer-checked:bg-blue-600'
                    } after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full`}></div>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Do Not Disturb */}
            <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow p-4`}>
              <div className="flex items-center mb-4">
                <Clock size={20} className={`mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  Do Not Disturb
                </h2>
              </div>
              
              <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Set a time period when you don't want to receive push or email notifications
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Start Time
                  </label>
                  <input
                    type="time"
                    className={`w-full p-2 rounded-md ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    value={preferences.do_not_disturb_start || '22:00'}
                    onChange={(e) => handleTimeChange('do_not_disturb_start', e.target.value)}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    End Time
                  </label>
                  <input
                    type="time"
                    className={`w-full p-2 rounded-md ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    value={preferences.do_not_disturb_end || '07:00'}
                    onChange={(e) => handleTimeChange('do_not_disturb_end', e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {/* Test All Notifications Button */}
            <div className="pb-2">
              <button
                onClick={async () => {
                  try {
                    // Import test utilities
                    const { testAllNotificationChannels } = await import('../services/NotificationTestUtils');
                    
                    // Run the test
                    const success = await testAllNotificationChannels(preferences.user_id);
                    
                    // Show result
                    alert(success 
                      ? 'Test notifications sent successfully! Check your notifications, browser notifications, and the "View Sent Emails" section.' 
                      : 'Some notification tests failed. Please check the console for details.'
                    );
                  } catch (error) {
                    console.error('Error testing notifications:', error);
                    alert('Error testing notifications. Please try again later.');
                  }
                }}
                className={`w-full py-2 px-4 rounded-lg font-medium ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                } transition-colors flex items-center justify-center`}
              >
                Test All Notification Channels
              </button>
            </div>
            
            {/* Save Button */}
            <div className="pt-2">
              <button
                onClick={handleSavePreferences}
                disabled={isSaving}
                className={`w-full py-3 px-4 rounded-lg font-medium ${
                  theme === 'dark'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                } transition-colors flex items-center justify-center ${
                  isSaving ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Saving...
                  </>
                ) : savedSuccessfully ? (
                  'Saved Successfully!'
                ) : (
                  'Save Preferences'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Failed to load notification preferences
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationPreferencesPage;
