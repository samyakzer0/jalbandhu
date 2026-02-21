import React, { useState } from 'react';
import { reverseGeocode } from '../services/GeocodingService';
import { useTheme } from '../contexts/ThemeContext';

const GeocodingTest: React.FC = () => {
  const { theme } = useTheme();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const testLocations = [
    { name: 'Delhi, India', lat: 28.6139, lng: 77.2090 },
    { name: 'Mumbai, India', lat: 19.0760, lng: 72.8777 },
    { name: 'New York, USA', lat: 40.7128, lng: -74.0060 },
    { name: 'London, UK', lat: 51.5074, lng: -0.1278 }
  ];

  const runGeocodingTest = async () => {
    setIsTesting(true);
    setTestResults([]);

    const results = [];

    for (const location of testLocations) {
      try {
        console.log(`Testing geocoding for ${location.name}...`);
        const result = await reverseGeocode(location.lat, location.lng);
        results.push({
          location: location.name,
          expected: location.name.split(',')[0],
          actual: result,
          success: true
        });
        console.log(`✅ ${location.name}:`, result);
      } catch (error) {
        results.push({
          location: location.name,
          expected: location.name.split(',')[0],
          actual: null,
          success: false,
          error: error.message
        });
        console.error(`❌ ${location.name}:`, error);
      }
    }

    setTestResults(results);
    setIsTesting(false);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-4xl mx-auto">
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-8`}>
          Geocoding Test
        </h1>

        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 shadow-lg border mb-6`}>
          <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4`}>
            Test Free Geocoding Services
          </h2>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
            This test verifies that the geocoding functionality is working properly using free APIs:
          </p>
          <ul className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} list-disc list-inside mb-6`}>
            <li>OpenCage Geocoder (Primary - 2,500 requests/day free)</li>
            <li>BigDataCloud (Fallback - Free tier)</li>
            <li>OpenStreetMap Nominatim (Final fallback - Completely free)</li>
          </ul>

          <button
            onClick={runGeocodingTest}
            disabled={isTesting}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
              isTesting
                ? 'bg-gray-500 cursor-not-allowed'
                : theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isTesting ? 'Testing...' : 'Run Geocoding Test'}
          </button>
        </div>

        {testResults.length > 0 && (
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 shadow-lg border`}>
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4`}>
              Test Results
            </h2>

            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success
                      ? theme === 'dark'
                        ? 'bg-green-900/20 border-green-700'
                        : 'bg-green-50 border-green-200'
                      : theme === 'dark'
                      ? 'bg-red-900/20 border-red-700'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      {result.location}
                    </h3>
                    <span className={`px-2 py-1 rounded text-sm ${
                      result.success
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}>
                      {result.success ? '✅ Success' : '❌ Failed'}
                    </span>
                  </div>

                  {result.success ? (
                    <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      <p><strong>City:</strong> {result.actual.city}</p>
                      <p><strong>Address:</strong> {result.actual.address}</p>
                      {result.actual.country && <p><strong>Country:</strong> {result.actual.country}</p>}
                    </div>
                  ) : (
                    <div className={`${theme === 'dark' ? 'text-red-300' : 'text-red-600'}`}>
                      <p><strong>Error:</strong> {result.error}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeocodingTest;
