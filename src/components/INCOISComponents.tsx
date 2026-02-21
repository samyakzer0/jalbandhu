/**
 * INCOIS Display Components
 * Reusable UI components for displaying INCOIS data in JalBandhu
 */

import React from 'react';
import { 
  AlertTriangle, 
  Waves, 
  Activity, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertOctagon, 
  Wind,
  TrendingUp,
  TrendingDown,
  Radio,
  Zap,
  Gauge
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import type { 
  EarlyWarning, 
  MarineConditions, 
  OfficialAlert, 
  SensorNetworkStatus
} from '../services/INCOISService';

interface INCOISBannerProps {
  warnings: EarlyWarning[];
  onViewDetails?: (warning: EarlyWarning) => void;
}

/**
 * INCOIS Official Alerts Banner - Priority display at top of city page
 */
export const INCOISBanner: React.FC<INCOISBannerProps> = ({ warnings, onViewDetails }) => {
  if (!warnings.length) return null;

  const criticalWarnings = warnings.filter(w => w.severity === 'emergency' || w.severity === 'warning');
  const displayWarning = criticalWarnings[0] || warnings[0];

  const getSeverityColors = (severity: string) => {
    switch (severity) {
      case 'emergency': return 'bg-red-600 text-white border-red-700';
      case 'warning': return 'bg-orange-500 text-white border-orange-600';
      case 'advisory': return 'bg-yellow-500 text-white border-yellow-600';
      case 'watch': return 'bg-blue-500 text-white border-blue-600';
      default: return 'bg-gray-500 text-white border-gray-600';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'tsunami': return <Waves className="w-5 h-5" />;
      case 'cyclone': return <Wind className="w-5 h-5" />;
      case 'high_waves': return <Activity className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  return (
    <div className={`${getSeverityColors(displayWarning.severity)} border-l-4 p-4 shadow-lg animate-pulse`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon(displayWarning.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm tracking-wide">
                INCOIS {displayWarning.severity.toUpperCase()}
              </span>
              <span className="text-xs opacity-90">
                • {displayWarning.source}
              </span>
            </div>
            <span className="text-xs opacity-90">
              {new Date(displayWarning.issuedAt).toLocaleTimeString()}
            </span>
          </div>
          <h3 className="font-semibold text-lg mt-1 mb-1">
            {displayWarning.title}
          </h3>
          <p className="text-sm opacity-95 line-clamp-2 mb-2">
            {displayWarning.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>{displayWarning.affectedRegions.join(', ')}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Valid until {new Date(displayWarning.validUntil).toLocaleString()}</span>
              </span>
            </div>
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(displayWarning)}
                className="text-xs px-3 py-1 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
              >
                View Details
              </button>
            )}
          </div>
        </div>
      </div>
      
      {criticalWarnings.length > 1 && (
        <div className="mt-3 text-xs opacity-90">
          <span>+ {criticalWarnings.length - 1} more active alerts</span>
        </div>
      )}
    </div>
  );
};

interface MarineConditionsCardProps {
  conditions: MarineConditions;
  showDetailedView?: boolean;
}

/**
 * Marine Conditions Display Card
 */
export const MarineConditionsCard: React.FC<MarineConditionsCardProps> = ({ 
  conditions, 
  showDetailedView = false 
}) => {
  const { theme } = useTheme();

  const getSeaStateColor = (condition: string) => {
    switch (condition) {
      case 'calm': return 'text-green-600 bg-green-50';
      case 'slight': return 'text-green-500 bg-green-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'rough': return 'text-orange-600 bg-orange-50';
      case 'very_rough': return 'text-red-600 bg-red-50';
      case 'high': return 'text-red-700 bg-red-100';
      case 'very_high': return 'text-red-800 bg-red-200';
      case 'phenomenal': return 'text-red-900 bg-red-300';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getHazardLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-700 bg-green-100';
      case 'moderate': return 'text-yellow-700 bg-yellow-100';
      case 'high': return 'text-orange-700 bg-orange-100';
      case 'extreme': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-4 shadow-sm`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Waves className="w-5 h-5 text-blue-500" />
          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Marine Conditions
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHazardLevelColor(conditions.hazardLevel)}`}>
            {conditions.hazardLevel.toUpperCase()} HAZARD
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeaStateColor(conditions.seaState.condition)}`}>
            {conditions.seaState.condition.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {conditions.seaState.waveHeight.significant}m
          </div>
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Wave Height
          </div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {conditions.weather.windSpeed} {conditions.weather.windUnit}
          </div>
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Wind Speed
          </div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {conditions.tides.currentLevel}m
          </div>
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} flex items-center justify-center space-x-1`}>
            {conditions.tides.trend === 'rising' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>Tide Level</span>
          </div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {conditions.waterQuality.temperature}°C
          </div>
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Water Temp
          </div>
        </div>
      </div>

      {/* Detailed View */}
      {showDetailedView && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tides */}
            <div className={`${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-3`}>
              <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Tidal Information
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Next High:</span>
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {new Date(conditions.tides.nextHighTide).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Next Low:</span>
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {new Date(conditions.tides.nextLowTide).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Range:</span>
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {conditions.tides.tidalRange}m
                  </span>
                </div>
              </div>
            </div>

            {/* Weather */}
            <div className={`${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-3`}>
              <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Weather Conditions
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Visibility:</span>
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {conditions.weather.visibility} {conditions.weather.visibilityUnit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Wind Dir:</span>
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {conditions.weather.windDirection}°
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Current:</span>
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {conditions.currents.speed} {conditions.currents.unit}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advisories */}
      {conditions.advisories.length > 0 && (
        <div className="mt-4">
          <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-sm`}>
            Current Advisories:
          </h4>
          <ul className="space-y-1">
            {conditions.advisories.map((advisory, index) => (
              <li key={index} className={`text-sm flex items-start space-x-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className="text-yellow-500 mt-0.5">•</span>
                <span>{advisory}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500 text-right">
        Updated: {new Date(conditions.timestamp).toLocaleString()}
      </div>
    </div>
  );
};

interface SensorStatusCardProps {
  sensorStatus: SensorNetworkStatus;
  showSensors?: boolean;
}

/**
 * Sensor Network Status Display
 */
export const SensorStatusCard: React.FC<SensorStatusCardProps> = ({ 
  sensorStatus, 
  showSensors = false 
}) => {
  const { theme } = useTheme();

  const getSensorStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'offline': return 'text-red-600 bg-red-100';
      case 'error': return 'text-red-800 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'wave_height': return <Waves className="w-4 h-4" />;
      case 'tide_gauge': return <Gauge className="w-4 h-4" />;
      case 'current_meter': return <Activity className="w-4 h-4" />;
      case 'weather_buoy': return <Wind className="w-4 h-4" />;
      case 'tsunami_buoy': return <AlertOctagon className="w-4 h-4" />;
      default: return <Radio className="w-4 h-4" />;
    }
  };

  const networkHealth = (sensorStatus.activeSensors / sensorStatus.totalSensors) * 100;

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-4 shadow-sm`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Radio className="w-5 h-5 text-blue-500" />
          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Sensor Network
          </h3>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          networkHealth >= 90 ? 'text-green-700 bg-green-100' :
          networkHealth >= 70 ? 'text-yellow-700 bg-yellow-100' :
          'text-red-700 bg-red-100'
        }`}>
          {Math.round(networkHealth)}% ONLINE
        </div>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="text-center">
          <div className={`text-lg font-bold text-green-600`}>
            {sensorStatus.activeSensors}
          </div>
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Active
          </div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold text-yellow-600`}>
            {sensorStatus.maintenanceSensors}
          </div>
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Maintenance
          </div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold text-red-600`}>
            {sensorStatus.offlineSensors}
          </div>
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Offline
          </div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {sensorStatus.totalSensors}
          </div>
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Total
          </div>
        </div>
      </div>

      {/* Individual Sensors */}
      {showSensors && sensorStatus.sensors.length > 0 && (
        <div className="space-y-2">
          <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Nearby Sensors
          </h4>
          {sensorStatus.sensors.slice(0, 3).map((sensor) => (
            <div key={sensor.id} className={`flex items-center justify-between p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center space-x-3">
                <div className={getSensorStatusColor(sensor.status) + ' p-1.5 rounded-full'}>
                  {getSensorIcon(sensor.type)}
                </div>
                <div>
                  <div className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {sensor.name}
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {sensor.type.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xs font-medium ${getSensorStatusColor(sensor.status).split(' ')[0]}`}>
                  {sensor.status.toUpperCase()}
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  {new Date(sensor.lastUpdate).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {sensorStatus.sensors.length > 3 && (
            <div className={`text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              + {sensorStatus.sensors.length - 3} more sensors
            </div>
          )}
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500 text-right">
        Last updated: {new Date(sensorStatus.lastNetworkUpdate).toLocaleString()}
      </div>
    </div>
  );
};

interface OfficialAlertsListProps {
  alerts: OfficialAlert[];
  maxDisplay?: number;
  onViewAlert?: (alert: OfficialAlert) => void;
}

/**
 * Official Alerts List Component
 */
export const OfficialAlertsList: React.FC<OfficialAlertsListProps> = ({ 
  alerts, 
  maxDisplay = 3,
  onViewAlert 
}) => {
  const { theme } = useTheme();

  if (!alerts.length) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6 text-center shadow-sm`}>
        <CheckCircle className={`w-12 h-12 mx-auto mb-3 text-green-500`} />
        <h3 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          No Active Alerts
        </h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          All clear - no official alerts in your area
        </p>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <AlertOctagon className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'advisory': return <Activity className="w-4 h-4" />;
      case 'bulletin': return <Radio className="w-4 h-4" />;
      default: return <Radio className="w-4 h-4" />;
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-4 shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-blue-500" />
          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Official Alerts
          </h3>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
          {alerts.length} Active
        </span>
      </div>

      <div className="space-y-3">
        {alerts.slice(0, maxDisplay).map((alert) => (
          <div 
            key={alert.id}
            className={`border rounded-lg p-3 transition-colors ${
              theme === 'dark' 
                ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            } ${onViewAlert ? 'cursor-pointer' : ''}`}
            onClick={() => onViewAlert?.(alert)}
          >
            <div className="flex items-start space-x-3">
              <div className={`${getPriorityColor(alert.priority)} p-1.5 rounded-full flex-shrink-0`}>
                {getAlertTypeIcon(alert.alertType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'} truncate`}>
                    {alert.title}
                  </h4>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} flex-shrink-0 ml-2`}>
                    {new Date(alert.issuedAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} line-clamp-2 mb-2`}>
                  {alert.message}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {alert.issuedBy}
                  </span>
                  <span className={`px-1.5 py-0.5 text-xs rounded ${getPriorityColor(alert.priority)}`}>
                    {alert.priority.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {alerts.length > maxDisplay && (
        <div className={`mt-3 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          + {alerts.length - maxDisplay} more alerts
        </div>
      )}
    </div>
  );
};