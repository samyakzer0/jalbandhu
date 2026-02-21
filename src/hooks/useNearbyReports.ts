import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LocationData } from './useLocation';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface NearbyReport {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  images?: string[];
  created_at: string;
  user_id: string;
  distance?: number; // Distance from user in km
  votes_up: number;
  votes_down: number;
  comments_count?: number;
}

export const useNearbyReports = (userLocation: LocationData | null, radiusKm: number = 10) => {
  const [reports, setReports] = useState<NearbyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate mock data for testing
  const generateMockReports = useCallback((): NearbyReport[] => {
    if (!userLocation) return [];

    const categories = ['tsunami', 'cyclone', 'storm-surge', 'high-waves', 'coastal-erosion', 'marine-flooding', 'rip-current'];
    const urgencyLevels: Array<'low' | 'medium' | 'high' | 'urgent'> = ['low', 'medium', 'high', 'urgent'];
    const statusOptions: Array<'open' | 'in-progress' | 'resolved' | 'closed'> = ['open', 'in-progress', 'resolved', 'closed'];
    
    const mockReportTemplates = {
      tsunami: [
        { title: 'Tsunami Warning Alert', description: 'Potential tsunami threat detected following seismic activity. Immediate evacuation recommended for low-lying coastal areas.' },
        { title: 'Tsunami Preparedness Check', description: 'Community tsunami evacuation drill scheduled. All residents requested to participate in safety procedure.' }
      ],
      cyclone: [
        { title: 'Cyclonic Storm Formation', description: 'Tropical cyclone developing in Bay of Bengal. Wind speeds expected to reach 120+ km/h. Secure all loose objects.' },
        { title: 'Post-Cyclone Damage Assessment', description: 'Coastal infrastructure damage reported. Roads flooded, power lines down. Emergency services responding.' }
      ],
      'storm-surge': [
        { title: 'Storm Surge Alert', description: 'High tide combined with strong winds causing storm surge up to 3 meters. Coastal flooding imminent.' },
        { title: 'Storm Surge Damage', description: 'Waterfront properties flooded due to storm surge. Emergency evacuation in progress.' }
      ],
      'high-waves': [
        { title: 'Dangerous Wave Conditions', description: 'Wave heights reaching 5-6 meters. All marine activities suspended. Beach access restricted.' },
        { title: 'High Wave Beach Erosion', description: 'Severe beach erosion due to continuous high wave action. Coastal structures at risk.' }
      ],
      'coastal-erosion': [
        { title: 'Rapid Coastal Erosion', description: 'Accelerated shoreline retreat observed. Several coastal structures compromised. Immediate assessment needed.' },
        { title: 'Erosion Control Failure', description: 'Sea wall breach reported. Coastal protection measures require urgent reinforcement.' }
      ],
      'marine-flooding': [
        { title: 'Coastal Flooding Emergency', description: 'Sea water inundation in low-lying coastal areas. Residents advised to move to higher ground.' },
        { title: 'Tidal Flooding Alert', description: 'King tide causing extensive coastal flooding. Multiple roads impassable, emergency routes activated.' }
      ],
      'rip-current': [
        { title: 'Dangerous Rip Current Warning', description: 'Strong rip currents detected along beach. Multiple swimmer rescues reported. Beach patrol increased.' },
        { title: 'Rip Current Safety Alert', description: 'Life-threatening rip currents present. Swimming prohibited. Lifeguard advisory in effect.' }
      ]
    };

    const mockReports: NearbyReport[] = [];

    // Generate 15-25 reports
    for (let i = 0; i < Math.floor(Math.random() * 10) + 15; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const templates = mockReportTemplates[category as keyof typeof mockReportTemplates] || [{ title: 'Ocean Safety Report', description: 'General ocean safety concern reported.' }];
      const template = templates[Math.floor(Math.random() * templates.length)];
      
      // Generate nearby location (within radius)
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * radiusKm * 0.8; // Keep most within 80% of radius
      const latOffset = (distance / 111) * Math.cos(angle);
      const lngOffset = (distance / (111 * Math.cos(userLocation.lat * Math.PI / 180))) * Math.sin(angle);
      
      const reportLat = userLocation.lat + latOffset;
      const reportLng = userLocation.lng + lngOffset;
      
      // Generate address based on location
      const addresses = [
        `${userLocation.city} Beach Front`,
        `Marine Drive, ${userLocation.city}`,
        `Coastal Road, ${userLocation.city}`,
        `Harbor Area, ${userLocation.city}`,
        `${userLocation.city} Port`,
        `Seaside Boulevard, ${userLocation.city}`,
        `Waterfront District, ${userLocation.city}`,
        `${userLocation.city} Marina`,
        `Beach Resort Area, ${userLocation.city}`,
        `Fishing Village near ${userLocation.city}`
      ];
      
      const urgency = urgencyLevels[Math.floor(Math.random() * urgencyLevels.length)];
      const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
      
      // Generate realistic timestamps (last 7 days)
      const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      
      const mockReport: NearbyReport = {
        id: `mock_report_${i + 1}`,
        title: template.title,
        description: template.description,
        category,
        urgency,
        status,
        location: {
          lat: reportLat,
          lng: reportLng,
          address: addresses[Math.floor(Math.random() * addresses.length)]
        },
        images: Math.random() > 0.6 ? [`https://picsum.photos/400/300?random=${i}`] : undefined,
        created_at: createdAt.toISOString(),
        user_id: `user_${Math.floor(Math.random() * 1000)}`,
        distance: Math.round(distance * 100) / 100,
        votes_up: Math.floor(Math.random() * 50),
        votes_down: Math.floor(Math.random() * 10),
        comments_count: Math.floor(Math.random() * 20)
      };

      mockReports.push(mockReport);
    }

    // Sort by distance, then by urgency
    return mockReports.sort((a, b) => {
      if (a.urgency === 'urgent' && b.urgency !== 'urgent') return -1;
      if (a.urgency !== 'urgent' && b.urgency === 'urgent') return 1;
      if (a.urgency === 'high' && !['urgent', 'high'].includes(b.urgency)) return -1;
      if (!['urgent', 'high'].includes(a.urgency) && b.urgency === 'high') return 1;
      return (a.distance || 0) - (b.distance || 0);
    });
  }, [userLocation, radiusKm]);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = useCallback((
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const fetchNearbyReports = useCallback(async () => {
    if (!userLocation) return;

    setLoading(true);
    setError(null);

    try {
      // First try to fetch from Supabase
      const latDelta = radiusKm / 111; // Roughly 1 degree = 111 km
      const lngDelta = radiusKm / (111 * Math.cos(userLocation.lat * Math.PI / 180));

      const { data, error: fetchError } = await supabase
        .from('reports')
        .select(`
          id,
          title,
          description,
          category,
          urgency,
          status,
          location,
          images,
          created_at,
          user_id,
          votes_up,
          votes_down
        `)
        .gte('location->>lat', userLocation.lat - latDelta)
        .lte('location->>lat', userLocation.lat + latDelta)
        .gte('location->>lng', userLocation.lng - lngDelta)
        .lte('location->>lng', userLocation.lng + lngDelta)
        .order('created_at', { ascending: false })
        .limit(100);

      // If we have real data, use it
      if (!fetchError && data && data.length > 0) {
        const nearbyReports: NearbyReport[] = data
          .map(report => {
            const reportLat = parseFloat(report.location?.lat || '0');
            const reportLng = parseFloat(report.location?.lng || '0');
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              reportLat,
              reportLng
            );

            return {
              ...report,
              location: {
                lat: reportLat,
                lng: reportLng,
                address: report.location?.address || 'Unknown location'
              },
              distance: Math.round(distance * 100) / 100
            };
          })
          .filter(report => report.distance! <= radiusKm)
          .sort((a, b) => a.distance! - b.distance!);

        setReports(nearbyReports);
      } else {
        // Fallback to mock data for demonstration
        console.log('No real data available, using mock data for demonstration');
        const mockReports = generateMockReports();
        setReports(mockReports);
      }
    } catch (err) {
      console.error('Error fetching reports, using mock data:', err);
      // Use mock data as fallback when real API fails
      const mockReports = generateMockReports();
      setReports(mockReports);
    } finally {
      setLoading(false);
    }
  }, [userLocation, radiusKm, calculateDistance, generateMockReports]);

  // Fetch reports when user location changes
  useEffect(() => {
    fetchNearbyReports();
  }, [fetchNearbyReports]);

  const getReportsByCategory = useCallback((category?: string) => {
    if (!category) return reports;
    return reports.filter(report => report.category === category);
  }, [reports]);

  const getReportsByUrgency = useCallback((urgency?: string) => {
    if (!urgency) return reports;
    return reports.filter(report => report.urgency === urgency);
  }, [reports]);

  const getReportsByStatus = useCallback((status?: string) => {
    if (!status) return reports;
    return reports.filter(report => report.status === status);
  }, [reports]);

  const refreshReports = useCallback(() => {
    fetchNearbyReports();
  }, [fetchNearbyReports]);

  // Get statistics
  const getStats = useCallback(() => {
    const stats = {
      total: reports.length,
      urgent: reports.filter(r => r.urgency === 'urgent').length,
      high: reports.filter(r => r.urgency === 'high').length,
      open: reports.filter(r => r.status === 'open').length,
      resolved: reports.filter(r => r.status === 'resolved').length,
      categories: {} as Record<string, number>
    };

    // Count by category
    reports.forEach(report => {
      stats.categories[report.category] = (stats.categories[report.category] || 0) + 1;
    });

    return stats;
  }, [reports]);

  return {
    reports,
    loading,
    error,
    refreshReports,
    getReportsByCategory,
    getReportsByUrgency,
    getReportsByStatus,
    getStats,
    radiusKm
  };
};

export default useNearbyReports;