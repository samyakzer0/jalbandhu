import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight, MapPin, Droplets, Zap, Waves, CloudRain, Mountain, Fuel, Skull, Leaf, TrendingUp, Anchor, LifeBuoy, AlertTriangle, Tornado } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../utils/translations';
import { getUserReports, ReportData } from '../services/ReportService';
import Loader from './Loader';
import { StatusBadge, PriorityBadge, SmartCameraBadge } from './ui/badge';

interface StatusPageProps {
  onNavigate: (page: string) => void;
  isSignedIn: boolean;
  userId?: string;
}

function StatusPage({ onNavigate, isSignedIn, userId = 'anon_user' }: StatusPageProps) {
  const { theme, language } = useTheme();
  const t = translations[language];
  
  const [reports, setReports] = useState<ReportData[]>([]);
  const [filter, setFilter] = useState<string | null>(null); // Filter by category
  const [isLoading, setIsLoading] = useState(true);
  
  // Categories for filtering
  const categories = ['All', 'Tsunami', 'Cyclone', 'Storm Surge', 'High Waves', 'Coastal Erosion', 'Marine Pollution', 'Oil Spill', 'Dead Zone', 'Algal Bloom', 'Sea Level Rise', 'Extreme Weather', 'Maritime Accident', 'Search and Rescue', 'Navigation Hazard', 'Other'];
  
  useEffect(() => {
    // Load user reports from local storage or API
    loadReports();
  }, [userId]);
  
  const loadReports = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, we would fetch from an API
      // For prototype, we're using the service that stores data in localStorage
      const userReports = await getUserReports(userId);
      console.log('Fetched reports:', userReports);
      
      // Sort reports by created date (newest first)
      const sortedReports = [...userReports].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setReports(sortedReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredReports = filter && filter !== 'All' 
    ? reports.filter(report => report.category.toLowerCase() === filter.toLowerCase())
    : reports;
    
  // Format relative time (e.g., "2 hours ago")
  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMins > 0) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Tsunami':
        return 'Waves';
      case 'Cyclone':
        return 'Tornado';
      case 'Storm Surge':
        return 'CloudRain';
      case 'High Waves':
        return 'Waves';
      case 'Coastal Erosion':
        return 'Mountain';
      case 'Marine Pollution':
        return 'Droplets';
      case 'Oil Spill':
        return 'Fuel';
      case 'Dead Zone':
        return 'Skull';
      case 'Algal Bloom':
        return 'Leaf';
      case 'Sea Level Rise':
        return 'TrendingUp';
      case 'Extreme Weather':
        return 'Zap';
      case 'Maritime Accident':
        return 'Anchor';
      case 'Search and Rescue':
        return 'LifeBuoy';
      case 'Navigation Hazard':
        return 'AlertTriangle';
      case 'Other':
        return 'MapPin';
      default:
        return 'MapPin';
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4 md:rounded-t-xl`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('home')}
            className={`p-2 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{t.reportStatus}</h1>
        </div>
      </div>

      {/* Filter bar */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 border-b`}>
        <div className="flex flex-wrap gap-2 max-w-7xl mx-auto">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setFilter(category === 'All' ? null : category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                (filter === category || (category === 'All' && filter === null))
                  ? theme === 'dark'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-blue-600 text-white shadow-md' 
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 pb-24 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader size="medium" message="Loading your reports..." />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>No reports yet.</p>
            <button
              onClick={() => onNavigate('report')}
              className={`mt-4 ${theme === 'dark' ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} text-white py-2 px-4 rounded-lg font-medium transition-colors`}
            >
              Submit Your First Report
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReports.map((report) => (
              <div
                key={report.report_id}
                className={`${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                } p-6 rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 relative overflow-hidden group cursor-pointer`}
                onClick={() => onNavigate(`report-detail?reportId=${report.report_id}&from=status`)}
              >
                {/* Status indicator bar */}
                <div className={`absolute top-0 left-0 w-full h-1 ${
                  report.status === 'Verified'
                    ? 'bg-green-500'
                    : report.status === 'Reviewed'
                    ? 'bg-yellow-500'
                    : 'bg-gray-400'
                }`}></div>
                
                <div className="relative">
                  {/* Reference ID */}
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-3 font-mono`}>
                    REF: {report.report_id}
                  </div>
                  
                  {/* Title and Status */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} flex-1 flex items-center gap-2`}>
                      {(() => {
                        const iconName = getCategoryIcon(report.category);
                        const IconComponent = {
                          Droplets,
                          Zap,
                          Waves,
                          CloudRain,
                          Mountain,
                          Fuel,
                          Skull,
                          Leaf,
                          TrendingUp,
                          Anchor,
                          LifeBuoy,
                          AlertTriangle,
                          Tornado,
                          MapPin
                        }[iconName] || MapPin;
                        return <IconComponent size={18} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />;
                      })()}
                      {report.title}
                    </h3>
                    <StatusBadge
                      status={report.status}
                      size="md"
                      theme={theme}
                    />
                  </div>
                  
                  {/* Category and Priority */}
                  <div className="flex items-center gap-4 mb-3">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Category: <span className="font-medium">{report.category}</span>
                    </span>
                    <PriorityBadge
                      priority={report.priority}
                      size="sm"
                      theme={theme}
                    />
                    {report.is_smart_camera_report && (
                      <SmartCameraBadge
                        size="sm"
                        theme={theme}
                      />
                    )}
                  </div>
                  
                  {/* Location */}
                  <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm mb-4 flex items-center gap-1`}>
                    <MapPin size={14} />
                    <span className="truncate">{report.location.address}</span>
                  </div>
                  
                  {/* Footer */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} text-sm`}>
                      Updated {getRelativeTime(report.updated_at)}
                    </div>
                    
                    <div className={`p-2 rounded-full transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatusPage;