/**
 * Map Data Service - Handles fetching and real-time updates for map data
 * Uses Supabase for data persistence and real-time subscriptions
 */

import { supabase } from './supabase';

export interface MapIssue {
  id: string;
  report_id: string;
  title: string;
  description: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Submitted' | 'In Review' | 'Forwarded' | 'Resolved';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  city?: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
}

/**
 * Fetch all issues with valid coordinates for map display
 */
export const fetchMapIssues = async (): Promise<MapIssue[]> => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .not('location', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching map issues:', error);
      return [];
    }

    // Transform and filter valid coordinates
    const mapIssues: MapIssue[] = data
      .filter((report: any) => {
        // Ensure location has valid lat/lng
        if (!report.location || typeof report.location !== 'object') return false;
        const { lat, lng } = report.location;
        return (
          typeof lat === 'number' && 
          typeof lng === 'number' && 
          !isNaN(lat) && 
          !isNaN(lng) &&
          lat >= -90 && 
          lat <= 90 && 
          lng >= -180 && 
          lng <= 180
        );
      })
      .map((report: any) => ({
        id: report.id,
        report_id: report.report_id,
        title: report.title,
        description: report.description,
        category: report.category,
        priority: report.priority,
        status: report.status,
        location: report.location,
        city: report.city,
        created_at: report.created_at,
        updated_at: report.updated_at,
        image_url: report.image_url
      }));

    console.log(`Fetched ${mapIssues.length} issues for map display`);
    return mapIssues;
  } catch (error) {
    console.error('Error in fetchMapIssues:', error);
    return [];
  }
};

/**
 * Fetch issues within a specific geographic bounds
 */
export const fetchIssuesInBounds = async (
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }
): Promise<MapIssue[]> => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .not('location', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bounded issues:', error);
      return [];
    }

    // Filter issues within bounds
    const boundedIssues = data
      .filter((report: any) => {
        if (!report.location || typeof report.location !== 'object') return false;
        const { lat, lng } = report.location;
        return (
          typeof lat === 'number' && 
          typeof lng === 'number' && 
          lat >= bounds.south && 
          lat <= bounds.north && 
          lng >= bounds.west && 
          lng <= bounds.east
        );
      })
      .map((report: any) => ({
        id: report.id,
        report_id: report.report_id,
        title: report.title,
        description: report.description,
        category: report.category,
        priority: report.priority,
        status: report.status,
        location: report.location,
        city: report.city,
        created_at: report.created_at,
        updated_at: report.updated_at,
        image_url: report.image_url
      }));

    return boundedIssues;
  } catch (error) {
    console.error('Error in fetchIssuesInBounds:', error);
    return [];
  }
};

/**
 * Subscribe to real-time updates for map issues
 */
export const subscribeToMapUpdates = (
  onInsert: (issue: MapIssue) => void,
  onUpdate: (issue: MapIssue) => void,
  onDelete: (reportId: string) => void
) => {
  const subscription = supabase
    .channel('map_reports')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'reports'
      },
      (payload) => {
        const report = payload.new as any;
        // Only process reports with valid coordinates
        if (report.location && 
            typeof report.location === 'object' && 
            typeof report.location.lat === 'number' && 
            typeof report.location.lng === 'number') {
          const mapIssue: MapIssue = {
            id: report.id,
            report_id: report.report_id,
            title: report.title,
            description: report.description,
            category: report.category,
            priority: report.priority,
            status: report.status,
            location: report.location,
            city: report.city,
            created_at: report.created_at,
            updated_at: report.updated_at,
            image_url: report.image_url
          };
          onInsert(mapIssue);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'reports'
      },
      (payload) => {
        const report = payload.new as any;
        if (report.location && 
            typeof report.location === 'object' && 
            typeof report.location.lat === 'number' && 
            typeof report.location.lng === 'number') {
          const mapIssue: MapIssue = {
            id: report.id,
            report_id: report.report_id,
            title: report.title,
            description: report.description,
            category: report.category,
            priority: report.priority,
            status: report.status,
            location: report.location,
            city: report.city,
            created_at: report.created_at,
            updated_at: report.updated_at,
            image_url: report.image_url
          };
          onUpdate(mapIssue);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'reports'
      },
      (payload) => {
        const report = payload.old as any;
        onDelete(report.report_id);
      }
    )
    .subscribe();

  return subscription;
};

/**
 * Get current user location
 */
export const getCurrentLocation = (): Promise<{lat: number, lng: number}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        // Fallback to default location (Indian coastal region - Goa)
        console.warn('Location access denied, using default coastal location:', error);
        resolve({
          lat: 15.2993,
          lng: 74.1240
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

/**
 * Get priority color for markers
 */
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'Urgent':
      return '#ef4444'; // red-500
    case 'High':
      return '#f97316'; // orange-500
    case 'Medium':
      return '#eab308'; // yellow-500
    case 'Low':
      return '#22c55e'; // green-500
    default:
      return '#6b7280'; // gray-500
  }
};

/**
 * Get status color for markers
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Resolved':
      return '#22c55e'; // green-500
    case 'Forwarded':
      return '#3b82f6'; // blue-500
    case 'In Review':
      return '#eab308'; // yellow-500
    case 'Submitted':
      return '#6b7280'; // gray-500
    default:
      return '#6b7280'; // gray-500
  }
};

/**
 * Get category icon for markers
 */
export const getCategoryIcon = (category: string): string => {
  switch (category) {
    case 'Tsunami':
      return '🌊';
    case 'Cyclone':
      return '🌪️';
    case 'Storm Surge':
      return '⛈️';
    case 'High Waves':
      return '🌊';
    case 'Coastal Erosion':
      return '🏔️';
    case 'Marine Pollution':
      return '🛢️';
    case 'Oil Spill':
      return '🛢️';
    case 'Dead Zone':
      return '💀';
    case 'Algal Bloom':
      return '🦠';
    case 'Sea Level Rise':
      return '📈';
    case 'Extreme Weather':
      return '⚡';
    case 'Maritime Accident':
      return '⚓';
    case 'Search and Rescue':
      return '�';
    case 'Navigation Hazard':
      return '⚠️';
    case 'Other':
      return '🌊';
    default:
      return '🌊';
  }
};

/**
 * Generate heatmap data points for leaflet.heat
 */
export const generateHeatmapData = (issues: MapIssue[]): [number, number, number][] => {
  return issues.map(issue => {
    // Weight based on priority and recency
    let weight = 0.5; // base weight
    
    // Priority weighting
    switch (issue.priority) {
      case 'Urgent':
        weight += 0.4;
        break;
      case 'High':
        weight += 0.3;
        break;
      case 'Medium':
        weight += 0.2;
        break;
      case 'Low':
        weight += 0.1;
        break;
    }
    
    // Recency weighting (more recent issues have higher weight)
    const daysSinceCreated = (Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated < 7) weight += 0.3;
    else if (daysSinceCreated < 30) weight += 0.2;
    else if (daysSinceCreated < 90) weight += 0.1;
    
    // Status weighting (unresolved issues have higher weight)
    if (issue.status !== 'Resolved') {
      weight += 0.2;
    }
    
    return [issue.location.lat, issue.location.lng, Math.min(weight, 1.0)];
  });
};