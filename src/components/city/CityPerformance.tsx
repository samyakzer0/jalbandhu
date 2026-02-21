import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, BarChart } from 'lucide-react';
import { LocationData } from '../../hooks/useLocation';
import { NearbyReport } from '../../hooks/useNearbyReports';

interface CityPerformanceProps {
  location: LocationData | null;
  reports: NearbyReport[];
  compact?: boolean;
}

const CityPerformance: React.FC<CityPerformanceProps> = ({ location, reports, compact = false }) => {
  const { theme } = useTheme();

  if (!location) return null;

  // Calculate performance metrics
  const getPerformanceMetrics = () => {
    const now = new Date();
    const last7Days = reports.filter(r => {
      const reportDate = new Date(r.created_at);
      const daysDiff = (now.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    });

    const last30Days = reports.filter(r => {
      const reportDate = new Date(r.created_at);
      const daysDiff = (now.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30;
    });

    // Resolution rate
    const resolvedReports = reports.filter(r => r.status === 'resolved');
    const resolutionRate = reports.length > 0 ? (resolvedReports.length / reports.length) * 100 : 0;

    // Average response time (simulated based on urgency)
    const getAverageResponseTime = () => {
      if (reports.length === 0) return 0;
      
      const responseTimes = reports.map(r => {
        // Simulate response time based on urgency and status
        switch (r.urgency) {
          case 'urgent': return r.status === 'resolved' ? 2 : 6;
          case 'high': return r.status === 'resolved' ? 8 : 24;
          case 'medium': return r.status === 'resolved' ? 48 : 96;
          case 'low': return r.status === 'resolved' ? 120 : 240;
          default: return 48;
        }
      });

      return responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    };

    const avgResponseTime = getAverageResponseTime();

    // Safety score (based on resolution rate, response time, and risk level)
    const getSafetyScore = () => {
      let score = 85; // Base score
      
      // Adjust based on resolution rate
      score += (resolutionRate - 50) * 0.3;
      
      // Adjust based on response time (faster is better)
      if (avgResponseTime < 6) score += 10;
      else if (avgResponseTime < 24) score += 5;
      else if (avgResponseTime > 72) score -= 10;
      
      // Adjust based on risk level
      if (location.riskLevel === 'low') score += 5;
      else if (location.riskLevel === 'high') score -= 5;
      else if (location.riskLevel === 'critical') score -= 10;
      
      // Adjust based on recent activity
      if (last7Days.length > last30Days.length * 0.5) score -= 5; // High recent activity might indicate problems
      
      return Math.max(0, Math.min(100, Math.round(score)));
    };

    const safetyScore = getSafetyScore();

    return {
      total: reports.length,
      last7Days: last7Days.length,
      last30Days: last30Days.length,
      resolved: resolvedReports.length,
      resolutionRate,
      avgResponseTime,
      safetyScore,
      urgent: reports.filter(r => r.urgency === 'urgent').length,
      open: reports.filter(r => r.status === 'open').length
    };
  };

  const metrics = getPerformanceMetrics();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const formatResponseTime = (hours: number) => {
    if (hours < 24) return `${Math.round(hours)}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  };

  if (compact) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'} backdrop-blur-xl rounded-xl p-4 border ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-100/50'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            City Performance
          </h3>
          <BarChart className="w-5 h-5 text-blue-500" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className={`text-2xl font-bold ${getScoreColor(metrics.safetyScore)}`}>
              {metrics.safetyScore}
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Safety Score
            </p>
          </div>
          
          <div className="text-center">
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {Math.round(metrics.resolutionRate)}%
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Resolved
            </p>
          </div>
          
          <div className="text-center">
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {formatResponseTime(metrics.avgResponseTime)}
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Avg Response
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Safety Score Card */}
      <div className={`${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'} backdrop-blur-xl rounded-xl p-6 border ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-100/50'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            City Safety Score
          </h2>
          <div className="flex items-center space-x-2">
            {metrics.safetyScore >= 80 ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : metrics.safetyScore >= 60 ? (
              <BarChart className="w-5 h-5 text-yellow-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
          </div>
        </div>

        <div className="text-center mb-6">
          <div className={`text-6xl font-bold ${getScoreColor(metrics.safetyScore)} mb-2`}>
            {metrics.safetyScore}
          </div>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            out of 100
          </p>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-3`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Resolution Rate
              </span>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {Math.round(metrics.resolutionRate)}%
            </p>
          </div>

          <div className={`${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-3`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Avg Response Time
              </span>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {formatResponseTime(metrics.avgResponseTime)}
            </p>
          </div>
        </div>
      </div>

      {/* Activity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'} backdrop-blur-xl rounded-xl p-4 border ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-100/50'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Reports
            </span>
            <BarChart className="w-4 h-4 text-blue-500" />
          </div>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {metrics.total}
          </p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'} backdrop-blur-xl rounded-xl p-4 border ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-100/50'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              This Week
            </span>
            <Clock className="w-4 h-4 text-green-500" />
          </div>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {metrics.last7Days}
          </p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'} backdrop-blur-xl rounded-xl p-4 border ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-100/50'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Urgent Issues
            </span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <p className={`text-2xl font-bold ${metrics.urgent > 0 ? 'text-red-500' : (theme === 'dark' ? 'text-white' : 'text-gray-900')}`}>
            {metrics.urgent}
          </p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'} backdrop-blur-xl rounded-xl p-4 border ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-100/50'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Open Issues
            </span>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </div>
          <p className={`text-2xl font-bold ${metrics.open > 0 ? 'text-orange-500' : (theme === 'dark' ? 'text-white' : 'text-gray-900')}`}>
            {metrics.open}
          </p>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className={`${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'} backdrop-blur-xl rounded-xl p-4 border ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-100/50'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Performance Indicators
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Response Quality
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, metrics.resolutionRate)}%` }}
                />
              </div>
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {Math.round(metrics.resolutionRate)}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Recent Activity
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, (metrics.last7Days / Math.max(1, metrics.total)) * 100)}%` }}
                />
              </div>
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {Math.round((metrics.last7Days / Math.max(1, metrics.total)) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityPerformance;