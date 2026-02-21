import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getLocationStats, LocationStats } from '../services/AnalyticsService';
import { Loader2, MapPin, TrendingUp, BarChart3, Activity, AlertTriangle } from 'lucide-react';

interface IssueHeatMapProps {
  height?: string;
  className?: string;
}

function IssueHeatMap({ height = 'h-96', className = '' }: IssueHeatMapProps) {
  const { theme } = useTheme();
  const [locationData, setLocationData] = useState<LocationStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLocationData();
  }, []);

  const fetchLocationData = async () => {
    try {
      setIsLoading(true);
      const stats = await getLocationStats();
      setLocationData(stats.slice(0, 6)); // Show top 6 cities for better layout
    } catch (error) {
      console.error('Error fetching location data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced intensity calculation with more granular levels
  const getIntensityData = (count: number, maxCount: number) => {
    const intensity = count / maxCount;
    if (intensity >= 0.8) return { 
      level: 'critical', 
      color: 'red', 
      bgGradient: 'from-red-500/20 to-pink-500/20',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-400',
      label: 'Critical',
      icon: AlertTriangle,
      pulse: true
    };
    if (intensity >= 0.6) return { 
      level: 'high', 
      color: 'orange', 
      bgGradient: 'from-orange-500/20 to-red-500/20',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-400',
      label: 'High',
      icon: TrendingUp,
      pulse: false
    };
    if (intensity >= 0.4) return { 
      level: 'medium', 
      color: 'yellow', 
      bgGradient: 'from-yellow-500/20 to-orange-500/20',
      borderColor: 'border-yellow-500/30',
      textColor: 'text-yellow-400',
      label: 'Medium',
      icon: BarChart3,
      pulse: false
    };
    if (intensity >= 0.2) return { 
      level: 'low', 
      color: 'blue', 
      bgGradient: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
      label: 'Low',
      icon: Activity,
      pulse: false
    };
    return { 
      level: 'minimal', 
      color: 'green', 
      bgGradient: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-500/30',
      textColor: 'text-green-400',
      label: 'Minimal',
      icon: Activity,
      pulse: false
    };
  };

  const maxCount = Math.max(...locationData.map(item => item.count), 1);

  if (isLoading) {
    return (
      <div className={`${
        theme === 'dark' 
          ? 'bg-gray-800/60 backdrop-blur-xl border-gray-700/50' 
          : 'bg-white/60 backdrop-blur-xl border-gray-100/50'
      } ${height} rounded-2xl shadow-xl border relative overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Loader2 className={`animate-spin h-10 w-10 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} mb-4`} />
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
            Loading hotspot data...
          </p>
        </div>
      </div>
    );
  }

  if (locationData.length === 0) {
    return (
      <div className={`${
        theme === 'dark' 
          ? 'bg-gray-800/60 backdrop-blur-xl border-gray-700/50' 
          : 'bg-white/60 backdrop-blur-xl border-gray-100/50'
      } ${height} rounded-2xl shadow-xl border relative overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
          <div className={`w-20 h-20 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center mb-6`}>
            <MapPin className={`h-10 w-10 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
          <h3 className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-xl font-semibold mb-2`}>
            No Data Available
          </h3>
          <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} text-sm max-w-sm`}>
            Submit reports to see geographic hotspot analysis and trends in your area
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${
      theme === 'dark' 
        ? 'bg-gray-800/60 backdrop-blur-xl border-gray-700/50' 
        : 'bg-white/60 backdrop-blur-xl border-gray-100/50'
    } ${height} rounded-2xl shadow-xl border relative overflow-hidden ${className}`}>
      {/* Enhanced glass effect background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-green-500/5"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
      
      <div className="relative h-full flex flex-col">
        {/* Professional Header */}
        <div className="px-6 py-5 border-b border-gray-300/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 ${
                theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-500/20'
              } rounded-xl flex items-center justify-center backdrop-blur-sm`}>
                <TrendingUp className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  Geographic Hotspots
                </h3>
              </div>
            </div>
            
            {/* Live indicator */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Live
                </span>
              </div>
            </div>
          </div>
          
          {/* Summary Stats Bar */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Low</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Medium</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>High</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Critical</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Hotspot Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {locationData.map((location, index) => {
              const intensity = getIntensityData(location.count, maxCount);
              const percentage = (location.count / maxCount) * 100;
              const IconComponent = intensity.icon;
              
              return (
                <div
                  key={index}
                  className={`${
                    theme === 'dark' 
                      ? 'bg-gray-700/40 hover:bg-gray-700/60 border-gray-600/50' 
                      : 'bg-white/40 hover:bg-white/70 border-gray-200/50'
                  } backdrop-blur-sm rounded-xl p-5 border ${intensity.borderColor} transition-all duration-300 hover:scale-105 cursor-pointer group relative overflow-hidden shadow-lg hover:shadow-xl`}
                >
                  {/* Enhanced background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${intensity.bgGradient} opacity-60 group-hover:opacity-80 transition-opacity`}></div>
                  
                  {/* Pulse effect for critical items */}
                  {intensity.pulse && (
                    <div className="absolute inset-0 bg-red-500/10 rounded-xl animate-pulse"></div>
                  )}
                  
                  <div className="relative z-10">
                    {/* Header with icon and status */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 ${intensity.color === 'red' ? 'bg-red-500/20' :
                          intensity.color === 'orange' ? 'bg-orange-500/20' :
                          intensity.color === 'yellow' ? 'bg-yellow-500/20' :
                          intensity.color === 'blue' ? 'bg-blue-500/20' : 'bg-green-500/20'
                        } rounded-lg flex items-center justify-center`}>
                          <IconComponent className={`h-4 w-4 ${intensity.textColor}`} />
                        </div>
                        <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} truncate text-sm`}>
                          {location.city}
                        </h4>
                      </div>
                      
                      <div className={`w-3 h-3 rounded-full ${
                        intensity.color === 'red' ? 'bg-red-500' :
                        intensity.color === 'orange' ? 'bg-orange-500' :
                        intensity.color === 'yellow' ? 'bg-yellow-500' :
                        intensity.color === 'blue' ? 'bg-blue-500' : 'bg-green-500'
                      } shadow-lg ${intensity.pulse ? 'animate-pulse' : ''}`}></div>
                    </div>
                    
                    {/* Main metric */}
                    <div className="mb-4">
                      <div className={`text-2xl font-bold ${intensity.textColor} leading-none`}>
                        {location.count}
                      </div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                        {location.count === 1 ? 'report' : 'reports'}
                      </div>
                    </div>
                    
                    {/* Enhanced progress bar */}
                    <div className="mb-3">
                      <div className={`w-full h-2 ${
                        theme === 'dark' ? 'bg-gray-600/50' : 'bg-gray-200/70'
                      } rounded-full overflow-hidden backdrop-blur-sm`}>
                        <div 
                          className={`h-full ${
                            intensity.color === 'red' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                            intensity.color === 'orange' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                            intensity.color === 'yellow' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                            intensity.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'
                          } transition-all duration-1000 ease-out shadow-lg`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Status badge and location icon */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium backdrop-blur-sm ${
                        intensity.color === 'red' 
                          ? theme === 'dark' ? 'bg-red-900/50 text-red-300 border border-red-500/30' : 'bg-red-100/80 text-red-800 border border-red-200'
                          : intensity.color === 'orange'
                          ? theme === 'dark' ? 'bg-orange-900/50 text-orange-300 border border-orange-500/30' : 'bg-orange-100/80 text-orange-800 border border-orange-200'
                          : intensity.color === 'yellow'
                          ? theme === 'dark' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-500/30' : 'bg-yellow-100/80 text-yellow-800 border border-yellow-200'
                          : intensity.color === 'blue'
                          ? theme === 'dark' ? 'bg-blue-900/50 text-blue-300 border border-blue-500/30' : 'bg-blue-100/80 text-blue-800 border border-blue-200'
                          : theme === 'dark' ? 'bg-green-900/50 text-green-300 border border-green-500/30' : 'bg-green-100/80 text-green-800 border border-green-200'
                      }`}>
                        {intensity.label}
                      </span>
                      <MapPin className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Professional Footer */}
        <div className="px-6 py-4 border-t border-gray-300/10">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Activity className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Showing top {locationData.length} locations
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-xs`}>
                Updated now
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IssueHeatMap;
