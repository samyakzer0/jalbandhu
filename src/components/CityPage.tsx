import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { MapPin, AlertTriangle, Waves, TrendingUp } from 'lucide-react';
import useLocation from '../hooks/useLocation';
import useNearbyReports from '../hooks/useNearbyReports';
import useCityNews from '../hooks/useCityNews';
import useINCOIS from '../hooks/useINCOIS';
import { INCOISBanner, MarineConditionsCard, SensorStatusCard, OfficialAlertsList } from './INCOISComponents';
import INCOISStatus from './INCOISStatus';
import Loader from './Loader';

interface CityPageProps {
  onNavigate: (page: string) => void;
  userId?: string;
}

type CityTab = 'reports' | 'leaderboard' | 'news';

const CityPage: React.FC<CityPageProps> = ({ onNavigate }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<CityTab>('reports');

  // Location and data hooks
  const { location, loading: locationLoading, error: locationError, getCurrentLocation } = useLocation();
  const { reports, loading: reportsLoading, getStats } = useNearbyReports(location, 15);
  const { news, loading: newsLoading, getBreakingNews } = useCityNews(location);
  
  // INCOIS data integration
  const { data: incoisData, loading: incoisLoading, error: incoisError } = useINCOIS(location);
  
  // Check if we have any INCOIS data
  const hasINCOISData = incoisData.warnings.length > 0 || 
                        incoisData.marineConditions !== null || 
                        incoisData.officialAlerts.length > 0 || 
                        incoisData.sensorStatus !== null;

  // Auto-get location on mount
  useEffect(() => {
    if (!location && !locationLoading) {
      getCurrentLocation();
    }
  }, [location, locationLoading, getCurrentLocation]);

  const reportStats = getStats();
  const breakingNews = getBreakingNews();

  if (locationError) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} px-4 py-8`}>
        <div className={`max-w-md mx-auto text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 shadow-lg`}>
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Location Access Required
          </h2>
          <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Please enable location access to view nearby ocean hazards and city information.
          </p>
          <button
            onClick={getCurrentLocation}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
          >
            Enable Location
          </button>
        </div>
      </div>
    );
  }

  if (locationLoading || (!location && !locationError)) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <Loader size="large" message="Getting your location..." />
      </div>
    );
  }

  const tabs = [
    { id: 'reports' as CityTab, label: 'Reports', icon: MapPin, count: reportStats.total },
    { id: 'leaderboard' as CityTab, label: 'Ranking', icon: TrendingUp },
    { id: 'news' as CityTab, label: 'News', icon: Waves, count: news.length }
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} px-4 py-6 shadow-sm`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <MapPin className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {location?.city}
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {location?.state} • {location?.coastalZone?.split('-').join(' ')} Coast
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            location?.riskLevel === 'critical' ? 'bg-red-100 text-red-800' :
            location?.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
            location?.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-green-100 text-green-800'
          }`}>
            {location?.riskLevel?.toUpperCase()} RISK
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {reportStats.total}
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Reports
            </p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${reportStats.urgent > 0 ? 'text-red-500' : (theme === 'dark' ? 'text-white' : 'text-gray-900')}`}>
              {reportStats.urgent}
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Urgent
            </p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {Math.round((reportStats.resolved / Math.max(reportStats.total, 1)) * 100)}%
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Resolved
            </p>
          </div>
        </div>
      </div>

      {/* INCOIS Status Indicator */}
      <div className="px-4 py-2">
        <INCOISStatus 
          isLoading={incoisLoading}
          hasData={hasINCOISData}
          error={incoisError}
          compact={true}
        />
      </div>

      {/* INCOIS Official Alerts Banner */}
      {incoisData.warnings.length > 0 && (
        <div className="px-4">
          <INCOISBanner 
            warnings={incoisData.warnings}
            onViewDetails={(warning) => {
              console.log('View warning details:', warning);
              // TODO: Navigate to warning details page
            }}
          />
        </div>
      )}

      {/* INCOIS Marine Conditions & Sensor Status */}
      {!incoisLoading && (incoisData.marineConditions || incoisData.sensorStatus) && (
        <div className="px-4 py-4">
          <div className="space-y-4">
            {incoisData.marineConditions && (
              <MarineConditionsCard 
                conditions={incoisData.marineConditions}
                showDetailedView={false}
              />
            )}
            {incoisData.sensorStatus && (
              <SensorStatusCard 
                sensorStatus={incoisData.sensorStatus}
                showSensors={false}
              />
            )}
          </div>
        </div>
      )}

      {/* Breaking News */}
      {breakingNews.length > 0 && (
        <div className={`${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'} border-y ${theme === 'dark' ? 'border-red-800' : 'border-red-200'} py-2 overflow-hidden`}>
          <div className="flex items-center">
            <div className={`${theme === 'dark' ? 'bg-red-800' : 'bg-red-600'} text-white px-4 py-1 text-sm font-bold flex items-center space-x-1`}>
              <AlertTriangle className="w-4 h-4" />
              <span>BREAKING</span>
            </div>
            <div className="flex-1 px-4">
              <p className={`${theme === 'dark' ? 'text-red-200' : 'text-red-800'} font-medium text-sm`}>
                {breakingNews[0]?.title}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="px-4 py-4">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-1 shadow-sm`}>
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-sm'
                      : theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive 
                        ? 'bg-white bg-opacity-20' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 pb-24">
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {/* Official INCOIS Alerts Section */}
            {incoisData.officialAlerts.length > 0 && (
              <div>
                <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Official Marine Alerts
                </h3>
                <OfficialAlertsList 
                  alerts={incoisData.officialAlerts}
                  maxDisplay={3}
                  onViewAlert={(alert) => {
                    console.log('View alert details:', alert);
                    // TODO: Navigate to alert details page
                  }}
                />
              </div>
            )}

            {/* Community Reports Section */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Community Reports
              </h3>
              <div className="space-y-3">
            {reportsLoading ? (
              <div className="flex justify-center py-8">
                <Loader message="Loading reports..." />
              </div>
            ) : reports.length === 0 ? (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-8 text-center shadow-sm`}>
                <MapPin className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  No nearby reports
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  No ocean hazard reports found in your area.
                </p>
              </div>
            ) : (
              reports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => onNavigate(`report-detail?reportId=${report.id}`)}
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        report.urgency === 'urgent' ? 'bg-red-100 text-red-700' :
                        report.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                        report.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {report.urgency.toUpperCase()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        report.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {report.status.split('-').join(' ').toUpperCase()}
                      </span>
                    </div>
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {report.distance}km away
                    </span>
                  </div>
                  <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {report.title}
                  </h3>
                  <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} line-clamp-2`}>
                    {report.description}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                      {report.location.address}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">↑{report.votes_up}</span>
                      <span className="text-red-600">↓{report.votes_down}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
            </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
            <div className="flex items-center space-x-3 mb-6">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                City Safety Rankings
              </h2>
            </div>
            <div className="space-y-4">
              {['Mumbai', 'Kochi', 'Chennai', 'Visakhapatnam', 'Mangalore'].map((city, index) => (
                <div
                  key={city}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    city === location?.city
                      ? theme === 'dark' ? 'bg-blue-900/50 border border-blue-500' : 'bg-blue-50 border border-blue-200'
                      : theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`text-lg font-bold ${
                      index === 0 ? 'text-yellow-500' :
                      index === 1 ? 'text-gray-400' :
                      index === 2 ? 'text-orange-600' : 
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      #{index + 1}
                    </span>
                    <div>
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {city}
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Safety Score: {95 - index * 3}/100
                      </p>
                    </div>
                  </div>
                  {city === location?.city && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      Your City
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'news' && (
          <div className="space-y-3">
            {newsLoading ? (
              <div className="flex justify-center py-8">
                <Loader message="Loading news..." />
              </div>
            ) : (
              news.slice(0, 10).map((item) => (
                <div
                  key={item.id}
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-sm`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2 flex-wrap">
                      {item.isBreaking && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          LIVE
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.urgency === 'urgent' ? 'bg-red-100 text-red-700' :
                        item.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                        item.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {item.urgency.toUpperCase()}
                      </span>
                    </div>
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(item.publishedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {item.title}
                  </h3>
                  <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {item.source}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700`}>
                      {item.category.split('-').join(' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CityPage;