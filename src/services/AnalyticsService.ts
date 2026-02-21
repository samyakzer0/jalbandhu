import { supabase } from './supabase.ts';
import { ReportData } from './ReportService.ts';

// Analytics data interfaces
export interface CommunityStats {
  totalReports: number;
  resolvedReports: number;
  activeReports: number;
  avgResponseTime: number; // in days
  resolutionRate: number; // percentage
}

export interface CategoryStats {
  category: string;
  count: number;
  percentage: number;
  avgResolutionTime: number;
}

export interface StatusStats {
  status: string;
  count: number;
  percentage: number;
}

export interface LocationStats {
  city: string;
  count: number;
  lat: number;
  lng: number;
}

// Get community impact statistics for homepage
export const getCommunityStats = async (): Promise<CommunityStats> => {
  try {
    let allReports: ReportData[] = [];
    
    // Try to get from Supabase first
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.log('Fetching community stats from Supabase');
      const { data, error } = await supabase
        .from('reports')
        .select('*');
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      allReports = data as ReportData[];
    } else {
      // Fallback to localStorage
      const storageData = localStorage.getItem('nivaran_reports');
      allReports = JSON.parse(storageData || '[]');
    }

    const totalReports = allReports.length;
    const resolvedReports = allReports.filter(r => r.status === 'Resolved').length;
    const activeReports = allReports.filter(r => r.status !== 'Resolved').length;
    
    // Calculate average response time for resolved reports
    let avgResponseTime = 2.3; // Default fallback
    const resolvedWithTimes = allReports.filter(r => r.status === 'Resolved');
    
    if (resolvedWithTimes.length > 0) {
      const totalDays = resolvedWithTimes.reduce((sum, report) => {
        const created = new Date(report.created_at);
        const updated = new Date(report.updated_at);
        const diffInDays = (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        return sum + diffInDays;
      }, 0);
      avgResponseTime = totalDays / resolvedWithTimes.length;
    }

    const resolutionRate = totalReports > 0 ? (resolvedReports / totalReports) * 100 : 0;

    return {
      totalReports,
      resolvedReports,
      activeReports,
      avgResponseTime: Math.round(avgResponseTime * 10) / 10, // Round to 1 decimal
      resolutionRate: Math.round(resolutionRate)
    };
  } catch (error) {
    console.error('Error fetching community stats:', error);
    
    // Return default stats if everything fails
    return {
      totalReports: 247,
      resolvedReports: 189,
      activeReports: 58,
      avgResponseTime: 2.3,
      resolutionRate: 76
    };
  }
};

// Get statistics by category
export const getCategoryStats = async (): Promise<CategoryStats[]> => {
  try {
    let allReports: ReportData[] = [];
    
    // Try to get from Supabase first
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { data, error } = await supabase
        .from('reports')
        .select('*');
      
      if (error) throw error;
      allReports = data as ReportData[];
    } else {
      const storageData = localStorage.getItem('nivaran_reports');
      allReports = JSON.parse(storageData || '[]');
    }

    const categoryMap = new Map<string, ReportData[]>();
    
    // Group reports by category
    allReports.forEach(report => {
      const category = report.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(report);
    });

    const totalReports = allReports.length;
    const categoryStats: CategoryStats[] = [];

    categoryMap.forEach((reports, category) => {
      const count = reports.length;
      const percentage = totalReports > 0 ? (count / totalReports) * 100 : 0;
      
      // Calculate average resolution time for this category
      const resolvedReports = reports.filter(r => r.status === 'Resolved');
      let avgResolutionTime = 0;
      
      if (resolvedReports.length > 0) {
        const totalDays = resolvedReports.reduce((sum, report) => {
          const created = new Date(report.created_at);
          const updated = new Date(report.updated_at);
          const diffInDays = (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
          return sum + diffInDays;
        }, 0);
        avgResolutionTime = totalDays / resolvedReports.length;
      }

      categoryStats.push({
        category,
        count,
        percentage: Math.round(percentage),
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10
      });
    });

    // Sort by count descending
    const sortedStats = categoryStats.sort((a, b) => b.count - a.count);

    // If no category data, return sample data for demo purposes
    if (sortedStats.length === 0) {
      return [
        { category: 'Road Issues', count: 85, percentage: 35, avgResolutionTime: 3.2 },
        { category: 'Waste Management', count: 62, percentage: 25, avgResolutionTime: 2.8 },
        { category: 'Water Supply', count: 45, percentage: 18, avgResolutionTime: 4.1 },
        { category: 'Electricity', count: 38, percentage: 15, avgResolutionTime: 2.5 },
        { category: 'Public Safety', count: 17, percentage: 7, avgResolutionTime: 1.9 }
      ];
    }

    return sortedStats;
  } catch (error) {
    console.error('Error fetching category stats:', error);
    
    // Return sample data on error
    return [
      { category: 'Road Issues', count: 85, percentage: 35, avgResolutionTime: 3.2 },
      { category: 'Waste Management', count: 62, percentage: 25, avgResolutionTime: 2.8 },
      { category: 'Water Supply', count: 45, percentage: 18, avgResolutionTime: 4.1 },
      { category: 'Electricity', count: 38, percentage: 15, avgResolutionTime: 2.5 },
      { category: 'Public Safety', count: 17, percentage: 7, avgResolutionTime: 1.9 }
    ];
  }
};

