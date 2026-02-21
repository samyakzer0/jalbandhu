/**
 * IssuesMap Component - Interactive map displaying civic issues
 * Uses React-Leaflet with OpenStreetMap tiles
 * Features: markers, clustering, heatmap, real-time updates
 */

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngBounds, LatLng, divIcon, point } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useTheme } from '../contexts/ThemeContext';
import { 
  fetchMapIssues, 
  subscribeToMapUpdates, 
  getCurrentLocation,
  getPriorityColor,
  getStatusColor,
  getCategoryIcon,
  MapIssue 
} from '../services/MapDataService';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';
import '../styles/map.css';

// Fix for default markers in React-Leaflet
import L from 'leaflet';

let DefaultIcon = L.divIcon({
  html: `<div style="background-color: #3b82f6; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
  iconSize: [25, 25],
  iconAnchor: [12, 12],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface IssuesMapProps {
  onNavigate?: (page: string) => void;
  className?: string;
  height?: string;
}

/**
 * Component to fit map bounds to markers
 */
const FitBounds: React.FC<{ issues: MapIssue[] }> = ({ issues }) => {
  const map = useMap();

  useEffect(() => {
    if (issues.length > 0) {
      const bounds = new LatLngBounds(
        issues.map(issue => new LatLng(issue.location.lat, issue.location.lng))
      );
      
      // Add padding and ensure minimum zoom level
      map.fitBounds(bounds, { 
        padding: [20, 20],
        maxZoom: 15
      });
    }
  }, [issues, map]);

  return null;
};

/**
 * Main IssuesMap component
 */
const IssuesMap: React.FC<IssuesMapProps> = ({ 
  onNavigate, 
  className = '', 
  height = '400px' 
}) => {
  const { theme } = useTheme();
  const [issues, setIssues] = useState<MapIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [center, setCenter] = useState<[number, number]>([15.2993, 74.1240]); // Default: Indian coastal region (Goa)
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const subscriptionRef = useRef<any>(null);

  // Filter issues based on selected category
  const filteredIssues = useMemo(() => {
    if (selectedCategory === 'all') return issues;
    return issues.filter(issue => issue.category === selectedCategory);
  }, [issues, selectedCategory]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = ['all', ...new Set(issues.map(issue => issue.category))];
    return cats;
  }, [issues]);

  // Initialize map and fetch data
  useEffect(() => {
    const initializeMap = async () => {
      try {
        setLoading(true);
        
        // Get user location
        const userLocation = await getCurrentLocation();
        setCenter([userLocation.lat, userLocation.lng]);
        
        // Fetch initial issues
        const mapIssues = await fetchMapIssues();
        setIssues(mapIssues);
        
        setError(null);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to load map data');
      } finally {
        setLoading(false);
      }
    };

    initializeMap();
  }, []);

  // Setup real-time subscriptions
  useEffect(() => {
    const subscription = subscribeToMapUpdates(
      // On insert
      (newIssue: MapIssue) => {
        setIssues(prev => [newIssue, ...prev]);
      },
      // On update
      (updatedIssue: MapIssue) => {
        setIssues(prev => 
          prev.map(issue => 
            issue.report_id === updatedIssue.report_id ? updatedIssue : issue
          )
        );
      },
      // On delete
      (deletedReportId: string) => {
        setIssues(prev => 
          prev.filter(issue => issue.report_id !== deletedReportId)
        );
      }
    );

    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  // Create custom marker icons
  const createCustomIcon = (issue: MapIssue) => {
    const priorityColor = getPriorityColor(issue.priority);
    const statusColor = getStatusColor(issue.status);
    const categoryIcon = getCategoryIcon(issue.category);
    
    return divIcon({
      html: `
        <div style="
          position: relative;
          width: 30px;
          height: 30px;
        ">
          <div style="
            width: 30px;
            height: 30px;
            background-color: ${priorityColor};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
          ">
            ${categoryIcon}
          </div>
          <div style="
            position: absolute;
            bottom: -2px;
            right: -2px;
            width: 12px;
            height: 12px;
            background-color: ${statusColor};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          "></div>
        </div>
      `,
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle marker click to navigate to report detail
  const handleMarkerClick = (issue: MapIssue) => {
    if (onNavigate) {
      onNavigate(`report-detail?reportId=${issue.report_id}&from=home`);
    }
  };

  if (loading) {
    return (
      <div 
        className={`${className} flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl`}
        style={{ height }}
      >
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${theme === 'dark' ? 'border-blue-400' : 'border-blue-600'} mx-auto mb-4`}></div>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`${className} flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl`}
        style={{ height }}
      >
        <div className="text-center">
          <p className={`${theme === 'dark' ? 'text-red-400' : 'text-red-600'} mb-4`}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} text-white transition-colors`}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative`}>
      {/* Map Controls - Right Top */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        {/* Category Filter */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`px-3 py-2 rounded-lg text-sm shadow-lg ${
              theme === 'dark' 
                ? 'bg-gray-800 text-white border-gray-600' 
                : 'bg-white text-gray-800 border-gray-300'
            } border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]`}
            style={{ 
              position: 'relative',
              pointerEvents: 'auto',
              zIndex: 1001
            }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div 
        className="relative z-0 rounded-xl overflow-hidden"
        style={{ height }}
      >
        <MapContainer
          center={center}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          className="rounded-xl"
          zoomControl={true}
          scrollWheelZoom={true}
        >
          {/* Esri World Imagery for better coastal visualization */}
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
          {/* OpenStreetMap overlay for labels and roads */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            opacity={0.4}
            className={theme === 'dark' ? 'map-dark-theme' : ''}
          />

          {/* Fit bounds to issues */}
          {filteredIssues.length > 0 && <FitBounds issues={filteredIssues} />}

          {/* Marker Clustering */}
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={(cluster) => {
              const count = cluster.getChildCount();
              let className = 'marker-cluster-small';
              
              if (count < 10) {
                className = 'marker-cluster-small';
              } else if (count < 100) {
                className = 'marker-cluster-medium';
              } else {
                className = 'marker-cluster-large';
              }

              return divIcon({
                html: `<div><span>${count}</span></div>`,
                className: `marker-cluster ${className}`,
                iconSize: point(40, 40, true)
              });
            }}
          >
            {/* Issue Markers */}
            {filteredIssues.map((issue) => (
              <Marker
                key={issue.report_id}
                position={[issue.location.lat, issue.location.lng]}
                icon={createCustomIcon(issue)}
                eventHandlers={{
                  click: () => handleMarkerClick(issue)
                }}
              >
                <Popup>
                  <div className="min-w-[250px] max-w-[300px]">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-2xl">{getCategoryIcon(issue.category)}</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-base mb-1 text-gray-900">
                          {issue.title}
                        </h3>
                        <div className="flex flex-wrap gap-1 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium`}
                                style={{ 
                                  backgroundColor: getPriorityColor(issue.priority) + '20',
                                  color: getPriorityColor(issue.priority)
                                }}>
                            {issue.priority}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium`}
                                style={{ 
                                  backgroundColor: getStatusColor(issue.status) + '20',
                                  color: getStatusColor(issue.status)
                                }}>
                            {issue.status}
                          </span>
                          {(issue as any).is_smart_camera_report && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              📸 Smart Camera
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                      {issue.description}
                    </p>
                    
                    <div className="text-xs text-gray-500 mb-3">
                      <p>📍 {issue.location.address}</p>
                      <p>📅 {formatDate(issue.created_at)}</p>
                      {issue.city && <p>🏢 {issue.city}</p>}
                    </div>
                    
                    <button
                      onClick={() => handleMarkerClick(issue)}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  );
};

export default IssuesMap;