import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { MapPin, Clock, AlertTriangle, ChevronRight, RefreshCw } from 'lucide-react';
import { NearbyReport } from '../../hooks/useNearbyReports';
import Loader from '../Loader';

interface NearbyReportsProps {
  reports: NearbyReport[];
  loading: boolean;
  onNavigate: (page: string) => void;
  showAll?: boolean;
  onRefresh: () => void;
}

const NearbyReports: React.FC<NearbyReportsProps> = ({ 
  reports, 
  loading, 
  onNavigate, 
  showAll = false,
  onRefresh 
}) => {
  const { theme } = useTheme();

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'tsunami': '🌊',
      'cyclone': '🌀',
      'storm-surge': '⛈️',
      'high-waves': '🌊',
      'coastal-erosion': '🏖️',
      'marine-flooding': '🌊',
      'rip-current': '🌊'
    };
    return icons[category] || '📍';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-50 border-green-200';
      case 'in-progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'open': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'closed': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const handleReportClick = (reportId: string) => {
    onNavigate(`report-detail?reportId=${reportId}&from=city`);
  };

  if (loading && reports.length === 0) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'} backdrop-blur-xl rounded-xl p-6 border ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-100/50'}`}>
        <Loader message="Loading nearby reports..." />
      </div>
    );
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'} backdrop-blur-xl rounded-xl p-6 border ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-100/50'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <MapPin className="w-5 h-5 text-blue-500" />
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {showAll ? 'All Nearby Reports' : 'Recent Nearby Reports'}
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
            title="Refresh reports"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          {!showAll && reports.length > 0 && (
            <button
              onClick={() => onNavigate('city')}
              className={`text-sm text-blue-500 hover:text-blue-600 flex items-center space-x-1`}
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="text-center py-8">
          <MapPin className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
          <h4 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            No nearby reports
          </h4>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            There are no ocean hazard reports in your area at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {(showAll ? reports : reports.slice(0, 5)).map((report) => (
            <div
              key={report.id}
              onClick={() => handleReportClick(report.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                theme === 'dark' 
                  ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getCategoryIcon(report.category)}</span>
                  <div>
                    <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {report.title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyColor(report.urgency)}`}>
                        {report.urgency.toUpperCase()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(report.status)}`}>
                        {report.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center space-x-1 text-sm text-gray-500 mb-1">
                    <MapPin className="w-3 h-3" />
                    <span>{report.distance ? `${report.distance}km` : 'Nearby'}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(report.created_at)}</span>
                  </div>
                </div>
              </div>

              <p className={`text-sm mb-3 line-clamp-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {report.description}
              </p>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    {report.location.address}
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <span className="text-green-600">↑{report.votes_up}</span>
                    <span className="text-red-600">↓{report.votes_down}</span>
                  </div>
                  {report.comments_count !== undefined && (
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                      💬 {report.comments_count}
                    </span>
                  )}
                </div>
              </div>

              {report.images && report.images.length > 0 && (
                <div className="mt-2">
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    📷 {report.images.length} image{report.images.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Load more indicator */}
          {!showAll && reports.length > 5 && (
            <div 
              onClick={() => onNavigate('city')}
              className={`text-center py-4 cursor-pointer rounded-lg border-2 border-dashed transition-colors ${
                theme === 'dark' 
                  ? 'border-gray-600 hover:border-blue-500 text-gray-400 hover:text-blue-400' 
                  : 'border-gray-300 hover:border-blue-400 text-gray-500 hover:text-blue-600'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-sm font-medium">View {reports.length - 5} more reports</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary stats for showAll mode */}
      {showAll && reports.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {reports.length}
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Reports
              </p>
            </div>
            <div className="text-center">
              <p className={`text-lg font-bold ${reports.filter(r => r.urgency === 'urgent').length > 0 ? 'text-red-500' : (theme === 'dark' ? 'text-white' : 'text-gray-900')}`}>
                {reports.filter(r => r.urgency === 'urgent').length}
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Urgent
              </p>
            </div>
            <div className="text-center">
              <p className={`text-lg font-bold text-green-500`}>
                {reports.filter(r => r.status === 'resolved').length}
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Resolved
              </p>
            </div>
            <div className="text-center">
              <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {reports.filter(r => r.status === 'open').length}
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Open
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NearbyReports;