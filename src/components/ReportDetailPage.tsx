import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Clock, ExternalLink, Eye, Droplets, Zap, Building2, Route, Trash2, FileText, CheckCircle, ArrowRight, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { getReportById, ReportData, getThumbnailUrl, initializeStatusHistoryForExistingReports } from '../services/ReportService';
import { ShinyButton } from './magicui/shiny-button';
import { StatusBadge, PriorityBadge } from './ui/badge';

interface ReportDetailPageProps {
  onNavigate: (page: string) => void;
  reportId: string;
  previousPage?: string;
}

// Timeline event interface for grievance history
interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  actor: string;
  timestamp: string;
  status: 'completed' | 'current' | 'pending';
  icon: string;
  color: string;
}

function ReportDetailPage({ onNavigate, reportId, previousPage = 'status' }: ReportDetailPageProps) {
  const { theme } = useTheme();

  console.log('ReportDetailPage - previousPage:', previousPage, 'reportId:', reportId);

  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReportDetails();
  }, [reportId]);

  const loadReportDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Initialize status history for backward compatibility
      await initializeStatusHistoryForExistingReports();
      
      const reportData = await getReportById(reportId);
      if (reportData) {
        setReport(reportData);
      } else {
        setError('Report not found');
      }
    } catch (err) {
      console.error('Error loading report details:', err);
      setError('Failed to load report details');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
      case 'Water':
        return Droplets;
      case 'Electricity':
        return Zap;
      case 'Infrastructure':
        return Building2;
      case 'Roads':
        return Route;
      case 'Sanitation':
        return Trash2;
      default:
        return MapPin;
    }
  };

  // Generate timeline events from real status history
  const generateTimelineEvents = (report: ReportData): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    
    // Use real status history if available
    if (report.status_history && report.status_history.length > 0) {
      report.status_history.forEach((historyItem, index) => {
        let title = '';
        let description = '';
        let icon = '';
        let color = '';
        
        switch (historyItem.status) {
          case 'Submitted':
            title = 'Grievance Filed';
            description = 'Initial complaint submitted by citizen';
            icon = 'FileText';
            color = 'blue';
            break;
          case 'In Review':
            title = 'Under Review';
            description = 'Complaint is being reviewed by authorities';
            icon = 'Clock';
            color = 'yellow';
            break;
          case 'Forwarded':
            title = 'Forwarded to Department';
            description = `Case forwarded to ${report.category} Department for action`;
            icon = 'ArrowRight';
            color = 'orange';
            break;
          case 'Resolved':
            title = 'Issue Resolved';
            description = 'The reported issue has been successfully resolved';
            icon = 'CheckCircle';
            color = 'green';
            break;
        }
        
        events.push({
          id: `history-${index}`,
          title,
          description: historyItem.notes || description,
          actor: historyItem.actor || 'System',
          timestamp: historyItem.timestamp,
          status: index === report.status_history!.length - 1 ? 'current' : 'completed',
          icon,
          color
        });
      });
    } else {
      // Fallback to basic timeline if no history (for backward compatibility)
      events.push({
        id: '1',
        title: 'Grievance Filed',
        description: 'Initial complaint submitted by citizen',
        actor: 'Citizen',
        timestamp: report.created_at,
        status: 'completed',
        icon: 'FileText',
        color: 'blue'
      });
      
      // Add current status if different from submitted
      if (report.status !== 'Submitted') {
        let title = '';
        let description = '';
        let icon = '';
        let color = '';
        
        switch (report.status) {
          case 'In Review':
            title = 'Under Review';
            description = 'Complaint is being reviewed by authorities';
            icon = 'Clock';
            color = 'yellow';
            break;
          case 'Forwarded':
            title = 'Forwarded to Department';
            description = `Case forwarded to ${report.category} Department for action`;
            icon = 'ArrowRight';
            color = 'orange';
            break;
          case 'Resolved':
            title = 'Issue Resolved';
            description = 'The reported issue has been successfully resolved';
            icon = 'CheckCircle';
            color = 'green';
            break;
        }
        
        events.push({
          id: '2',
          title,
          description,
          actor: 'System',
          timestamp: report.updated_at,
          status: 'current',
          icon,
          color
        });
      }
    }
    
    return events;
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${theme === 'dark' ? 'border-blue-400' : 'border-blue-600'} mx-auto mb-4`}></div>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Loading report details...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate(previousPage)}
              className={`p-2 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Report Details</h1>
          </div>
        </div>

        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${theme === 'dark' ? 'bg-red-900' : 'bg-red-100'} flex items-center justify-center`}>
              <ExternalLink size={32} className={theme === 'dark' ? 'text-red-400' : 'text-red-500'} />
            </div>
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-2`}>
              {error || 'Report Not Found'}
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
              The report you're looking for could not be found or has been removed.
            </p>
            <button
              onClick={() => onNavigate(previousPage)}
              className={`${theme === 'dark' ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3 px-6 rounded-xl font-semibold transition-colors`}
            >
              Back to Reports
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate(previousPage)}
            className={`p-2 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Report Details</h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Ref: {report.report_id}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 pb-24 max-w-5xl mx-auto space-y-6">
        
        {/* Report Header Section */}
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6`}>
          {/* Title with Pin Icon */}
          <div className="flex items-start gap-3 mb-4">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
              <MapPin className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div className="flex-1">
              <h2 className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} leading-tight`}>
                {report.title}
              </h2>
            </div>
          </div>

          {/* Status and Priority Badges */}
          <div className="flex flex-wrap gap-3">
            <StatusBadge
              status={report.status}
              size="md"
              theme={theme}
            />
            <PriorityBadge
              priority={report.priority}
              size="md"
              theme={theme}
            />
          </div>
        </div>

        {/* Description Section */}
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6`}>
          <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
            Description
          </h3>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} leading-relaxed text-base`}>
            {report.description}
          </p>
        </div>

        {/* Location & Image Section - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Location Section */}
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6`}>
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4 flex items-center gap-2`}>
              <MapPin className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              Location
            </h3>
            <div className="space-y-3">
              <div>
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} block mb-1`}>
                  Address
                </label>
                <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-medium`}>
                  {report.location.address}
                </p>
              </div>
              {report.city && (
                <div>
                  <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} block mb-1`}>
                    City
                  </label>
                  <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-medium`}>
                    {report.city}
                  </p>
                </div>
              )}
              <div>
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} block mb-1`}>
                  Coordinates
                </label>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} font-mono text-sm`}>
                  {report.location.lat.toFixed(6)}, {report.location.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>

          {/* Attached Image Section */}
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6`}>
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
              Attached Image
            </h3>
            {report.image_url ? (
              <div className="space-y-4">
                {getThumbnailUrl(report.image_url, 400) ? (
                  <>
                    <div className="relative group">
                      <img
                        src={getThumbnailUrl(report.image_url, 400)}
                        alt="Report attachment"
                        className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(report.image_url, '_blank')}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                        <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <a
                      href={report.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center justify-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'bg-blue-900/50 text-blue-200 hover:bg-blue-800 border border-blue-700'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                      }`}
                    >
                      <Eye size={16} className="mr-2" />
                      View Full Image
                      <ExternalLink size={14} className="ml-2" />
                    </a>
                  </>
                ) : (
                  <div className={`rounded-lg border-2 border-dashed p-8 flex flex-col items-center justify-center h-48 ${theme === 'dark' ? 'border-gray-600 bg-gray-700/30' : 'border-gray-300 bg-gray-50'}`}>
                    <div className={`w-12 h-12 mb-3 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center`}>
                      <Eye size={24} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-center`}>
                      Image not available
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className={`rounded-lg border-2 border-dashed p-8 flex flex-col items-center justify-center h-48 ${theme === 'dark' ? 'border-gray-600 bg-gray-700/30' : 'border-gray-300 bg-gray-50'}`}>
                <div className={`w-12 h-12 mb-3 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center`}>
                  <Eye size={24} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                </div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-center`}>
                  No image attached
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Report Details Section */}
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6`}>
          <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
            Report Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} block mb-2`}>
                Category
              </label>
              <div className="flex items-center gap-2">
                {(() => {
                  const IconComponent = getCategoryIcon(report.category);
                  return <IconComponent size={20} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />;
                })()}
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {report.category}
                </span>
              </div>
            </div>
            <div>
              <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} block mb-2`}>
                Priority
              </label>
              <PriorityBadge
                priority={report.priority}
                size="sm"
                theme={theme}
              />
            </div>
            <div>
              <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} block mb-2`}>
                Status
              </label>
              <StatusBadge
                status={report.status}
                size="sm"
                theme={theme}
              />
            </div>
          </div>
        </div>

        {/* Grievance History & Timeline Section */}
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6`}>
          <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-6`}>
            Grievance History & Timeline
          </h3>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className={`absolute left-6 top-6 bottom-0 w-0.5 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
            
            {/* Timeline Events */}
            <div className="space-y-6">
              {generateTimelineEvents(report).map((event) => (
                <div key={event.id} className="relative flex items-start gap-4">
                  {/* Timeline Dot */}
                  <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
                    event.status === 'completed' 
                      ? theme === 'dark' ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800'
                      : event.status === 'current'
                      ? theme === 'dark' ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'
                      : theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {(() => {
                      const iconMap = {
                        FileText,
                        Clock,
                        ArrowRight,
                        CheckCircle
                      };
                      const IconComponent = iconMap[event.icon as keyof typeof iconMap] || FileText;
                      return <IconComponent size={20} />;
                    })()}
                  </div>
                  
                  {/* Event Content */}
                  <div className="flex-1 min-w-0">
                    <div className={`${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4`}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-lg`}>
                          {event.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Clock className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatDate(event.timestamp)}
                          </span>
                        </div>
                      </div>
                      <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        {event.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center`}>
                          <User size={12} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} />
                        </div>
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          By {event.actor}
                        </span>
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          • {getRelativeTime(event.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <ShinyButton
            onClick={() => onNavigate(previousPage)}
            size="lg"
            className="flex-1 shadow-lg"
          >
            <ArrowLeft size={20} />
            Back to Reports
          </ShinyButton>
          <ShinyButton
            onClick={() => onNavigate('report')}
            size="lg"
            className="flex-1 shadow-lg"
          >
            <FileText size={16} />
            Submit New Report
          </ShinyButton>
        </div>
      </div>
    </div>
  );
}

export default ReportDetailPage;
