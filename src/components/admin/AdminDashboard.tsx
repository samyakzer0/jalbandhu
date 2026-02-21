import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Zap } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import AdminAnalytics from '../AdminAnalytics';
import SmartCameraPanel from '../SmartCameraPanel';

interface AdminDashboardProps {
  onNavigate?: (page: string) => void;
  user?: any;
}

function AdminDashboard({ onNavigate, user }: AdminDashboardProps) {
  const { theme } = useTheme();
  const [userName, setUserName] = useState<string>('');
  const [currentView, setCurrentView] = useState<'analytics' | 'smart-camera'>('analytics');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load user info without authentication
    const loadUserInfo = () => {
      try {
        // Use provided user or default guest admin
        if (user && user.name) {
          setUserName(user.name);
        } else if (user && user.email) {
          setUserName(user.email);
        } else {
          setUserName('Admin User');
        }
      } catch (error) {
        console.error('Error loading admin info:', error);
      }
    };
    
    loadUserInfo();
  }, [user]);

  // Function to refresh tasks - can be called from child components
  const refreshTasks = () => {
    // Task management removed - Comments system available in main navigation
    console.log('Task refresh requested - using Comments system instead');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b pt-2 pb-4 px-4 md:rounded-t-xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onNavigate && (
              <button
                onClick={() => onNavigate && onNavigate('home')}
                className={`p-2 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
              >
                <ArrowLeft size={24} />
              </button>
            )}
            <div className="flex items-center space-x-3">
              
              <div>
                <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  Admin
                </h1>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {userName}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 pb-24 max-w-7xl mx-auto">
        {/* Navigation Tabs */}
        <div className={`mb-6 p-2 rounded-xl ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'} backdrop-blur-xl shadow-lg border ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              onClick={() => setCurrentView('analytics')}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                currentView === 'analytics'
                  ? theme === 'dark'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-blue-600 text-white shadow-lg'
                  : theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/50'
              }`}
            >
              <TrendingUp size={18} />
              <span className="hidden sm:inline">Analytics Dashboard</span>
              <span className="sm:hidden">Analytics</span>
            </button>
            
            <button
              onClick={() => setCurrentView('smart-camera')}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                currentView === 'smart-camera'
                  ? theme === 'dark'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-blue-600 text-white shadow-lg'
                  : theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/50'
              }`}
            >
              <Zap size={18} />
              <span className="hidden sm:inline">Ocean Smart Camera</span>
              <span className="sm:hidden">Ocean Camera</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        {currentView === 'analytics' ? (
          /* Analytics Dashboard */
          <div>
            <AdminAnalytics />
          </div>
        ) : currentView === 'smart-camera' ? (
          /* Smart Camera Integration */
          <div>
            <SmartCameraPanel />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default AdminDashboard;
