import { useState, useEffect } from 'react';

export interface LocationData {
  lat: number;
  lng: number;
  city: string;
  state: string;
  country: string;
  district?: string;
  coastalZone?: 'east' | 'west' | 'south' | 'island';
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  nearestPort?: string;
  lastUpdated: Date;
}

export interface LocationError {
  code: number;
  message: string;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: 'Geolocation is not supported by this browser.'
      });
      return;
    }

    setLoading(true);
    setError(null);

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes cache
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude: lat, longitude: lng } = position.coords;
          
          // Reverse geocoding using a free API
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
          );
          
          if (!response.ok) {
            throw new Error('Failed to get location details');
          }
          
          const data = await response.json();
          
          // Determine coastal zone based on coordinates (India-specific)
          const getCoastalZone = (lat: number, lng: number): 'east' | 'west' | 'south' | 'island' => {
            if (lng < 75) return 'west'; // Arabian Sea side
            if (lng > 85) return 'east'; // Bay of Bengal side
            if (lat < 10) return 'south'; // Southern tip
            if ((lng > 72 && lng < 74) || (lng > 91 && lng < 94)) return 'island'; // Lakshadweep, Andaman & Nicobar
            return 'east'; // Default to east coast
          };

          // Determine risk level based on location (simplified logic)
          const getRiskLevel = (city: string, coastalZone: string): 'low' | 'medium' | 'high' | 'critical' => {
            const highRiskCities = ['mumbai', 'chennai', 'kolkata', 'visakhapatnam', 'kochi'];
            const criticalRiskCities = ['sundarbans', 'pulicat', 'chilika'];
            
            const cityLower = city.toLowerCase();
            if (criticalRiskCities.some(c => cityLower.includes(c))) return 'critical';
            if (highRiskCities.some(c => cityLower.includes(c))) return 'high';
            if (coastalZone === 'east') return 'medium'; // Bay of Bengal is generally higher risk
            return 'low';
          };

          // Get nearest major port
          const getNearestPort = (lat: number, lng: number): string => {
            const majorPorts = [
              { name: 'Mumbai Port', lat: 18.9220, lng: 72.8347 },
              { name: 'Chennai Port', lat: 13.1023, lng: 80.3000 },
              { name: 'Kolkata Port', lat: 22.5726, lng: 88.3639 },
              { name: 'Visakhapatnam Port', lat: 17.6868, lng: 83.2185 },
              { name: 'Kochi Port', lat: 9.9312, lng: 76.2673 },
              { name: 'Mangalore Port', lat: 12.8697, lng: 74.8856 },
              { name: 'Tuticorin Port', lat: 8.7642, lng: 78.1348 }
            ];

            let nearestPort = majorPorts[0];
            let minDistance = Infinity;

            majorPorts.forEach(port => {
              const distance = Math.sqrt(
                Math.pow(lat - port.lat, 2) + Math.pow(lng - port.lng, 2)
              );
              if (distance < minDistance) {
                minDistance = distance;
                nearestPort = port;
              }
            });

            return nearestPort.name;
          };

          const coastalZone = getCoastalZone(lat, lng);
          const city = data.city || data.locality || data.principalSubdivision || 'Unknown City';
          const riskLevel = getRiskLevel(city, coastalZone);
          const nearestPort = getNearestPort(lat, lng);

          const locationData: LocationData = {
            lat,
            lng,
            city,
            state: data.principalSubdivision || 'Unknown State',
            country: data.countryName || 'India',
            district: data.localityInfo?.administrative?.[2]?.name,
            coastalZone,
            riskLevel,
            nearestPort,
            lastUpdated: new Date()
          };

          setLocation(locationData);
          
          // Cache location data
          localStorage.setItem('jalBandhu_user_location', JSON.stringify(locationData));
        } catch (err) {
          setError({
            code: 1,
            message: 'Failed to get location details'
          });
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        setError({
          code: error.code,
          message: error.message
        });
      },
      options
    );
  };

  const getCachedLocation = (): LocationData | null => {
    try {
      const cached = localStorage.getItem('jalBandhu_user_location');
      if (cached) {
        const locationData = JSON.parse(cached);
        // Check if cached data is less than 1 hour old
        const lastUpdated = new Date(locationData.lastUpdated);
        const now = new Date();
        const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 1) {
          return locationData;
        }
      }
    } catch (error) {
      console.error('Error reading cached location:', error);
    }
    return null;
  };

  // Auto-load cached location on mount
  useEffect(() => {
    const cached = getCachedLocation();
    if (cached) {
      setLocation(cached);
    }
  }, []);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    getCachedLocation
  };
};

export default useLocation;