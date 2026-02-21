/**
 * INCOIS Service Hook
 * Custom React hook for managing INCOIS data integration in JalBandhu
 */

import { useState, useEffect, useCallback } from 'react';
import { INCOISService, type EarlyWarning, type MarineConditions, type OfficialAlert, type SensorNetworkStatus } from '../services/INCOISService';
import type { LocationData } from '../hooks/useLocation';

interface INCOISData {
  warnings: EarlyWarning[];
  marineConditions: MarineConditions | null;
  officialAlerts: OfficialAlert[];
  sensorStatus: SensorNetworkStatus | null;
}

interface INCOISHookReturn {
  data: INCOISData;
  loading: boolean;
  error: string | null;
  refreshAll: () => Promise<void>;
}

const useINCOIS = (location: LocationData | null): INCOISHookReturn => {
  const [data, setData] = useState<INCOISData>({
    warnings: [],
    marineConditions: null,
    officialAlerts: [],
    sensorStatus: null,
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const incoisService = new INCOISService();

  // Refresh all INCOIS data
  const refreshAll = useCallback(async () => {
    if (!location?.lat || !location?.lng || !location?.city) {
      console.log('INCOIS: Cannot refresh - missing location data');
      return;
    }
    
    console.log('INCOIS: Starting data refresh for location:', location.city);
    setLoading(true);
    setError(null);
    
    try {
      const [warnings, marineConditions, officialAlerts, sensorData] = await Promise.allSettled([
        incoisService.getEarlyWarnings({
          lat: location.lat,
          lng: location.lng
        }),
        incoisService.getMarineConditions({
          lat: location.lat,
          lng: location.lng
        }),
        incoisService.getOfficialAlerts(location.city),
        incoisService.getSensorData({
          north: location.lat + 0.5,
          south: location.lat - 0.5,
          east: location.lng + 0.5,
          west: location.lng - 0.5
        }),
      ]);

      // Process results with detailed logging
      const processedData = {
        warnings: warnings.status === 'fulfilled' ? (warnings.value.data || []) : [],
        marineConditions: marineConditions.status === 'fulfilled' ? (marineConditions.value.data || null) : null,
        officialAlerts: officialAlerts.status === 'fulfilled' ? (officialAlerts.value.data || []) : [],
        sensorStatus: sensorData.status === 'fulfilled' ? (sensorData.value.data || null) : null,
      };

      console.log('INCOIS: Data refresh completed:', {
        warnings: processedData.warnings.length,
        marineConditions: !!processedData.marineConditions,
        officialAlerts: processedData.officialAlerts.length,
        sensorStatus: !!processedData.sensorStatus
      });

      setData(processedData);

      // Count successful vs failed requests
      const failedResults = [warnings, marineConditions, officialAlerts, sensorData].filter(
        result => result.status === 'rejected'
      );
      
      if (failedResults.length === 4) {
        setError('All INCOIS services unavailable - using offline data');
      } else if (failedResults.length > 0) {
        console.warn(`INCOIS: ${failedResults.length} out of 4 services failed`);
      }
    } catch (err) {
      console.error('INCOIS: Critical error during data refresh:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch INCOIS data');
    } finally {
      setLoading(false);
    }
  }, [location?.lat, location?.lng, location?.city, incoisService]);

  // Auto-refresh data when location changes (debounced)
  useEffect(() => {
    if (!location?.lat || !location?.lng || !location?.city) {
      console.log('INCOIS: Skipping data fetch - incomplete location data');
      return;
    }
    
    console.log('INCOIS: Location detected, scheduling data refresh for:', {
      city: location.city,
      coordinates: [location.lat, location.lng]
    });
    
    const timeoutId = setTimeout(() => {
      refreshAll();
    }, 1000); // Debounce for 1 second
    
    return () => {
      console.log('INCOIS: Cancelling pending data refresh');
      clearTimeout(timeoutId);
    };
  }, [location?.lat, location?.lng, location?.city]); // Only depend on specific location properties

  // Removed automatic refresh intervals to prevent excessive API calls
  // Uncomment below for production with real INCOIS API
  /*
  useEffect(() => {
    if (!location) return;

    // Refresh warnings and alerts every 5 minutes
    const warningsInterval = setInterval(() => {
      refreshAll();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(warningsInterval);
    };
  }, [location, refreshAll]);
  */

  return {
    data,
    loading,
    error,
    refreshAll,
  };
};

export default useINCOIS;