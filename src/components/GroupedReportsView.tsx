/**
 * Grouped Reports View Component for Nivaran Admin Dashboard
 * 
 * Displays grouped reports with aggregated status, metadata, and navigation
 * between related reports. Provides admin interface for managing duplicate
 * report groups and reviewing suggested groupings.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ReportGroup, ReportData } from '../services/ReportGroupingService';
import { GeoCoordinate } from '../services/GeospatialUtils';

/**
 * Props for the GroupedReportsView component
 */
interface GroupedReportsViewProps {
  onNavigate: (page: string, data?: any) => void;
  currentUser?: {
    id: string;
    role: string;
  };
}

/**
 * Interface for grouped report data with additional UI state
 */
interface GroupedReportWithUI extends ReportGroup {
  expanded: boolean;
  selectedReports: Set<string>;
  lastUpdatedBy?: string;
  requiresReview: boolean;
  reports: ReportData[]; // Full report data for the group
}

/**
 * Main GroupedReportsView component
 */
const GroupedReportsView: React.FC<GroupedReportsViewProps> = ({
  onNavigate,
  currentUser: _currentUser // Prefixed with underscore to indicate unused parameter
}) => {
  const [groupedReports, setGroupedReports] = useState<GroupedReportWithUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'confidence' | 'date' | 'priority' | 'reportCount'>('confidence');
  const [filterBy, setFilterBy] = useState<'all' | 'needsReview' | 'autoGrouped' | 'highConfidence'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for development - replace with actual data fetching
  useEffect(() => {
    const fetchGroupedReports = async () => {
      try {
        setLoading(true);
        
        // TODO: Replace with actual API call
        const mockGroups: GroupedReportWithUI[] = [
          {
            id: 'group_1',
            title: 'Water Main Break on Oak Street',
            description: 'Multiple reports of water main break causing flooding',
            category: 'Water & Utilities',
            priority: 'urgent',
            status: 'in_progress',
            location: { latitude: 40.7128, longitude: -74.0060 },
            reportCount: 4,
            reportIds: ['report_1', 'report_2', 'report_3', 'report_4'],
            confidence: 0.92,
            createdAt: new Date('2024-01-15T10:30:00'),
            updatedAt: new Date('2024-01-15T14:22:00'),
            metadata: {
              primaryReportId: 'report_1',
              groupingReasons: ['spatial proximity', 'textual similarity', 'category match'],
              averageConfidence: 0.88,
              spatialRadius: 85,
              textSimilarityRange: { min: 0.82, max: 0.95 }
            },
            expanded: false,
            selectedReports: new Set(),
            requiresReview: false,
            reports: [] // Would be populated with actual report data
          },
          {
            id: 'group_2',
            title: 'Pothole Issues on Main Street',
            description: 'Several reports of dangerous potholes requiring attention',
            category: 'Roads & Transportation',
            priority: 'high',
            status: 'open',
            location: { latitude: 40.7589, longitude: -73.9851 },
            reportCount: 3,
            reportIds: ['report_5', 'report_6', 'report_7'],
            confidence: 0.76,
            createdAt: new Date('2024-01-14T09:15:00'),
            updatedAt: new Date('2024-01-14T16:45:00'),
            metadata: {
              primaryReportId: 'report_5',
              groupingReasons: ['spatial proximity', 'category match'],
              averageConfidence: 0.73,
              spatialRadius: 120,
              textSimilarityRange: { min: 0.65, max: 0.81 }
            },
            expanded: false,
            selectedReports: new Set(),
            requiresReview: true,
            reports: []
          }
        ];

        setGroupedReports(mockGroups);
        setError(null);
      } catch (err) {
        setError('Failed to load grouped reports');
        console.error('Error fetching grouped reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupedReports();
  }, []);

  // Filter and sort grouped reports
  const filteredAndSortedGroups = useMemo(() => {
    let filtered = groupedReports;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(group => 
        group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    switch (filterBy) {
      case 'needsReview':
        filtered = filtered.filter(group => group.requiresReview);
        break;
      case 'autoGrouped':
        filtered = filtered.filter(group => !group.requiresReview && group.confidence >= 0.85);
        break;
      case 'highConfidence':
        filtered = filtered.filter(group => group.confidence >= 0.8);
        break;
      // 'all' doesn't need filtering
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'confidence':
          return b.confidence - a.confidence;
        case 'date':
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'reportCount':
          return b.reportCount - a.reportCount;
        default:
          return 0;
      }
    });
  }, [groupedReports, searchTerm, filterBy, sortBy]);

  const toggleGroupExpansion = (groupId: string) => {
    setGroupedReports(prev => 
      prev.map(group => 
        group.id === groupId 
          ? { ...group, expanded: !group.expanded }
          : group
      )
    );
  };

  const handleReportSelection = (groupId: string, reportId: string) => {
    setGroupedReports(prev => 
      prev.map(group => {
        if (group.id === groupId) {
          const newSelected = new Set(group.selectedReports);
          if (newSelected.has(reportId)) {
            newSelected.delete(reportId);
          } else {
            newSelected.add(reportId);
          }
          return { ...group, selectedReports: newSelected };
        }
        return group;
      })
    );
  };

  const handleViewReport = (reportId: string) => {
    onNavigate('report-detail', { reportId });
  };

  const handleApproveGrouping = async (groupId: string) => {
    try {
      // TODO: Implement API call to approve grouping
      console.log('Approving grouping for group:', groupId);
      
      setGroupedReports(prev => 
        prev.map(group => 
          group.id === groupId 
            ? { ...group, requiresReview: false, status: 'in_progress' as any }
            : group
        )
      );
    } catch (err) {
      console.error('Error approving grouping:', err);
    }
  };

  const handleRejectGrouping = async (groupId: string) => {
    try {
      // TODO: Implement API call to reject grouping
      console.log('Rejecting grouping for group:', groupId);
      
      setGroupedReports(prev => prev.filter(group => group.id !== groupId));
    } catch (err) {
      console.error('Error rejecting grouping:', err);
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-50';
      case 'in_progress': return 'text-yellow-600 bg-yellow-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'duplicate': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatLocation = (location?: GeoCoordinate): string => {
    if (!location) return 'No location';
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading grouped reports...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="text-red-600 mr-3">⚠️</div>
          <div>
            <h3 className="text-red-800 font-medium">Error Loading Grouped Reports</h3>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Grouped Reports</h1>
        <p className="text-gray-600">
          Manage duplicate and related reports identified by the automatic grouping system
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search grouped reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filter */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Groups</option>
            <option value="needsReview">Needs Review</option>
            <option value="autoGrouped">Auto-Grouped</option>
            <option value="highConfidence">High Confidence</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="confidence">By Confidence</option>
            <option value="date">By Date</option>
            <option value="priority">By Priority</option>
            <option value="reportCount">By Report Count</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-blue-600">{filteredAndSortedGroups.length}</div>
          <div className="text-gray-600 text-sm">Total Groups</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-orange-600">
            {filteredAndSortedGroups.filter(g => g.requiresReview).length}
          </div>
          <div className="text-gray-600 text-sm">Need Review</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-green-600">
            {filteredAndSortedGroups.reduce((sum, g) => sum + g.reportCount, 0)}
          </div>
          <div className="text-gray-600 text-sm">Total Reports</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(filteredAndSortedGroups.reduce((sum, g) => sum + g.confidence, 0) / filteredAndSortedGroups.length * 100) || 0}%
          </div>
          <div className="text-gray-600 text-sm">Avg Confidence</div>
        </div>
      </div>

      {/* Groups List */}
      <div className="space-y-4">
        {filteredAndSortedGroups.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-gray-900 font-medium mb-2">No Grouped Reports Found</h3>
            <p className="text-gray-600">
              {searchTerm || filterBy !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No duplicate reports have been detected yet.'}
            </p>
          </div>
        ) : (
          filteredAndSortedGroups.map((group) => (
            <div key={group.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* Group Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => toggleGroupExpansion(group.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {group.expanded ? '▼' : '▶'}
                    </button>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{group.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{group.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {group.requiresReview && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                        Needs Review
                      </span>
                    )}
                    
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(group.priority)}`}>
                      {group.priority.toUpperCase()}
                    </span>
                    
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(group.status)}`}>
                      {group.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Group Metadata */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Reports:</span>
                    <span className="ml-2 font-medium">{group.reportCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Confidence:</span>
                    <span className="ml-2 font-medium">{Math.round(group.confidence * 100)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <span className="ml-2 font-medium">{group.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <span className="ml-2 font-medium">{formatLocation(group.location)}</span>
                  </div>
                </div>

                {/* Grouping Reasons */}
                <div className="mt-3">
                  <span className="text-gray-500 text-sm">Grouped by:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {group.metadata.groupingReasons.map((reason, index) => (
                      <span 
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {group.expanded && (
                <div className="p-4">
                  {/* Action Buttons for Review */}
                  {group.requiresReview && (
                    <div className="mb-4 flex space-x-3">
                      <button
                        onClick={() => handleApproveGrouping(group.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                      >
                        ✓ Approve Grouping
                      </button>
                      <button
                        onClick={() => handleRejectGrouping(group.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                      >
                        ✗ Reject Grouping
                      </button>
                    </div>
                  )}

                  {/* Detailed Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-medium text-gray-700 mb-2">Spatial Analysis</div>
                      {group.metadata.spatialRadius ? (
                        <div>Radius: {Math.round(group.metadata.spatialRadius)}m</div>
                      ) : (
                        <div className="text-gray-500">No spatial data</div>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-medium text-gray-700 mb-2">Text Similarity</div>
                      <div>
                        Range: {Math.round(group.metadata.textSimilarityRange.min * 100)}% - {Math.round(group.metadata.textSimilarityRange.max * 100)}%
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-medium text-gray-700 mb-2">Group Info</div>
                      <div>Primary: {group.metadata.primaryReportId}</div>
                      <div>Avg Confidence: {Math.round(group.metadata.averageConfidence * 100)}%</div>
                    </div>
                  </div>

                  {/* Report List */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Reports in this group:</h4>
                    <div className="space-y-2">
                      {group.reportIds.map((reportId, index) => (
                        <div 
                          key={reportId}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded"
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={group.selectedReports.has(reportId)}
                              onChange={() => handleReportSelection(group.id, reportId)}
                              className="rounded border-gray-300"
                            />
                            <div>
                              <div className="font-medium">Report #{reportId}</div>
                              <div className="text-sm text-gray-600">
                                {index === 0 && '(Primary)'} 
                                {/* In real implementation, show actual report title */}
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleViewReport(reportId)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Details →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GroupedReportsView;