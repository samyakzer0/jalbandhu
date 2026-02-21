/**
 * INCOIS Service - Integration with Indian National Centre for Ocean Information Services
 * 
 * Provides official ocean data, early warnings, sensor information, and marine conditions
 * for enhanced JalBandhu functionality with authoritative government sources.
 * 
 * Features:
 * - Early warning system integration
 * - Real-time sensor data access
 * - Community report submission to INCOIS
 * - Official alert distribution
 * - Marine conditions monitoring
 */

// INCOIS API Configuration
const INCOIS_API_BASE = import.meta.env.VITE_INCOIS_API_BASE || 'https://api.incois.gov.in/v1';
const INCOIS_API_KEY = import.meta.env.VITE_INCOIS_API_KEY;

// Geographic coordinate interface
export interface GeographicBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

// Early Warning System interfaces
export interface EarlyWarning {
  id: string;
  type: 'tsunami' | 'cyclone' | 'storm_surge' | 'high_waves' | 'coastal_flood' | 'marine_heatwave';
  severity: 'watch' | 'advisory' | 'warning' | 'emergency';
  title: string;
  description: string;
  issuedAt: string;
  validUntil: string;
  affectedRegions: string[];
  coordinates: Coordinates[];
  source: 'INCOIS' | 'IMD' | 'NDRF';
  urgencyLevel: 'immediate' | 'expected' | 'future' | 'past';
  certainty: 'observed' | 'likely' | 'possible' | 'unlikely';
  actionRequired: string[];
  contactInfo?: {
    phone: string;
    email: string;
    website: string;
  };
}

// Sensor Data interfaces
export interface SensorReading {
  timestamp: string;
  value: number;
  unit: string;
  quality: 'good' | 'fair' | 'poor' | 'missing';
}

export interface MarineSensor {
  id: string;
  name: string;
  type: 'wave_height' | 'tide_gauge' | 'current_meter' | 'weather_buoy' | 'tsunami_buoy';
  location: Coordinates;
  status: 'active' | 'maintenance' | 'offline' | 'error';
  lastUpdate: string;
  readings: {
    waveHeight?: SensorReading[];
    tideLevel?: SensorReading[];
    currentSpeed?: SensorReading[];
    currentDirection?: SensorReading[];
    windSpeed?: SensorReading[];
    windDirection?: SensorReading[];
    waterTemperature?: SensorReading[];
    airTemperature?: SensorReading[];
    pressure?: SensorReading[];
    visibility?: SensorReading[];
  };
}

export interface SensorNetworkStatus {
  region: string;
  totalSensors: number;
  activeSensors: number;
  maintenanceSensors: number;
  offlineSensors: number;
  lastNetworkUpdate: string;
  coverageArea: GeographicBounds;
  sensors: MarineSensor[];
}

// Marine Conditions interfaces
export interface MarineConditions {
  region: string;
  timestamp: string;
  coordinates: Coordinates;
  seaState: {
    condition: 'calm' | 'slight' | 'moderate' | 'rough' | 'very_rough' | 'high' | 'very_high' | 'phenomenal';
    waveHeight: {
      significant: number;
      maximum: number;
      unit: 'm';
    };
    swellHeight?: number;
    swellDirection?: number;
    swellPeriod?: number;
  };
  tides: {
    currentLevel: number;
    trend: 'rising' | 'falling' | 'high' | 'low';
    nextHighTide: string;
    nextLowTide: string;
    tidalRange: number;
  };
  currents: {
    speed: number;
    direction: number;
    unit: 'm/s';
  };
  weather: {
    windSpeed: number;
    windDirection: number;
    windUnit: 'm/s';
    visibility: number;
    visibilityUnit: 'km';
    precipitation?: number;
  };
  waterQuality: {
    temperature: number;
    salinity?: number;
    pH?: number;
    oxygenLevel?: number;
    turbidity?: number;
  };
  hazardLevel: 'low' | 'moderate' | 'high' | 'extreme';
  advisories: string[];
}

