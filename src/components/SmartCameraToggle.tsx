import React, { useState, useEffect } from 'react';
import { Camera, Zap, Activity } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import smartCameraService from '../services/SmartCameraService';

interface SmartCameraToggleProps {
  className?: string;
  onNavigate?: (page: string) => void;
}

const SmartCameraToggle: React.FC<SmartCameraToggleProps> = ({ 
  className = '',
  onNavigate
}) => {
  const { theme } = useTheme();
  const [isEnabled, setIsEnabled] = useState(false);
  const [statistics, setStatistics] = useState(smartCameraService.getStatistics());

  useEffect(() => {
    // Update status every 30 seconds
    const interval = setInterval(() => {
      const stats = smartCameraService.getStatistics();
      setStatistics(stats);
      setIsEnabled(stats.isEnabled);
    }, 30000);

    // Initial load
    const stats = smartCameraService.getStatistics();
    setStatistics(stats);
    setIsEnabled(stats.isEnabled);

    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    // Navigate to admin panel smart camera section if onNavigate is provided
    if (onNavigate) {
      onNavigate('admin'); // This will open admin panel, then user can navigate to smart camera tab
    } else {
      // Fallback: just show an alert
      alert('Smart Camera management is available in the Admin Panel');
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        isEnabled
          ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
          : theme === 'dark'
          ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
          : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm'
      } ${className}`}
      title={isEnabled ? 'Smart Camera Active - Click to manage' : 'Manage Smart Camera in Admin Panel'}
    >
      <div className="relative">
        <Camera className="w-5 h-5" />
        {isEnabled && (
          <div className="absolute -top-1 -right-1 w-3 h-3">
            <Activity className="w-3 h-3 text-green-300 animate-pulse" />
          </div>
        )}
      </div>
      
      <span className="font-medium">
        Smart Camera
      </span>
      
      {isEnabled && (
        <div className="flex items-center gap-1">
          <Zap className="w-4 h-4 text-green-200" />
          <span className="text-sm">Active</span>
        </div>
      )}
      
      {statistics.reportsCreated > 0 && (
        <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
          isEnabled ? 'bg-white text-green-600' : 'bg-blue-500 text-white'
        }`}>
          {statistics.reportsCreated > 99 ? '99+' : statistics.reportsCreated}
        </div>
      )}
    </button>
  );
};

export default SmartCameraToggle;