// Get statistics by status
export const getStatusStats = async (): Promise<StatusStats[]> => {
  try {
    let allReports: ReportData[] = [];
    
    // Try to get from Supabase first
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { data, error } = await supabase
        .from('reports')
        .select('*');
      
      if (error) throw error;
      allReports = data as ReportData[];
    } else {
      const storageData = localStorage.getItem('nivaran_reports');
      allReports = JSON.parse(storageData || '[]');
    }

    const statusMap = new Map<string, number>();
    
    // Count reports by status
    allReports.forEach(report => {
      const status = report.status;
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    const totalReports = allReports.length;
    const statusStats: StatusStats[] = [];

    statusMap.forEach((count, status) => {
      const percentage = totalReports > 0 ? (count / totalReports) * 100 : 0;
      statusStats.push({
        status,
        count,
        percentage: Math.round(percentage)
      });
    });

    // Sort by predefined order
    const statusOrder = ['Submitted', 'In Review', 'Forwarded', 'Resolved'];
    return statusStats.sort((a, b) => {
      const aIndex = statusOrder.indexOf(a.status);
      const bIndex = statusOrder.indexOf(b.status);
      return aIndex - bIndex;
    });
  } catch (error) {
    console.error('Error fetching status stats:', error);
    return [];
  }
};

// Get location statistics for heat map
export const getLocationStats = async (): Promise<LocationStats[]> => {
  try {
    let allReports: ReportData[] = [];
    
    // Try to get from Supabase first
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { data, error } = await supabase
        .from('reports')
        .select('*');
      
      if (error) throw error;
      allReports = data as ReportData[];
    } else {
      const storageData = localStorage.getItem('nivaran_reports');
      allReports = JSON.parse(storageData || '[]');
    }

    const locationMap = new Map<string, { count: number; lat: number; lng: number }>();
    
    // Group reports by city and calculate average coordinates
    allReports.forEach(report => {
      if (report.city && report.location) {
        const city = report.city;
        if (!locationMap.has(city)) {
          locationMap.set(city, {
            count: 0,
            lat: 0,
            lng: 0
          });
        }
        
        const current = locationMap.get(city)!;
        const newCount = current.count + 1;
        
        // Calculate running average of coordinates
        locationMap.set(city, {
          count: newCount,
          lat: (current.lat * current.count + report.location.lat) / newCount,
          lng: (current.lng * current.count + report.location.lng) / newCount
        });
      }
    });

    const locationStats: LocationStats[] = [];
    locationMap.forEach((data, city) => {
      locationStats.push({
        city,
        count: data.count,
        lat: data.lat,
        lng: data.lng
      });
    });

    // Sort by count descending
    const sortedStats = locationStats.sort((a, b) => b.count - a.count);

    // If no location data, return sample data for demo purposes
    if (sortedStats.length === 0) {
      return [
        { city: 'Mumbai', count: 45, lat: 19.0760, lng: 72.8777 },
        { city: 'Delhi', count: 38, lat: 28.7041, lng: 77.1025 },
        { city: 'Bangalore', count: 32, lat: 12.9716, lng: 77.5946 },
        { city: 'Chennai', count: 28, lat: 13.0827, lng: 80.2707 },
        { city: 'Pune', count: 24, lat: 18.5204, lng: 73.8567 },
        { city: 'Kolkata', count: 19, lat: 22.5726, lng: 88.3639 }
      ];
    }

    return sortedStats;
  } catch (error) {
    console.error('Error fetching location stats:', error);
    
    // Return sample data on error
    return [
      { city: 'Mumbai', count: 45, lat: 19.0760, lng: 72.8777 },
      { city: 'Delhi', count: 38, lat: 28.7041, lng: 77.1025 },
      { city: 'Bangalore', count: 32, lat: 12.9716, lng: 77.5946 },
      { city: 'Chennai', count: 28, lat: 13.0827, lng: 80.2707 },
      { city: 'Pune', count: 24, lat: 18.5204, lng: 73.8567 },
      { city: 'Kolkata', count: 19, lat: 22.5726, lng: 88.3639 }
    ];
  }
};

