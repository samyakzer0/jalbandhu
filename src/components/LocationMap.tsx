import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface LocationMapProps {
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  onLocationChange: (location: { lat: number; lng: number; address: string }) => void;
  editable?: boolean;
}

const LocationMap: React.FC<LocationMapProps> = ({ location, onLocationChange, editable = true }) => {
  const { theme } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  useEffect(() => {
    // In a real implementation, we would initialize a map library like Google Maps or Leaflet
    // For the prototype, we'll just show a static map with the location
    
    if (mapContainerRef.current) {
      // Simulate map initialization
      setTimeout(() => {
        setMapInitialized(true);
      }, 500);
    }
  }, []);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editable) return;
    
    // In a real implementation, we would get the coordinates from the map click event
    // For the prototype, we'll just simulate a location change with slight variations
    
    const mapRect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - mapRect.left;
    const clickY = e.clientY - mapRect.top;
    
    // Convert click position to a simulated lat/lng (just for the prototype)
    const latOffset = ((mapRect.height / 2) - clickY) / mapRect.height * 0.01;
    const lngOffset = (clickX - (mapRect.width / 2)) / mapRect.width * 0.01;
    
    const newLat = location.lat + latOffset;
    const newLng = location.lng + lngOffset;
    
    onLocationChange({
      lat: newLat,
      lng: newLng,
      address: `Lat: ${newLat.toFixed(6)}, Lng: ${newLng.toFixed(6)}`
    });
  };

  return (
    <div 
      ref={mapContainerRef}
      className={`relative w-full h-48 overflow-hidden rounded-xl ${
        theme === 'dark' 
          ? 'bg-gray-700 text-white' 
          : 'bg-gray-100 text-gray-800'
      } ${editable ? 'cursor-crosshair' : 'cursor-default'}`}
      onClick={handleMapClick}
    >
      {/* Mock map - in a real app this would be a real map component */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-400/20 to-green-400/20"></div>
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="border border-gray-200/10"></div>
        ))}
      </div>
      
      {/* Map center pin */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center">
          <MapPin 
            size={32} 
            className={`${theme === 'dark' ? 'text-red-500' : 'text-red-600'} drop-shadow-lg`} 
          />
          <div className="absolute bottom-0 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
        </div>
      </div>
      
      {/* Location info */}
      <div className="absolute bottom-2 left-2 right-2">
        <div 
          className={`${
            theme === 'dark' 
              ? 'bg-gray-800/80 text-white' 
              : 'bg-white/80 text-gray-800'
          } text-xs p-2 rounded shadow-lg backdrop-blur-sm`}
        >
          {mapInitialized ? (
            <>
              <div className="font-semibold">Selected Location:</div>
              <div className="truncate">{location.address}</div>
              <div className="text-xs opacity-75">
                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </div>
            </>
          ) : (
            <div className="animate-pulse">Loading map...</div>
          )}
        </div>
      </div>
      
      {editable && (
        <div 
          className={`absolute top-2 right-2 ${
            theme === 'dark' 
              ? 'bg-gray-800/80 text-white' 
              : 'bg-white/80 text-gray-800'
          } text-xs p-1 rounded shadow-lg backdrop-blur-sm`}
        >
          {editable ? 'Click to adjust location' : ''}
        </div>
      )}
    </div>
  );
};

export default LocationMap;
