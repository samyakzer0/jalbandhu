// Test script for OpenCage Geocoding with Major City Priority
// Note: Using configured API key for better results
// Tests both rural and urban locations to verify major city detection

import { testGeocodingAccuracy } from './services/GeocodingService';

// Test cases with known coordinates and expected cities
const testCases = [
  // Major cities - should return exact match
  { lat: 19.0760, lng: 72.8777, expectedCity: "Mumbai" },
  { lat: 28.7041, lng: 77.1025, expectedCity: "Delhi" },
  { lat: 12.9716, lng: 77.5946, expectedCity: "Bengaluru" },

  // Rural areas near major cities - should return nearest major city
  { lat: 19.2000, lng: 72.9000, expectedCity: "Mumbai" }, // Near Mumbai
  { lat: 28.6000, lng: 77.2000, expectedCity: "Delhi" },  // Near Delhi
  { lat: 13.0000, lng: 77.5000, expectedCity: "Bengaluru" }, // Near Bengaluru

  // International cities
  { lat: 40.7128, lng: -74.0060, expectedCity: "New York" },
  { lat: 51.5074, lng: -0.1278, expectedCity: "London" }
];

console.log('🗺️ Testing OpenCage Geocoding with Major City Priority...');
console.log('Note: Rural areas should return nearest major city within 50km\n');

// Run the test
testGeocodingAccuracy(testCases);
