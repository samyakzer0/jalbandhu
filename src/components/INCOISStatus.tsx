/**
 * INCOIS Status Indicator
 * Shows the current status of INCOIS integration in the UI
 */

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Waves, AlertCircle, CheckCircle, WifiOff } from 'lucide-react';

interface INCOISStatusProps {
  isLoading?: boolean;
  hasData?: boolean;
  error?: string | null;
  compact?: boolean;
}

const INCOISStatus: React.FC<INCOISStatusProps> = ({ 
  isLoading = false, 
  hasData = false, 
  error = null,
  compact = false 
}) => {
  const { theme } = useTheme();

  const getStatusInfo = () => {
    if (isLoading) {
      return {
        icon: <Waves className="w-4 h-4 animate-pulse" />,
        text: 'Loading INCOIS data...',
        color: 'text-blue-500',
        bgColor: 'bg-blue-100',
        darkBgColor: 'bg-blue-900/20'
      };
    }
    
    if (error) {
      return {
        icon: <WifiOff className="w-4 h-4" />,
        text: compact ? 'Offline' : 'INCOIS Offline - Using Demo Data',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        darkBgColor: 'bg-orange-900/20'
      };
    }
    
    if (hasData) {
      return {
        icon: <CheckCircle className="w-4 h-4" />,
        text: compact ? 'Active' : 'INCOIS Data Active',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        darkBgColor: 'bg-green-900/20'
      };
    }
    
    return {
      icon: <AlertCircle className="w-4 h-4" />,
      text: compact ? 'No Data' : 'No INCOIS Data Available',
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
      darkBgColor: 'bg-gray-800'
    };
  };

  const status = getStatusInfo();

  if (compact) {
    return (
      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
        theme === 'dark' ? status.darkBgColor + ' ' + status.color : status.bgColor + ' ' + status.color
      }`}>
        {status.icon}
        <span>{status.text}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 p-3 rounded-lg border ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700 text-gray-300' 
        : 'bg-white border-gray-200 text-gray-700'
    }`}>
      <div className={status.color}>
        {status.icon}
      </div>
      <div className="flex-1">
        <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          INCOIS Integration
        </div>
        <div className={`text-xs ${status.color}`}>
          {status.text}
        </div>
      </div>
      <div className={`w-2 h-2 rounded-full ${
        isLoading 
          ? 'bg-blue-500 animate-pulse' 
          : hasData && !error 
          ? 'bg-green-500' 
          : error 
          ? 'bg-orange-500' 
          : 'bg-gray-400'
      }`}></div>
    </div>
  );
};

export default INCOISStatus;