// Get trend data for specific time periods
export const getTrendData = async (period: 'day' | 'week' | 'month' = 'week') => {
  try {
    let allReports: ReportData[] = [];
    
    // Try to get from Supabase first
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      allReports = data as ReportData[];
    } else {
      const storageData = localStorage.getItem('nivaran_reports');
      allReports = JSON.parse(storageData || '[]');
      allReports.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    const now = new Date();
    const trends: { date: string; count: number }[] = [];
    
    // Generate date range based on period
    const days = period === 'day' ? 7 : period === 'week' ? 4 : 12;
    const unit = period === 'day' ? 'day' : period === 'week' ? 'week' : 'month';
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      
      if (unit === 'day') {
        date.setDate(date.getDate() - i);
      } else if (unit === 'week') {
        date.setDate(date.getDate() - (i * 7));
      } else {
        date.setMonth(date.getMonth() - i);
      }
      
      const dateStr = unit === 'day' 
        ? date.toISOString().split('T')[0]
        : unit === 'week'
        ? `Week ${Math.ceil(date.getDate() / 7)}`
        : date.toLocaleDateString('en-US', { month: 'short' });
      
      // Count reports for this period
      const count = allReports.filter(report => {
        const reportDate = new Date(report.created_at);
        
        if (unit === 'day') {
          return reportDate.toISOString().split('T')[0] === date.toISOString().split('T')[0];
        } else if (unit === 'week') {
          const weekStart = new Date(date);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          return reportDate >= weekStart && reportDate <= weekEnd;
        } else {
          return reportDate.getMonth() === date.getMonth() && 
                 reportDate.getFullYear() === date.getFullYear();
        }
      }).length;
      
      trends.push({ date: dateStr, count });
    }

    // If no trend data, return sample data for demo purposes
    if (trends.every(trend => trend.count === 0)) {
      return [
        { date: 'Jul', count: 73 },
        { date: 'Aug', count: 58 },
        { date: 'Sep', count: 82 },
        { date: 'Oct', count: 71 }
      ];
    }
    
    return trends;
  } catch (error) {
    console.error('Error fetching trend data:', error);
    
    // Return sample data on error
    return [
      { date: 'Jul', count: 73 },
      { date: 'Aug', count: 58 },
      { date: 'Sep', count: 82 },
      { date: 'Oct', count: 71 }
    ];
  }
};

// Get real-time dashboard data for admin
export const getDashboardData = async () => {
  try {
    const [communityStats, categoryStats, statusStats, locationStats] = await Promise.all([
      getCommunityStats(),
      getCategoryStats(),
      getStatusStats(),
      getLocationStats()
    ]);

    return {
      communityStats,
      categoryStats,
      statusStats,
      locationStats,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};