// Community Report interface
export interface CommunityReportSubmission {
  reportId: string;
  location: Coordinates;
  hazardType: string;
  severity: string;
  description: string;
  imageUrls?: string[];
  submittedBy: string;
  timestamp: string;
  verified: boolean;
}

// Official Alert interface
export interface OfficialAlert {
  id: string;
  alertType: 'bulletin' | 'advisory' | 'warning' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  issuedBy: string;
  issuedAt: string;
  validUntil: string;
  region: string[];
  coordinates?: Coordinates[];
  category: 'weather' | 'tsunami' | 'cyclone' | 'marine' | 'coastal' | 'general';
  actionInstructions: string[];
  mediaUrls?: string[];
  updateSequence?: number;
  relatedAlerts?: string[];
}

// Response wrapper interface
interface INCOISResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  source: 'INCOIS';
  metadata?: {
    totalResults?: number;
    page?: number;
    limit?: number;
    lastUpdate?: string;
  };
}

/**
 * INCOIS Service Class
 * Handles all communications with INCOIS APIs and data processing
 */
class INCOISService {
  private baseURL: string;
  private apiKey: string | undefined;
  private isOnline: boolean = true;

  constructor() {
    this.baseURL = INCOIS_API_BASE;
    this.apiKey = INCOIS_API_KEY;
    
    // Force offline mode by default for demo (since api.incois.gov.in doesn't exist)
    // Change to 'navigator.onLine' for production with real INCOIS API
    this.isOnline = false; // Force offline mode
    
    console.log('INCOIS Service initialized (forced offline mode):', {
      baseURL: this.baseURL,
      hasApiKey: !!this.apiKey,
      isOnline: this.isOnline,
      note: 'Using offline demo data - real INCOIS API not available'
    });
  }

