/**
 * Related Reports Section Component for Nivaran
 * 
 * Displays related/grouped reports on the report detail page with navigation
 * links and group status indicators. Integrates seamlessly with existing
 * report detail layout and theme system.
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Users, MapPin, Clock, Eye, AlertTriangle } from 'lucide-react';

/**
 * Props for the RelatedReportsSection component
 */
interface RelatedReportsSectionProps {
  currentReportId: string;
  onNavigateToReport: (reportId: string) => void;
  onViewGroup?: (groupId: string) => void;
  className?: string;
}

/**
 * Interface for related report data with grouping information
 */
interface RelatedReportData {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  groupInfo?: {
    groupId: string;
    groupTitle: string;
    confidence: number;
    relationshipType: 'duplicate' | 'similar' | 'related';
    reasons: string[];
    distance?: number; // in meters
  };
}

/**
 * RelatedReportsSection component
 */
const RelatedReportsSection: React.FC<RelatedReportsSectionProps> = ({
  currentReportId,
  onNavigateToReport,
  onViewGroup,
  className = ''
}) => {
  const { theme } = useTheme();
  const [relatedReports, setRelatedReports] = useState<RelatedReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchRelatedReports();
  }, [currentReportId]);

  const fetchRelatedReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API call to fetch related reports
      // This would query the report_group_memberships table to find reports
      // in the same group as the current report
      const mockRelatedReports: RelatedReportData[] = [
        {
          id: 'report_123',
          title: 'Water leak near Oak Street intersection',
          description: 'Large water leak causing flooding on the street corner',
          category: 'Water & Utilities',
          status: 'In Review',
          priority: 'high',
          createdAt: new Date('2024-01-14T08:30:00'),
          location: {
            lat: 40.7129,
            lng: -74.0061,
            address: '123 Oak Street, City Center'
          },
          groupInfo: {
            groupId: 'group_water_oak_st',
            groupTitle: 'Water Issues on Oak Street',
            confidence: 0.92,
            relationshipType: 'duplicate',
            reasons: ['spatial proximity', 'textual similarity', 'category match'],
            distance: 45
          }
        },
        {
          id: 'report_124',
          title: 'Pipe burst flooding Oak Street',
          description: 'Broken water pipe causing significant flooding',
          category: 'Water & Utilities',
          status: 'Forwarded',
          priority: 'urgent',
          createdAt: new Date('2024-01-15T09:15:00'),
          location: {
            lat: 40.7130,
            lng: -74.0059,
            address: '125 Oak Street, City Center'
          },
          groupInfo: {
            groupId: 'group_water_oak_st',
            groupTitle: 'Water Issues on Oak Street',
            confidence: 0.88,
            relationshipType: 'similar',
            reasons: ['spatial proximity', 'category match'],
            distance: 78
          }
        }
      ];

      setRelatedReports(mockRelatedReports);
    } catch (err) {
      console.error('Error fetching related reports:', err);
      setError('Failed to load related reports');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (theme === 'dark') {
      switch (status) {
        case 'Resolved':
          return 'bg-green-900 text-green-200';
        case 'Forwarded':
          return 'bg-blue-900 text-blue-200';
        case 'In Review':
          return 'bg-yellow-900 text-yellow-200';
        case 'Submitted':
          return 'bg-gray-700 text-gray-200';
        default:
          return 'bg-gray-800 text-gray-200';
      }
    } else {
      switch (status) {
        case 'Resolved':
          return 'bg-green-100 text-green-800';
        case 'Forwarded':
          return 'bg-blue-100 text-blue-800';
        case 'In Review':
          return 'bg-yellow-100 text-yellow-800';
        case 'Submitted':
          return 'bg-gray-100 text-gray-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return theme === 'dark' ? 'text-red-400' : 'text-red-600';
      case 'high':
        return theme === 'dark' ? 'text-orange-400' : 'text-orange-600';
      case 'medium':
        return theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600';
      case 'low':
        return theme === 'dark' ? 'text-green-400' : 'text-green-600';
      default:
        return theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const getRelationshipIcon = (type: string) => {
    switch (type) {
      case 'duplicate':
        return '🔄';
      case 'similar':
        return '🔗';
      case 'related':
        return '📎';
      default:
        return '📋';
    }
  };

  const getRelationshipColor = (type: string) => {
    switch (type) {
      case 'duplicate':
        return theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800';
      case 'similar':
        return theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800';
      case 'related':
        return theme === 'dark' ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800';
      default:
        return theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800';
    }
  };

  const formatDistance = (distance?: number): string => {
    if (!distance) return '';
    if (distance < 1000) {
      return `${Math.round(distance)}m away`;
    } else {
      return `${(distance / 1000).toFixed(1)}km away`;
    }
  };

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Recently';
    }
  };

  if (loading) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${theme === 'dark' ? 'border-blue-400' : 'border-blue-600'}`}></div>
          <span className={`ml-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading related reports...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6 ${className}`}>
        <div className={`flex items-center p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
          <AlertTriangle className={`w-5 h-5 mr-3 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
          <div>
            <h4 className={`font-medium ${theme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>
              Error Loading Related Reports
            </h4>
            <p className={`text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render section if no related reports
  if (relatedReports.length === 0) {
    return null;
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
            <Users className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Related Reports
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {relatedReports.length} similar {relatedReports.length === 1 ? 'report' : 'reports'} found
            </p>
          </div>
        </div>

        {relatedReports.length > 2 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
          >
            {expanded ? 'Show Less' : `Show All (${relatedReports.length})`}
          </button>
        )}
      </div>

      {/* Group Information */}
      {relatedReports[0]?.groupInfo && (
        <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              📁 {relatedReports[0].groupInfo.groupTitle}
            </h4>
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
              {Math.round(relatedReports[0].groupInfo.confidence * 100)}% confidence
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {relatedReports[0].groupInfo.reasons.map((reason, index) => (
                <span 
                  key={index}
                  className={`text-xs px-2 py-1 rounded-full ${theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}
                >
                  {reason}
                </span>
              ))}
            </div>
            {onViewGroup && (
              <button
                onClick={() => onViewGroup(relatedReports[0].groupInfo!.groupId)}
                className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
              >
                View Group →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Related Reports List */}
      <div className="space-y-4">
        {(expanded ? relatedReports : relatedReports.slice(0, 2)).map((report) => (
          <div 
            key={report.id}
            className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md cursor-pointer ${
              theme === 'dark' 
                ? 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
            onClick={() => onNavigateToReport(report.id)}
          >
            {/* Report Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {report.groupInfo && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRelationshipColor(report.groupInfo.relationshipType)}`}>
                      {getRelationshipIcon(report.groupInfo.relationshipType)} {report.groupInfo.relationshipType}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </div>
                <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} line-clamp-1`}>
                  {report.title}
                </h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} line-clamp-2 mt-1`}>
                  {report.description}
                </p>
              </div>

              <div className="ml-4 text-right">
                <div className={`text-xs font-medium ${getPriorityColor(report.priority)} mb-1`}>
                  {report.priority.toUpperCase()}
                </div>
                {report.groupInfo?.confidence && (
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {Math.round(report.groupInfo.confidence * 100)}% match
                  </div>
                )}
              </div>
            </div>

            {/* Report Metadata */}
            <div className={`flex items-center justify-between text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{formatRelativeTime(report.createdAt)}</span>
                </div>
                {report.location && (
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span className="truncate max-w-32">{report.location.address}</span>
                  </div>
                )}
                {report.groupInfo?.distance && (
                  <div className="flex items-center">
                    <span className="mr-1">📏</span>
                    <span>{formatDistance(report.groupInfo.distance)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <span className={`mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {report.category}
                </span>
                <Eye className="w-3 h-3" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show More Indicator */}
      {!expanded && relatedReports.length > 2 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setExpanded(true)}
            className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
          >
            +{relatedReports.length - 2} more related {relatedReports.length - 2 === 1 ? 'report' : 'reports'}
          </button>
        </div>
      )}

      {/* Action Button */}
      {relatedReports[0]?.groupInfo && onViewGroup && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={() => onViewGroup(relatedReports[0].groupInfo!.groupId)}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-blue-900/50 text-blue-200 hover:bg-blue-800 border border-blue-700'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            View Complete Group ({relatedReports.length + 1} reports)
          </button>
        </div>
      )}
    </div>
  );
};

export default RelatedReportsSection;