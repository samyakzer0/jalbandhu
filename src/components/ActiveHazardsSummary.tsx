import { TrendingUp, AlertTriangle, MessageCircle, Activity, MapPin } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface HazardStat {
  hazard_type_id: number;
  total_comments: number;
  active_reports: number;
  urgency_distribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  states: string[];
}

interface ActiveHazardsSummaryProps {
  data: HazardStat[] | null;
}

const ActiveHazardsSummary = ({ data }: ActiveHazardsSummaryProps) => {
  const { theme } = useTheme();

  const hazardTypeConfig: Record<number, { name: string; icon: string; color: string }> = {
    1: { name: 'Tsunami Events', icon: '🌊', color: '#dc2626' },
    2: { name: 'Storm Surge', icon: '⛈️', color: '#ea580c' },
    3: { name: 'High Waves', icon: '🌊', color: '#2563eb' },
    4: { name: 'Coastal Erosion', icon: '🏖️', color: '#ca8a04' },
    5: { name: 'Marine Debris', icon: '🗑️', color: '#16a34a' },
    6: { name: 'Oil Spills', icon: '🛢️', color: '#7c2d12' },
    7: { name: 'Algal Blooms', icon: '🦠', color: '#9333ea' },
    8: { name: 'Water Quality', icon: '💧', color: '#0891b2' }
  };

  if (!data || data.length === 0) {
    return (
      <div className={`p-6 rounded-xl border ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="text-center">
          <Activity size={48} className={`mx-auto mb-4 ${
            theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h3 className={`text-lg font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            No Active Hazards
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            All clear! No ocean hazards with active commentary at the moment.
          </p>
        </div>
      </div>
    );
  }

  const UrgencyMeter = ({ urgencyData }: { urgencyData: HazardStat['urgency_distribution'] }) => {
    const total = urgencyData.critical + urgencyData.high + urgencyData.medium + urgencyData.low;
    if (total === 0) return null;

    const criticalPercent = (urgencyData.critical / total) * 100;
    const highPercent = (urgencyData.high / total) * 100;
    const mediumPercent = (urgencyData.medium / total) * 100;
    const lowPercent = (urgencyData.low / total) * 100;

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Urgency Levels</span>
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{total} total</span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div className="h-full flex">
            {criticalPercent > 0 && (
              <div 
                className="bg-red-500" 
                style={{ width: `${criticalPercent}%` }}
                title={`Critical: ${urgencyData.critical}`}
              />
            )}
            {highPercent > 0 && (
              <div 
                className="bg-orange-500" 
                style={{ width: `${highPercent}%` }}
                title={`High: ${urgencyData.high}`}
              />
            )}
            {mediumPercent > 0 && (
              <div 
                className="bg-yellow-500" 
                style={{ width: `${mediumPercent}%` }}
                title={`Medium: ${urgencyData.medium}`}
              />
            )}
            {lowPercent > 0 && (
              <div 
                className="bg-green-500" 
                style={{ width: `${lowPercent}%` }}
                title={`Low: ${urgencyData.low}`}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              {urgencyData.critical}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              {urgencyData.high}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              {urgencyData.medium}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              {urgencyData.low}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Calculate totals across all hazard types
  const totalActiveReports = data.reduce((sum, stat) => sum + stat.active_reports, 0);
  const totalComments = data.reduce((sum, stat) => sum + stat.total_comments, 0);
  const totalCritical = data.reduce((sum, stat) => sum + stat.urgency_distribution.critical, 0);
  const totalHigh = data.reduce((sum, stat) => sum + stat.urgency_distribution.high, 0);

  // Get unique states
  const allStates = [...new Set(data.flatMap(stat => stat.states))];

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      <div className={`p-4 rounded-xl border ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <Activity size={24} className="text-blue-500" />
          <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Active Ocean Hazards Overview
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-3 rounded-lg text-center ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp size={16} className="text-blue-500" />
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Active Reports
              </span>
            </div>
            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              {totalActiveReports}
            </div>
          </div>

          <div className={`p-3 rounded-lg text-center ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <MessageCircle size={16} className="text-green-500" />
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Total Comments
              </span>
            </div>
            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              {totalComments}
            </div>
          </div>

          <div className={`p-3 rounded-lg text-center ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <AlertTriangle size={16} className="text-red-500" />
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Critical/High
              </span>
            </div>
            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              {totalCritical + totalHigh}
            </div>
          </div>

          <div className={`p-3 rounded-lg text-center ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <MapPin size={16} className="text-purple-500" />
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                States Affected
              </span>
            </div>
            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              {allStates.length}
            </div>
          </div>
        </div>

        {allStates.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={16} className="text-purple-500" />
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Affected Coastal States:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allStates.map(state => (
                <span key={state} className={`px-2 py-1 text-xs rounded-full ${
                  theme === 'dark' 
                    ? 'bg-purple-900/30 text-purple-400' 
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {state}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Individual Hazard Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((stat) => {
          const config = hazardTypeConfig[stat.hazard_type_id] || {
            name: 'Unknown Hazard',
            icon: '❓',
            color: '#6b7280'
          };

          return (
            <div
              key={stat.hazard_type_id}
              className={`p-4 rounded-xl border transition-all hover:shadow-lg ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: `${config.color}20`, color: config.color }}
                  >
                    {config.icon}
                  </div>
                  <div>
                    <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      {config.name}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Active Reports
                  </div>
                  <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {stat.active_reports}
                  </div>
                </div>
                <div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Comments
                  </div>
                  <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {stat.total_comments}
                  </div>
                </div>
              </div>

              {/* Urgency Distribution */}
              <UrgencyMeter urgencyData={stat.urgency_distribution} />

              {/* Affected States */}
              {stat.states.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-1">
                    {stat.states.slice(0, 3).map(state => (
                      <span key={state} className={`px-2 py-1 text-xs rounded-full ${
                        theme === 'dark' 
                          ? 'bg-gray-700 text-gray-300' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {state}
                      </span>
                    ))}
                    {stat.states.length > 3 && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        theme === 'dark' 
                          ? 'bg-gray-700 text-gray-400' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        +{stat.states.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActiveHazardsSummary;