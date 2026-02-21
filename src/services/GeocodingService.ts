/**
 * Free geocoding utilities for Nivaran
 * Primary: OpenCage Geocoder (Free tier: 2,500 requests/day)
 * Features: Major City Priority, Distance-based Detection
 * Fallbacks: BigDataCloud, OpenStreetMap Nominatim
 *
 * Key Features:
 * - Detects nearest major city within 50km radius
 * - Supports 30+ major cities worldwide
 * - Rural areas return nearest big city
 * - Multiple API fallbacks for reliability
 *
 * To get your free OpenCage API key:
 * 1. Go to https://opencagedata.com/
 * 2. Sign up for free account
 * 3. Get your API key from dashboard
 * 4. Replace the API key in OPENCAGE_API_KEY constant
 */

// Configuration - Replace 'demo' with your actual OpenCage API key
const OPENCAGE_API_KEY = '128f26f2b14446b7b2c17976b7fdb12e'; // Replace with your API key

// Major cities with their coordinates for distance calculation
const majorCitiesWithCoords = [
  { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
  { name: "Delhi", lat: 28.7041, lng: 77.1025 },
  { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
  { name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { name: "Pune", lat: 18.5204, lng: 73.8567 },
  { name: "Indore", lat: 22.7196, lng: 75.8577 },
  { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
  { name: "Lucknow", lat: 26.8467, lng: 80.9462 },
  { name: "Kanpur", lat: 26.4499, lng: 80.3319 },
  { name: "Nagpur", lat: 21.1458, lng: 79.0882 },
  { name: "Thane", lat: 19.2183, lng: 72.9781 },
  { name: "Bhopal", lat: 23.2599, lng: 77.4126 },
  { name: "Visakhapatnam", lat: 17.6868, lng: 83.2185 },
  { name: "Patna", lat: 25.5941, lng: 85.1376 },
  { name: "Vadodara", lat: 22.3072, lng: 73.1812 },
  { name: "Ludhiana", lat: 30.9010, lng: 75.8573 },
  { name: "Agra", lat: 27.1767, lng: 78.0081 },
  { name: "New York", lat: 40.7128, lng: -74.0060 },
  { name: "London", lat: 51.5074, lng: -0.1278 },
  { name: "Tokyo", lat: 35.6762, lng: 139.6503 },
  { name: "Shanghai", lat: 31.2304, lng: 121.4737 },
  { name: "Paris", lat: 48.8566, lng: 2.3522 },
  { name: "Singapore", lat: 1.3521, lng: 103.8198 },
  { name: "Dubai", lat: 25.2048, lng: 55.2708 },
  { name: "Sydney", lat: -33.8688, lng: 151.2093 },
  { name: "Toronto", lat: 43.6532, lng: -79.3832 },
  { name: "Berlin", lat: 52.5200, lng: 13.4050 }
];

// Interface for geocoding result
export interface GeocodeResult {
  city: string;
  address: string;
  country?: string;
  state?: string;
  postalCode?: string;
}

/**
 * Find the nearest major city to given coordinates
 * @param lat Latitude
 * @param lng Longitude
 * @returns Name of the nearest major city
 */
const findNearestMajorCity = (lat: number, lng: number): string => {
  let nearestCity = "Unknown";
  let minDistance = Infinity;

  for (const city of majorCitiesWithCoords) {
    const distance = calculateDistance(lat, lng, city.lat, city.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city.name;
    }
  }

  return nearestCity;
};

/**
 * Enhanced city detection with priority for major cities
 * @param components Address components from geocoding API
 * @param lat Latitude for distance calculation
 * @param lng Longitude for distance calculation
 * @returns Most appropriate city name
 */
const extractCityWithMajorPriority = (components: any, lat: number, lng: number): string => {
  // First, try to find the nearest major city (within 50km)
  const nearestMajorCity = findNearestMajorCity(lat, lng);
  const distanceToNearest = calculateDistance(lat, lng,
    majorCitiesWithCoords.find(c => c.name === nearestMajorCity)?.lat || 0,
    majorCitiesWithCoords.find(c => c.name === nearestMajorCity)?.lng || 0
  );

  // If nearest major city is within 50km, prefer it
  if (distanceToNearest <= 50) {
    return nearestMajorCity;
  }

  // Otherwise, use the standard priority order
  return components.city ||
         components.town ||
         components.village ||
         components.municipality ||
         components.suburb ||
         components.county ||
         components.state_district ||
         nearestMajorCity; // Fallback to nearest major city
};

/**
 * Get city and address from coordinates using OpenCage Geocoder (Free tier available)
 * @param lat Latitude
 * @param lng Longitude
 * @returns Promise with geocoding result
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<GeocodeResult> => {
  // Try OpenCage Geocoder first (free tier: 2,500 requests/day)
  try {
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${OPENCAGE_API_KEY}&language=en&pretty=1`
    );

    if (response.ok) {
      const data = await response.json();

      if (data && data.results && data.results.length > 0) {
        const result = data.results[0];
        const components = result.components;

        // Enhanced city detection with major city priority
        const city = extractCityWithMajorPriority(components, lat, lng);

        // Debug logging
        console.log('OpenCage Geocoding result:', {
          city,
          nearestMajorCity: findNearestMajorCity(lat, lng),
          fullAddress: result.formatted,
          components: result.components
        });

        return {
          city: city,
          address: result.formatted || `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
          country: components.country,
          state: components.state,
          postalCode: components.postcode
        };
      }
    }
  } catch (error) {
    console.warn('OpenCage Geocoder failed:', error);
  }

  // Try BigDataCloud as fallback (free tier)
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );

    if (response.ok) {
      const data = await response.json();

      if (data) {
        // Create components object for consistent processing
        const components = {
          city: data.city,
          town: data.city,
          village: data.city,
          municipality: data.city,
          suburb: data.localityInfo?.administrative?.[3]?.name,
          county: data.localityInfo?.administrative?.[2]?.name,
          state_district: data.localityInfo?.administrative?.[1]?.name
        };

        const city = extractCityWithMajorPriority(components, lat, lng);

        const result: GeocodeResult = {
          city: city,
          address: data.localityInfo?.informative?.[0]?.description ||
                  `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
          country: data.countryName,
          state: data.principalSubdivision,
          postalCode: data.postcode
        };

        return result;
      }
    }
  } catch (error) {
    console.warn('BigDataCloud API failed:', error);
  }

  // Try OpenStreetMap Nominatim as final fallback (completely free)
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Nivaran/1.0 (nivaran@example.com)' // Required by Nominatim
        }
      }
    );

    if (response.ok) {
      const data = await response.json();

      if (data && data.address) {
        // Create components object for consistent processing
        const components = {
          city: data.address.city,
          town: data.address.town,
          village: data.address.village,
          municipality: data.address.municipality,
          suburb: data.address.suburb,
          county: data.address.county,
          state_district: data.address.state_district
        };

        const city = extractCityWithMajorPriority(components, lat, lng);

        console.log('OSM Fallback result:', { city, fullAddress: data.display_name });

        return {
          city: city,
          address: data.display_name || `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
          country: data.address.country,
          state: data.address.state,
          postalCode: data.address.postcode
        };
      }
    }
  } catch (error) {
    console.warn('OpenStreetMap Nominatim fallback failed:', error);
  }

  // Final fallback
  return {
    city: "Unknown",
    address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
  };
};

/**
 * Get coordinates from city name using free APIs
 * @param cityName Name of the city
 * @returns Promise with coordinates
 */
export const geocodeCity = async (cityName: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`,
      {
        headers: {
          'User-Agent': 'Nivaran/1.0 (nivaran@example.com)'
        }
      }
    );

    if (response.ok) {
      const data = await response.json();

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
    }
  } catch (error) {
    console.warn('City geocoding failed:', error);
  }

  return null;
};

/**
 * Validate if coordinates are within a reasonable range
 * @param lat Latitude
 * @param lng Longitude
 * @returns boolean indicating if coordinates are valid
 */
export const validateCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in kilometers
 */
export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Test geocoding accuracy with known coordinates
 * @param testCases Array of test coordinates with expected cities
 */
export const testGeocodingAccuracy = async (testCases: Array<{ lat: number; lng: number; expectedCity: string }>) => {
  console.log('🧪 Testing Geocoding Accuracy...\n');

  for (const testCase of testCases) {
    try {
      const result = await reverseGeocode(testCase.lat, testCase.lng);
      const accuracy = result.city.toLowerCase() === testCase.expectedCity.toLowerCase() ? '✅' : '❌';

      console.log(`${accuracy} Expected: ${testCase.expectedCity} | Got: ${result.city}`);
      console.log(`   Address: ${result.address}\n`);
    } catch (error) {
      console.error(`❌ Error testing coordinates (${testCase.lat}, ${testCase.lng}):`, error);
    }
  }
};

export default {
  reverseGeocode,
  geocodeCity,
  validateCoordinates,
  calculateDistance,
  testGeocodingAccuracy
};
