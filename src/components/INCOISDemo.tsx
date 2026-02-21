/**
 * INCOIS Integration Demo
 * Demonstration page showing INCOIS service integration with JalBandhu
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Waves, Activity, Radio, AlertTriangle, RefreshCw } from 'lucide-react';
import { INCOISBanner, MarineConditionsCard, SensorStatusCard, OfficialAlertsList } from './INCOISComponents';
import { INCOISService } from '../services/INCOISService';
import type { EarlyWarning, MarineConditions, OfficialAlert, SensorNetworkStatus } from '../services/INCOISService';

const INCOISDemo: React.FC = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    warnings: EarlyWarning[];
    marineConditions: MarineConditions | null;
    officialAlerts: OfficialAlert[];
    sensorStatus: SensorNetworkStatus | null;
  }>({
    warnings: [],
    marineConditions: null,
    officialAlerts: [],
    sensorStatus: null,
  });

  const incoisService = new INCOISService();

  // Load demo data
  const loadDemoData = async () => {
    setLoading(true);
    try {
      // Use Mumbai coordinates for demo
      const mumbaiCoords = { lat: 19.0760, lng: 72.8777 };
      const mumbaiBounds = {
        north: 19.5760,
        south: 18.5760,
        east: 73.3777,
        west: 72.3777
      };

      const [warnings, conditions, alerts, sensors] = await Promise.all([
        incoisService.getEarlyWarnings(mumbaiCoords),
        incoisService.getMarineConditions(mumbaiCoords),
        incoisService.getOfficialAlerts('Mumbai'),
        incoisService.getSensorData(mumbaiBounds),
      ]);

      setData({
        warnings: warnings.data || [],
        marineConditions: conditions.data || null,
        officialAlerts: alerts.data || [],
        sensorStatus: sensors.data || null,
      });
    } catch (error) {
      console.error('Failed to load INCOIS demo data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDemoData();
  }, []);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} p-4`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Waves className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  INCOIS Integration Demo
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Demonstrating Indian National Centre for Ocean Information Services data integration
                </p>
              </div>
            </div>
            <button
              onClick={loadDemoData}
              disabled={loading}
              className={`px-4 py-2 rounded-lg transition-colors ${
                loading 
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Loading...' : 'Refresh Data'}</span>
              </div>
            </button>
          </div>
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 text-center`}>
            <div>
              <div className={`text-2xl font-bold ${data.warnings.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {data.warnings.length}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Warnings
              </div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${data.officialAlerts.length > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                {data.officialAlerts.length}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Official Alerts
              </div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${data.marineConditions ? 'text-blue-500' : 'text-gray-500'}`}>
                {data.marineConditions ? 'LIVE' : 'N/A'}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Marine Data
              </div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${data.sensorStatus ? 'text-green-500' : 'text-gray-500'}`}>
                {data.sensorStatus?.activeSensors || 0}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Sensors
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                Loading INCOIS data...
              </span>
            </div>
          </div>
        )}

        {!loading && (
          <div className="space-y-6">
            {/* INCOIS Warnings Banner */}
            {data.warnings.length > 0 && (
              <div>
                <h2 className={`text-xl font-semibold mb-4 flex items-center space-x-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span>Critical Warnings</span>
                </h2>
                <INCOISBanner 
                  warnings={data.warnings}
                  onViewDetails={(warning) => {
                    alert(`Warning Details:\n\nType: ${warning.type}\nSeverity: ${warning.severity}\nRegions: ${warning.affectedRegions.join(', ')}\n\n${warning.description}`);
                  }}
                />
              </div>
            )}

            {/* Marine Conditions and Sensor Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {data.marineConditions && (
                <div>
                  <h2 className={`text-xl font-semibold mb-4 flex items-center space-x-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Activity className="w-5 h-5 text-blue-500" />
                    <span>Real-time Marine Conditions</span>
                  </h2>
                  <MarineConditionsCard 
                    conditions={data.marineConditions}
                    showDetailedView={true}
                  />
                </div>
              )}

              {data.sensorStatus && (
                <div>
                  <h2 className={`text-xl font-semibold mb-4 flex items-center space-x-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Radio className="w-5 h-5 text-green-500" />
                    <span>Sensor Network Status</span>
                  </h2>
                  <SensorStatusCard 
                    sensorStatus={data.sensorStatus}
                    showSensors={true}
                  />
                </div>
              )}
            </div>

            {/* Official Alerts */}
            {data.officialAlerts.length > 0 && (
              <div>
                <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Official Marine Alerts
                </h2>
                <OfficialAlertsList 
                  alerts={data.officialAlerts}
                  maxDisplay={5}
                  onViewAlert={(alertDetails) => {
                    alert(`Alert Details:\n\nType: ${alertDetails.alertType}\nPriority: ${alertDetails.priority}\nIssued by: ${alertDetails.issuedBy}\n\n${alertDetails.message}`);
                  }}
                />
              </div>
            )}

            {/* No Data State */}
            {!data.warnings.length && !data.marineConditions && !data.officialAlerts.length && !data.sensorStatus && (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-8 text-center shadow-lg`}>
                <Waves className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  No INCOIS Data Available
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  INCOIS service is currently using offline demo data. Try refreshing or check your connection.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 mt-6 shadow-lg`}>
          <div className="flex items-center justify-between text-sm">
            <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">INCOIS Integration Status:</span> {' '}
              <span className="text-green-500">Active</span> • {' '}
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              theme === 'dark' ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
            }`}>
              JalBandhu × INCOIS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default INCOISDemo;