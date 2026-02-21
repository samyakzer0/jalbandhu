import React, { useState, useEffect } from 'react';
import { Settings, Activity, Play, Pause, TrendingUp, AlertTriangle, CheckCircle, Clock, Zap, Eye, Trash2, FileText } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../utils/translations';
import smartCameraService, { SmartCameraConfig, SmartCameraCaptureData } from '../services/SmartCameraService';
import { submitReport } from '../services/ReportService';
import { PriorityBadge } from './ui/badge';

interface SmartCameraPanelProps {
  onClose?: () => void;
}

const SmartCameraPanel: React.FC<SmartCameraPanelProps> = ({ onClose }) => {
  const { theme, language } = useTheme();
  const t = translations[language];

  const [config, setConfig] = useState<SmartCameraConfig>(smartCameraService.getConfig());
  const [statistics, setStatistics] = useState(smartCameraService.getStatistics());
  const [recentCaptures, setRecentCaptures] = useState(smartCameraService.getRecentCaptures());
  const [isSupported, setIsSupported] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if Smart Camera is supported - use static method directly
    setIsSupported((smartCameraService.constructor as any).isSupported());

    // Update statistics every 30 seconds for testing
    const interval = setInterval(() => {
      setStatistics(smartCameraService.getStatistics());
      setRecentCaptures(smartCameraService.getRecentCaptures());
    }, 30000);

    // Listen for Smart Camera events
    const handleSmartCameraReport = (event: CustomEvent) => {
      console.log('Smart Camera report created:', event.detail);
      // Refresh statistics
      setStatistics(smartCameraService.getStatistics());
      setRecentCaptures(smartCameraService.getRecentCaptures());
    };

    window.addEventListener('smartCameraReportCreated', handleSmartCameraReport as EventListener);

    return () => {
      clearInterval(interval);
      window.removeEventListener('smartCameraReportCreated', handleSmartCameraReport as EventListener);
    };
  }, []);

  const handleConfigChange = (key: keyof SmartCameraConfig, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    smartCameraService.updateConfig(newConfig);
  };

  const handleToggleSmartCamera = async () => {
    if (!isSupported) {
      setErrorMessage('Smart Camera is not supported on this device. Camera access is required.');
      return;
    }

    setIsStarting(true);
    setErrorMessage(null);

    try {
      if (config.enabled) {
        // Stop Smart Camera
        smartCameraService.stopCapture();
        handleConfigChange('enabled', false);
      } else {
        // Enable Smart Camera first
        handleConfigChange('enabled', true);

        // Then try to start capture
        const success = await smartCameraService.startCapture();
        if (!success) {
          // If start failed, disable it back
          handleConfigChange('enabled', false);
          setErrorMessage('Failed to start Smart Camera. Please check camera permissions.');
        }
      }
    } catch (error) {
      console.error('Error toggling Smart Camera:', error);
      // If there was an error, make sure it's disabled
      handleConfigChange('enabled', false);
      const errorMsg = error instanceof Error ? error.message : 'Failed to toggle Smart Camera. Please try again.';
      setErrorMessage(errorMsg);
    } finally {
      setIsStarting(false);
      // Update statistics
      setStatistics(smartCameraService.getStatistics());
    }
  };

  const handleDeleteCapture = (captureId: string) => {
    if (window.confirm('Are you sure you want to delete this capture? This action cannot be undone.')) {
      const success = smartCameraService.deleteCapture(captureId);
      if (success) {
        // Refresh the captures list
        setRecentCaptures(smartCameraService.getRecentCaptures());
        setStatistics(smartCameraService.getStatistics());
      } else {
        alert('Failed to delete capture. Please try again.');
      }
    }
  };

  const handleCreateReport = async (capture: SmartCameraCaptureData) => {
    if (!capture.aiResult || !capture.location) {
      alert('Cannot create report: Missing AI analysis or location data');
      return;
    }

    try {
      console.log('Manually creating report for capture:', capture.id);

      const reportResponse = await submitReport(
        `[Smart Camera] ${capture.aiResult.title}`,
        `${capture.aiResult.description}\n\n--- \n📸 Auto-detected by Smart Camera\n🤖 AI Confidence: ${(capture.aiResult.confidence * 100).toFixed(1)}%\n📍 Location: ${capture.location.address}`,
        capture.aiResult.category,
        capture.location,
        capture.imageData,
        'smart_camera_system',
        capture.aiResult.priority,
        {
          isSmartCamera: true,
          aiConfidence: capture.aiResult.confidence,
          captureId: capture.id
        }
      );

      if (reportResponse.success) {
        console.log('✅ Manual report created successfully:', reportResponse.report_id);

        // Update the capture data
        const success = smartCameraService.deleteCapture(capture.id);
        if (success) {
          const updatedCapture = { ...capture, reportId: reportResponse.report_id, uploaded: true };
          const allCaptures = smartCameraService.getRecentCaptures();
          allCaptures.unshift(updatedCapture);
          localStorage.setItem('smart_camera_captures', JSON.stringify(allCaptures));
        }

        // Refresh UI
        setRecentCaptures(smartCameraService.getRecentCaptures());
        setStatistics(smartCameraService.getStatistics());

        alert(`Report created successfully! Report ID: ${reportResponse.report_id}`);
      } else {
        console.error('❌ Manual report creation failed:', reportResponse);
        alert(`Failed to create report: ${reportResponse.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Manual report creation error:', error);
      alert(`Error creating report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusIcon = (processed: boolean, hasReport: boolean) => {
    if (hasReport) return <CheckCircle className="w-5 h-5" />;
    if (processed) return <Activity className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  if (!isSupported) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} p-4`}>
        <div className={`max-w-2xl mx-auto p-8 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-xl`}>
          <div className="text-center">
            <div className={`w-20 h-20 mx-auto mb-6 ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'} rounded-2xl flex items-center justify-center`}>
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Ocean Smart Camera Not Supported
            </h2>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-6 leading-relaxed`}>
              Ocean Smart Camera requires camera access and is not supported on this device or browser.
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-8 leading-relaxed`}>
              Please use a modern browser with camera support to enable automated coastal monitoring features.
            </p>
            {onClose && (
              <button
                onClick={onClose}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white shadow-lg'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800 shadow-md'
                }`}
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} p-4 lg:p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className={`p-6 lg:p-8 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-xl`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 ${theme === 'dark' ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/20' : 'bg-gradient-to-br from-blue-50 to-blue-100'} rounded-2xl flex items-center justify-center shadow-lg`}>
                <Zap className="w-7 h-7 text-blue-500" />
              </div>
              <div>
                <h1 className={`text-2xl lg:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Ocean Smart Camera Integration
                </h1>
                <p className={`text-sm lg:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  AI-powered automated ocean hazard detection and coastal monitoring system
                </p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white shadow-lg'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800 shadow-md'
                }`}
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className={`p-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-xl transition-all duration-200 hover:shadow-2xl hover:scale-[1.02]`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm font-semibold uppercase tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Captures
                </p>
                <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {statistics.totalCaptures}
                </p>
              </div>
              <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/20' : 'bg-gradient-to-br from-blue-50 to-blue-100'} rounded-xl flex items-center justify-center shadow-lg`}>
                <Activity className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className={`p-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-xl transition-all duration-200 hover:shadow-2xl hover:scale-[1.02]`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm font-semibold uppercase tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Reports Created
                </p>
                <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {statistics.reportsCreated}
                </p>
              </div>
              <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-gradient-to-br from-green-900/30 to-green-800/20' : 'bg-gradient-to-br from-green-50 to-green-100'} rounded-xl flex items-center justify-center shadow-lg`}>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className={`p-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-xl transition-all duration-200 hover:shadow-2xl hover:scale-[1.02]`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm font-semibold uppercase tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Processing Queue
                </p>
                <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {statistics.queuedCaptures}
                </p>
              </div>
              <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-gradient-to-br from-yellow-900/30 to-yellow-800/20' : 'bg-gradient-to-br from-yellow-50 to-yellow-100'} rounded-xl flex items-center justify-center shadow-lg`}>
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </div>

          <div className={`p-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-xl transition-all duration-200 hover:shadow-2xl hover:scale-[1.02]`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm font-semibold uppercase tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  System Status
                </p>
                <p className={`text-2xl font-bold mt-2 ${statistics.isEnabled ? 'text-green-500' : 'text-red-500'}`}>
                  {statistics.isEnabled ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className={`w-12 h-12 ${statistics.isEnabled ? (theme === 'dark' ? 'bg-gradient-to-br from-green-900/30 to-green-800/20' : 'bg-gradient-to-br from-green-50 to-green-100') : (theme === 'dark' ? 'bg-gradient-to-br from-red-900/30 to-red-800/20' : 'bg-gradient-to-br from-red-50 to-red-100')} rounded-xl flex items-center justify-center shadow-lg`}>
                <TrendingUp className={`w-6 h-6 ${statistics.isEnabled ? 'text-green-500' : 'text-red-500'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Control Panel */}
        <div className={`p-6 lg:p-8 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-xl`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
            <div className="flex-1">
              <h3 className={`text-xl lg:text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Ocean Smart Camera Control
              </h3>
              <p className={`text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
                {config.enabled
                  ? `Active ocean monitoring - scanning for marine hazards every ${config.captureIntervalMinutes} minute${config.captureIntervalMinutes !== 1 ? 's' : ''}`
                  : 'Inactive - click to start automated coastal surveillance and tsunami detection'
                }
              </p>
              {statistics.lastCaptureTime && (
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                  Last capture: {formatTimestamp(statistics.lastCaptureTime)}
                </p>
              )}
            </div>
            <button
              onClick={handleToggleSmartCamera}
              disabled={isStarting}
              className={`flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                config.enabled
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25'
              }`}
            >
              {isStarting ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : config.enabled ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
              {isStarting ? 'Starting...' : config.enabled ? 'Stop Monitoring' : 'Start Monitoring'}
            </button>
          </div>

          {errorMessage && (
            <div className={`mt-6 p-4 lg:p-6 ${theme === 'dark' ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-700'} border rounded-xl`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Error</p>
                  <p className="text-sm leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Configuration Panel */}
        <div className={`p-6 lg:p-8 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-xl`}>
          <div className="flex items-center gap-4 mb-8">
            <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-700 to-gray-600' : 'bg-gradient-to-br from-gray-100 to-gray-200'} rounded-xl flex items-center justify-center shadow-lg`}>
              <Settings className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <h3 className={`text-xl lg:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Ocean Monitoring Configuration
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                Customize ocean hazard detection behavior and alert thresholds
              </p>
            </div>
          </div>

          {/* Auto Report Creation Criteria */}
          <div className={`mb-8 p-4 lg:p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'} border`}>
            <h4 className={`text-base font-semibold mb-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
              Auto Ocean Hazard Alert Creation Criteria
            </h4>
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>AI Confidence ≥ {(config.confidenceThreshold * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Priority: {config.priorityFilter.join(', ')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${config.locationTracking ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Location tracking: {config.locationTracking ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${config.aiEventDetection ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>AI detection: {config.aiEventDetection ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Ocean Scan Interval (minutes)
                </label>
                <input
                  type="number"
                  min="0.1"
                  max="60"
                  step="0.1"
                  value={config.captureIntervalMinutes}
                  onChange={(e) => handleConfigChange('captureIntervalMinutes', parseFloat(e.target.value))}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      : 'bg-white border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  } focus:outline-none`}
                />
                <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  How often to scan ocean conditions (0.1 - 60 minutes)
                </p>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Marine Hazard Detection Confidence Threshold
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={config.confidenceThreshold}
                  onChange={(e) => handleConfigChange('confidenceThreshold', parseFloat(e.target.value))}
                  className="w-full accent-blue-500 h-2 rounded-lg"
                />
                <div className="flex justify-between items-center mt-3">
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {(config.confidenceThreshold * 100).toFixed(0)}% minimum confidence
                  </span>
                  <div className="flex gap-1">
                    {[0.3, 0.5, 0.7, 0.9].map(level => (
                      <button
                        key={level}
                        onClick={() => handleConfigChange('confidenceThreshold', level)}
                        className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                          Math.abs(config.confidenceThreshold - level) < 0.01
                            ? 'bg-blue-500 text-white'
                            : theme === 'dark'
                              ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {(level * 100).toFixed(0)}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md">
                  <div>
                    <label htmlFor="autoUpload" className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                      Auto-upload hazard alerts when online
                    </label>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Automatically upload ocean hazard detections when internet is available
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="autoUpload"
                    checked={config.autoUpload}
                    onChange={(e) => handleConfigChange('autoUpload', e.target.checked)}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md">
                  <div>
                    <label htmlFor="locationTracking" className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                      Enable coastal position tracking
                    </label>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Include GPS coordinates with each ocean hazard detection
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="locationTracking"
                    checked={config.locationTracking}
                    onChange={(e) => handleConfigChange('locationTracking', e.target.checked)}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Captures Panel */}
        <div className={`p-6 lg:p-8 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-xl`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-700 to-gray-600' : 'bg-gradient-to-br from-gray-100 to-gray-200'} rounded-xl flex items-center justify-center shadow-lg`}>
                <Activity className="w-6 h-6 text-gray-500" />
              </div>
              <div>
                <h3 className={`text-xl lg:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Recent Ocean Hazard Detections
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  Latest automated coastal monitoring activity and hazard analysis results
                </p>
              </div>
            </div>
            {recentCaptures.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete all captures? This action cannot be undone.')) {
                    smartCameraService.clearCaptureData();
                    setRecentCaptures([]);
                    setStatistics(smartCameraService.getStatistics());
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                  theme === 'dark'
                    ? 'bg-red-900/20 hover:bg-red-900/30 text-red-400 hover:text-red-300 border border-red-800'
                    : 'bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200'
                }`}
                title="Clear all captures"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>

          {recentCaptures.length === 0 ? (
            <div className={`text-center py-16 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className={`w-20 h-20 mx-auto mb-6 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'} rounded-2xl flex items-center justify-center`}>
                <Eye className="w-10 h-10 opacity-50" />
              </div>
              <h4 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                No ocean hazard detections yet
              </h4>
              <p className="text-sm leading-relaxed">
                Start coastal monitoring to begin automated ocean hazard scanning
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentCaptures.map((capture) => (
                <div
                  key={capture.id}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.01] ${
                    theme === 'dark'
                      ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700/70 hover:border-gray-500'
                      : 'bg-gray-50 border-gray-200 hover:bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        capture.reportId
                          ? 'bg-green-100 text-green-600'
                          : capture.processed
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {getStatusIcon(capture.processed, !!capture.reportId)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold text-lg mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} truncate`}>
                          {capture.aiResult?.title || 'Processing...'}
                        </h4>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                          {formatTimestamp(capture.timestamp)}
                        </p>
                        {capture.aiResult && (
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <PriorityBadge
                              priority={capture.aiResult.priority}
                              size="sm"
                              theme={theme}
                            />
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getConfidenceColor(capture.aiResult.confidence)}`}>
                              {(capture.aiResult.confidence * 100).toFixed(1)}% Confidence
                            </span>
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-800'}`}>
                              {capture.aiResult.category}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                        capture.reportId
                          ? 'bg-green-100 text-green-800'
                          : capture.processed
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {capture.reportId ? 'Report Created' : capture.processed ? 'Processed' : 'Pending'}
                      </div>
                      {/* Show Create Report button if processed but no report created */}
                      {capture.processed && !capture.reportId && capture.aiResult && capture.location && (
                        <button
                          onClick={() => handleCreateReport(capture)}
                          className={`p-3 rounded-xl transition-all duration-200 hover:scale-110 ${
                            theme === 'dark'
                              ? 'hover:bg-green-900/20 text-green-400 hover:text-green-300'
                              : 'hover:bg-green-50 text-green-500 hover:text-green-600'
                          }`}
                          title="Create report manually"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCapture(capture.id)}
                        className={`p-3 rounded-xl transition-all duration-200 hover:scale-110 ${
                          theme === 'dark'
                            ? 'hover:bg-red-900/20 text-red-400 hover:text-red-300'
                            : 'hover:bg-red-50 text-red-500 hover:text-red-600'
                        }`}
                        title="Delete capture"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Error or Info Messages */}
                  {(capture.error || (capture.processed && !capture.reportId)) && (
                    <div className={`mt-6 p-4 rounded-xl ${
                      capture.error
                        ? theme === 'dark'
                          ? 'bg-red-900/20 text-red-400 border border-red-800'
                          : 'bg-red-50 text-red-600 border border-red-200'
                        : theme === 'dark'
                          ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-800'
                          : 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        {capture.error ? (
                          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-semibold mb-2">
                            {capture.error ? 'Error' : 'Info'}
                          </p>
                          <p className="text-sm leading-relaxed">
                            {capture.error || `No report created - ${!capture.location ? 'missing location' : 'criteria not met'}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartCameraPanel;