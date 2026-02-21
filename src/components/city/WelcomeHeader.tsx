import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { MapPin, RefreshCw, Waves, Shield } from 'lucide-react';
import { LocationData } from '../../hooks/useLocation';

interface WelcomeHeaderProps {
  location: LocationData | null;
  onRefresh: () => void;
  refreshing: boolean;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ location, onRefresh, refreshing }) => {
  const { theme } = useTheme();

  if (!location) return null;

  const getRiskLevelColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const getCoastalZoneIcon = (zone?: string) => {
    switch (zone) {
      case 'east': return '🌊'; // Bay of Bengal
      case 'west': return '🏖️'; // Arabian Sea
      case 'south': return '🌴'; // Southern coast
      case 'island': return '🏝️'; // Islands
      default: return '🌊';
    }
  };

  const getCoastalZoneName = (zone?: string) => {
    switch (zone) {
      case 'east': return 'Bay of Bengal Coast';
      case 'west': return 'Arabian Sea Coast';
      case 'south': return 'Southern Coast';
      case 'island': return 'Island Region';
      default: return 'Coastal Area';
    }
  };

  return (
    <div className="space-y-4">
      {/* Main City Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'} rounded-xl flex items-center justify-center shadow-lg`}>
            <MapPin size={24} className="text-white" />
          </div>
          <div>
            <h1 className={`text-2xl lg:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              {location.city}
            </h1>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {location.state}, {location.country}
              </span>
              {location.district && (
                <>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>•</span>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    {location.district}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={refreshing}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          <span className="text-sm">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Location Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Coastal Zone */}
        <div className={`${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4`}>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">{getCoastalZoneIcon(location.coastalZone)}</span>
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Coastal Zone
            </span>
          </div>
          <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {getCoastalZoneName(location.coastalZone)}
          </p>
        </div>

        {/* Risk Level */}
        <div className={`${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4`}>
          <div className="flex items-center space-x-2 mb-2">
            <Shield size={20} className={getRiskLevelColor(location.riskLevel)} />
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Risk Level
            </span>
          </div>
          <p className={`text-lg font-semibold ${getRiskLevelColor(location.riskLevel)}`}>
            {location.riskLevel?.toUpperCase() || 'UNKNOWN'}
          </p>
        </div>

        {/* Nearest Port */}
        <div className={`${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4`}>
          <div className="flex items-center space-x-2 mb-2">
            <Waves size={20} className="text-blue-500" />
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Nearest Port
            </span>
          </div>
          <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {location.nearestPort || 'Unknown'}
          </p>
        </div>
      </div>

      {/* Coordinates */}
      <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} text-center`}>
        📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)} • Updated {location.lastUpdated.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default WelcomeHeader;