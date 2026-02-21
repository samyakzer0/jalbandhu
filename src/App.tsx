import { useState, useEffect } from 'react';
import { Home, Plus, User, Share2, MapPin, BarChart3, Brain } from 'lucide-react';
import HomePage from './components/HomePage';
import ReportDetailPage from './components/ReportDetailPage';
import WelcomePage from './components/WelcomePage';
import AboutPage from './components/AboutPage';
import AdminPage from './components/AdminPage';
import NotificationsPage from './components/NotificationsPage';
import NotificationsHistoryPage from './components/NotificationsHistoryPage';
import NotificationPreferencesPage from './components/NotificationPreferencesPage';
import GeocodingTest from './components/GeocodingTest';
import CityPage from './components/CityPage';
import ClimateDashboard from './components/ClimateDashboard';
import DataMiningDashboard from './components/DataMiningDashboard';
import { InteractiveMenu, InteractiveMenuItem } from './components/ui/modern-mobile-menu';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { translations } from './utils/translations';
// Import firebase services
import { initializeFirebaseMessaging, onForegroundMessage } from './services/firebase';
import { updateUserIdInReports } from './services/ReportService';
import { updateUserIdInNotifications } from './services/EnhancedNotificationService';

type Page = 'welcome' | 'home' | 'report-detail' | 'about' | 'admin' | 'notifications' | 'notifications-history' | 'notification-preferences' | 'geocoding-test' | 'city' | 'climate-dashboard' | 'data-mining';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [user, setUser] = useState<any>({
    name: 'JalBandhu Guest',
    email: 'guest@jalbandhu.in',
    phone: '',
    joinedYear: '2025',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    isAdmin: false
  });
  const [cameraActive, setCameraActive] = useState(false);
  const [reportDetailId, setReportDetailId] = useState<string>('');
  const [previousPage, setPreviousPage] = useState<Page>('home');
  const { theme, language } = useTheme();
  const t = translations[language];

  useEffect(() => {
    // Auth check removed for open access refactor
    // The app now defaults to a signed-in guest state
    console.log("App running in open access mode");
  }, []);

  const handleNavigate = (page: string) => {
    // Check if page contains parameters
    if (page.includes('?')) {
      const [basePage, params] = page.split('?');
      const cameraActive = params.includes('camera=true');
      const reportId = params.includes('reportId=') ? params.split('reportId=')[1].split('&')[0] : '';
      const fromPage = params.includes('from=') ? params.split('from=')[1].split('&')[0] : '';

      console.log('handleNavigate - page:', page, 'basePage:', basePage, 'reportId:', reportId, 'fromPage:', fromPage);

      setCurrentPage(basePage as Page);

      // If navigating to report with camera=true, set cameraActive
      if (basePage === 'report' && cameraActive) {
        setCameraActive(true);
      }

      // If navigating to report-detail, set the report ID and previous page
      if (basePage === 'report-detail' && reportId) {
        setReportDetailId(reportId);
        if (fromPage) {
          setPreviousPage(fromPage as Page);
        }
      }
    } else {
      setCurrentPage(page as Page);
      setCameraActive(false);
      setReportDetailId('');
      setPreviousPage('home'); // Default to home page
    }
  };

  const handleSignIn = async (provider: string) => {
    // Authentication removed - app now runs without sign-in
    console.log('Sign-in attempted but authentication has been removed');
    setCurrentPage('home');
  };

  // Anonymous login has been removed as requested

  const handleSignOut = () => {
    setIsSignedIn(false);
    setUser(null);
    setCurrentPage('welcome');
  };

  const renderPage = () => {
    // Generate a unique ID for anonymous users and store it in localStorage
    const getUserId = () => {
      if (isSignedIn && user) {
        return user.email; // Use email as ID for signed in users
      }

      // For anonymous users, generate a persistent ID
      let anonymousId = localStorage.getItem('jalBandhu_anonymous_id');
      if (!anonymousId) {
        anonymousId = 'anon_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('jalBandhu_anonymous_id', anonymousId);
      }
      return anonymousId;
    };

    const userId = getUserId();

    switch (currentPage) {
      case 'welcome':
        // Welcome page kept for reference but not used in main flow
        return <HomePage onNavigate={handleNavigate} userId={userId} />;
      case 'home':
        return <HomePage onNavigate={handleNavigate} userId={userId} />;
      case 'report-detail':
        return <ReportDetailPage onNavigate={handleNavigate} reportId={reportDetailId} previousPage={previousPage} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminPage onNavigate={handleNavigate} user={user} />; // Pass user to AdminPage
      case 'notifications':
        return <NotificationsPage onNavigate={handleNavigate} userId={userId} />;
      case 'notifications-history':
        return <NotificationsHistoryPage onNavigate={handleNavigate} userId={userId} />;
      case 'notification-preferences':
        return <NotificationPreferencesPage onNavigate={handleNavigate} userId={userId} />;
      case 'geocoding-test':
        return <GeocodingTest />;
      case 'city':
        return <CityPage onNavigate={handleNavigate} userId={userId} />;
      case 'climate-dashboard':
        return <ClimateDashboard />;
      case 'data-mining':
        return <DataMiningDashboard />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  const showNavigation = currentPage !== 'welcome';

  // Define menu items for the modern mobile menu
  const menuItems: InteractiveMenuItem[] = [
    { label: t.home, icon: Home, page: 'home' },
    { label: 'AI Analytics', icon: Brain, page: 'data-mining' },
    { label: 'Climate', icon: BarChart3, page: 'climate-dashboard' }
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Main App Container with Responsive Layout */}
      <div className={`w-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} min-h-screen relative overflow-hidden`}>
        {renderPage()}

        {showNavigation && (
          <InteractiveMenu
            items={menuItems}
            onNavigate={(page: string) => setCurrentPage(page as Page)}
            currentPage={currentPage}
            isAdmin={true}
            accentColor={theme === 'dark' ? 'rgb(147 197 253)' : 'rgb(59 130 246)'}
          />
        )}
      </div>
    </div>
  );
}

function App() {
  const [userId, setUserId] = useState<string>(() => {
    // Get user ID from localStorage if available
    const storedId = localStorage.getItem('jalBandhu_anonymous_id');
    return storedId || 'anon_default';
  });

  useEffect(() => {
    // Initialize Firebase notifications without authentication
    const setupUser = async () => {
      try {
        // Initialize Firebase messaging
        await initializeFirebaseMessaging();
        // Use anonymous user ID for notifications
        const anonymousId = localStorage.getItem('jalBandhu_anonymous_id') || userId;
        onForegroundMessage(anonymousId);
      } catch (error) {
        console.error("Error setting up notifications:", error);
      }
    };

    setupUser();
  }, [userId]);

  return (
    <ThemeProvider>
      <NotificationProvider userId={userId}>
        <AppContent />
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