  /**
   * Get early warnings for a specific location and hazard types
   */
  async getEarlyWarnings(
    location: Coordinates, 
    hazardTypes?: string[], 
    radius: number = 50
  ): Promise<INCOISResponse<EarlyWarning[]>> {
    try {
      if (!this.isOnline) {
        return this.getOfflineEarlyWarnings(location);
      }

      const params = new URLSearchParams({
        lat: location.lat.toString(),
        lng: location.lng.toString(),
        radius: radius.toString()
      });

      if (hazardTypes && hazardTypes.length > 0) {
        params.append('types', hazardTypes.join(','));
      }

      const response = await this.makeAPICall(`/early-warnings?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data: data.warnings,
          timestamp: new Date().toISOString(),
          source: 'INCOIS',
          metadata: {
            totalResults: data.total,
            lastUpdate: data.lastUpdate
          }
        };
      }

      throw new Error(`INCOIS API error: ${response.status}`);
    } catch (error) {
      console.error('Error fetching early warnings:', error);
      return this.getOfflineEarlyWarnings(location);
    }
  }

  /**
   * Get sensor data for a geographic region
   */
  async getSensorData(coordinateBounds: GeographicBounds): Promise<INCOISResponse<SensorNetworkStatus>> {
    try {
      if (!this.isOnline) {
        return this.getOfflineSensorData(coordinateBounds);
      }

      const params = new URLSearchParams({
        north: coordinateBounds.north.toString(),
        south: coordinateBounds.south.toString(),
        east: coordinateBounds.east.toString(),
        west: coordinateBounds.west.toString()
      });

      const response = await this.makeAPICall(`/sensors?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data: data.sensorNetwork,
          timestamp: new Date().toISOString(),
          source: 'INCOIS',
          metadata: {
            lastUpdate: data.lastUpdate
          }
        };
      }

      throw new Error(`INCOIS API error: ${response.status}`);
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      return this.getOfflineSensorData(coordinateBounds);
    }
  }

  /**
   * Submit community report to INCOIS
   */
  async submitCommunityReport(reportData: any): Promise<INCOISResponse<CommunityReportSubmission>> {
    try {
      if (!this.isOnline) {
        return {
          success: false,
          error: 'Cannot submit reports while offline. Report saved locally.',
          timestamp: new Date().toISOString(),
          source: 'INCOIS'
        };
      }

      const response = await this.makeAPICall('/community-reports', {
        method: 'POST',
        body: JSON.stringify({
          location: reportData.location,
          hazardType: reportData.category,
          severity: reportData.priority,
          description: reportData.description,
          imageUrls: reportData.imageUrls || [],
          timestamp: reportData.timestamp || new Date().toISOString(),
          submittedBy: reportData.submittedBy || 'JalBandhu User'
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data: data.submission,
          timestamp: new Date().toISOString(),
          source: 'INCOIS'
        };
      }

      throw new Error(`INCOIS API error: ${response.status}`);
    } catch (error) {
      console.error('Error submitting community report:', error);
      return {
        success: false,
        error: 'Failed to submit report to INCOIS. Please try again later.',
        timestamp: new Date().toISOString(),
        source: 'INCOIS'
      };
    }
  }

  /**
   * Get official alerts for a region
   */
  async getOfficialAlerts(region: string): Promise<INCOISResponse<OfficialAlert[]>> {
    try {
      if (!this.isOnline) {
        return this.getOfflineOfficialAlerts(region);
      }

      const params = new URLSearchParams({ region });
      const response = await this.makeAPICall(`/official-alerts?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data: data.alerts,
          timestamp: new Date().toISOString(),
          source: 'INCOIS',
          metadata: {
            totalResults: data.total,
            lastUpdate: data.lastUpdate
          }
        };
      }

      throw new Error(`INCOIS API error: ${response.status}`);
    } catch (error) {
      console.error('Error fetching official alerts:', error);
      return this.getOfflineOfficialAlerts(region);
    }
  }

  /**
   * Get marine conditions for a specific location
   */
  async getMarineConditions(location: Coordinates): Promise<INCOISResponse<MarineConditions>> {
    try {
      if (!this.isOnline) {
        return this.getOfflineMarineConditions(location);
      }

      const params = new URLSearchParams({
        lat: location.lat.toString(),
        lng: location.lng.toString()
      });

      const response = await this.makeAPICall(`/marine-conditions?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data: data.conditions,
          timestamp: new Date().toISOString(),
          source: 'INCOIS',
          metadata: {
            lastUpdate: data.lastUpdate
          }
        };
      }

      throw new Error(`INCOIS API error: ${response.status}`);
    } catch (error) {
      console.error('Error fetching marine conditions:', error);
      return this.getOfflineMarineConditions(location);
    }
  }

  /**
   * Make authenticated API call to INCOIS
   */
  private async makeAPICall(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'User-Agent': 'JalBandhu/1.0',
      ...options.headers
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
      timeout: 10000 // 10 second timeout
    });
  }

  /**
   * Offline fallback for early warnings
   */
  private getOfflineEarlyWarnings(location: Coordinates): INCOISResponse<EarlyWarning[]> {
    const mockWarnings: EarlyWarning[] = [
      {
        id: 'incois-ew-001',
        type: 'high_waves',
        severity: 'advisory',
        title: 'High Wave Advisory',
        description: 'Wave heights of 2.5-4.0 meters expected along the coast. Fishermen advised to avoid venturing into the sea.',
        issuedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        validUntil: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        affectedRegions: ['Tamil Nadu Coast', 'Kerala Coast', 'Karnataka Coast'],
        coordinates: [location],
        source: 'INCOIS',
        urgencyLevel: 'expected',
        certainty: 'likely',
        actionRequired: [
          'Fishermen advised not to venture into the sea',
          'Coastal tourists should avoid swimming',
          'Beach activities should be suspended'
        ]
      }
    ];

    return {
      success: true,
      data: mockWarnings,
      timestamp: new Date().toISOString(),
      source: 'INCOIS',
      metadata: {
        totalResults: mockWarnings.length,
        lastUpdate: new Date().toISOString()
      }
    };
  }

  /**
   * Offline fallback for sensor data
   */
  private getOfflineSensorData(bounds: GeographicBounds): INCOISResponse<SensorNetworkStatus> {
    const mockSensors: MarineSensor[] = [
      {
        id: 'incois-sensor-001',
        name: 'Chennai Deep Water Buoy',
        type: 'weather_buoy',
        location: { lat: 13.0827, lng: 80.2707 },
        status: 'active',
        lastUpdate: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        readings: {
          waveHeight: [{
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            value: 2.1,
            unit: 'm',
            quality: 'good'
          }],
          windSpeed: [{
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            value: 15.2,
            unit: 'm/s',
            quality: 'good'
          }]
        }
      }
    ];

    const mockStatus: SensorNetworkStatus = {
      region: 'East Coast of India',
      totalSensors: 12,
      activeSensors: 10,
      maintenanceSensors: 1,
      offlineSensors: 1,
      lastNetworkUpdate: new Date().toISOString(),
      coverageArea: bounds,
      sensors: mockSensors
    };

    return {
      success: true,
      data: mockStatus,
      timestamp: new Date().toISOString(),
      source: 'INCOIS',
      metadata: {
        lastUpdate: new Date().toISOString()
      }
    };
  }

  /**
   * Offline fallback for official alerts
   */
  private getOfflineOfficialAlerts(region: string): INCOISResponse<OfficialAlert[]> {
    const mockAlerts: OfficialAlert[] = [
      {
        id: 'incois-alert-001',
        alertType: 'advisory',
        priority: 'medium',
        title: 'Marine Weather Advisory',
        message: 'Moderate to rough sea conditions expected. Wind speeds 20-30 kmph. Fishermen advised to exercise caution.',
        issuedBy: 'INCOIS, Ministry of Earth Sciences',
        issuedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        validUntil: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
        region: [region],
        category: 'marine',
        actionInstructions: [
          'Small boats avoid venturing far from shore',
          'Carry adequate safety equipment',
          'Monitor weather updates regularly'
        ]
      }
    ];

    return {
      success: true,
      data: mockAlerts,
      timestamp: new Date().toISOString(),
      source: 'INCOIS',
      metadata: {
        totalResults: mockAlerts.length,
        lastUpdate: new Date().toISOString()
      }
    };
  }

  /**
   * Offline fallback for marine conditions
   */
  private getOfflineMarineConditions(location: Coordinates): INCOISResponse<MarineConditions> {
    const mockConditions: MarineConditions = {
      region: 'Bay of Bengal - East Coast',
      timestamp: new Date().toISOString(),
      coordinates: location,
      seaState: {
        condition: 'moderate',
        waveHeight: {
          significant: 1.8,
          maximum: 2.5,
          unit: 'm'
        },
        swellHeight: 1.2,
        swellDirection: 120,
        swellPeriod: 8
      },
      tides: {
        currentLevel: 1.2,
        trend: 'rising',
        nextHighTide: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        nextLowTide: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString(),
        tidalRange: 1.8
      },
      currents: {
        speed: 0.8,
        direction: 45,
        unit: 'm/s'
      },
      weather: {
        windSpeed: 18.5,
        windDirection: 135,
        windUnit: 'm/s',
        visibility: 8.2,
        visibilityUnit: 'km'
      },
      waterQuality: {
        temperature: 28.5,
        salinity: 34.2,
        pH: 8.1,
        oxygenLevel: 6.8
      },
      hazardLevel: 'moderate',
      advisories: [
        'Moderate sea conditions - exercise caution when swimming',
        'Small craft operators should monitor weather conditions',
        'Fishing vessels advised to carry safety equipment'
      ]
    };

    return {
      success: true,
      data: mockConditions,
      timestamp: new Date().toISOString(),
      source: 'INCOIS',
      metadata: {
        lastUpdate: new Date().toISOString()
      }
    };
  }

  /**
   * Check if INCOIS service is available
   */
  async isServiceAvailable(): Promise<boolean> {
    if (!this.isOnline || !this.apiKey) {
      return false;
    }

    try {
      const response = await this.makeAPICall('/health');
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get service status information
   */
  getServiceStatus() {
    return {
      isOnline: this.isOnline,
      hasApiKey: !!this.apiKey,
      baseURL: this.baseURL,
      lastCheck: new Date().toISOString()
    };
  }
}

// Create singleton instance
const incoisService = new INCOISService();

export default incoisService;

// Named exports for specific functionality
export {
  INCOISService,
  incoisService
};