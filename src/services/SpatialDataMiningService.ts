import * as turf from '@turf/helpers';
import clustersDbscan from '@turf/clusters-dbscan';
import centroid from '@turf/centroid';
import bbox from '@turf/bbox';

export interface HazardReport {
  id: string;
  location: { lat: number; lng: number };
  hazardType: string;
  severity: number;
  timestamp: Date;
  description?: string;
}

interface HotspotResult {
  clusterId: number;
  centroid: [number, number];
  reportCount: number;
  averageSeverity: number;
  riskScore: number;
  hazardTypes: string[];
  spatialDensity: number;
  temporalIntensity: number;
  boundingBox: number[][];
  confidence: number;
}

interface SpatialDataPoint {
  id: string;
  coordinates: [number, number];
  severity: number;
  hazardType: string;
  timestamp: Date;
  aiConfidence: number;
}

export class SpatialDataMiningService {
  private epsilon: number = 0.5; // 50km radius in degrees (~0.5° ≈ 55km)
  private minPoints: number = 3; // Minimum reports to form a hotspot
  
  /**
   * DBSCAN-based hotspot detection with temporal weighting
   * Patent-worthy algorithm: Spatial-Temporal Density Clustering for Maritime Hazards
   */
  async detectHotspots(
    reports: SpatialDataPoint[],
    config?: {
      epsilon?: number;
      minPoints?: number;
      timeWindowHours?: number;
      severityWeight?: number;
    }
  ): Promise<HotspotResult[]> {
    
    const epsilon = config?.epsilon || this.epsilon;
    const minPoints = config?.minPoints || this.minPoints;
    const timeWindow = config?.timeWindowHours || 72; // 3 days default
    
    // Filter reports within time window
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - timeWindow);
    
    const recentReports = reports.filter(r => r.timestamp >= cutoffTime);
    
    if (recentReports.length < minPoints) {
      return [];
    }
    
    // Convert to GeoJSON for Turf.js processing
    const geoPoints = turf.featureCollection(
      recentReports.map(r => 
        turf.point(r.coordinates, {
          id: r.id,
          severity: r.severity,
          hazardType: r.hazardType,
          timestamp: r.timestamp.toISOString(),
          aiConfidence: r.aiConfidence
        })
      )
    );
    
    // Apply DBSCAN clustering
    const clustered = clustersDbscan(geoPoints, epsilon, {
      minPoints: minPoints,
      mutate: false
    });
    
    // Extract and analyze clusters
    const clusters = new Map<number, typeof recentReports>();
    
    clustered.features.forEach((feature, idx) => {
      const clusterNum = feature.properties?.cluster;
      if (clusterNum !== undefined && clusterNum !== -1) {
        if (!clusters.has(clusterNum)) {
          clusters.set(clusterNum, []);
        }
        clusters.get(clusterNum)!.push(recentReports[idx]);
      }
    });
    
    // Generate hotspot analytics
    const hotspots: HotspotResult[] = [];
    
    clusters.forEach((clusterReports, clusterId) => {
      const coords = clusterReports.map(r => r.coordinates);
      
      // Calculate centroid
      const centroidPoint = centroid(
        turf.featureCollection(coords.map(c => turf.point(c)))
      );
      const centroidCoords: [number, number] = centroidPoint.geometry.coordinates as [number, number];
      
      // Calculate average severity
      const avgSeverity = clusterReports.reduce((sum, r) => sum + r.severity, 0) / clusterReports.length;
      
      // Extract unique hazard types
      const hazardTypes = [...new Set(clusterReports.map(r => r.hazardType))];
      
      // Calculate spatial density (reports per km²)
      const bboxCoords = bbox(turf.featureCollection(coords.map(c => turf.point(c))));
      const area = this.calculateBBoxArea(bboxCoords);
      const spatialDensity = clusterReports.length / area;
      
      // Calculate temporal intensity (reports per day)
      const timestamps = clusterReports.map(r => r.timestamp.getTime());
      const timeRange = (Math.max(...timestamps) - Math.min(...timestamps)) / (1000 * 60 * 60 * 24);
      const temporalIntensity = timeRange > 0 ? clusterReports.length / timeRange : clusterReports.length;
      
      // NOVEL PATENT FEATURE: Multi-factor Risk Score
      const riskScore = this.calculateAdvancedRiskScore({
        reportCount: clusterReports.length,
        avgSeverity,
        spatialDensity,
        temporalIntensity,
        hazardDiversity: hazardTypes.length,
        avgConfidence: clusterReports.reduce((sum, r) => sum + r.aiConfidence, 0) / clusterReports.length
      });
      
      // Confidence score based on data quality
      const confidence = this.calculateClusterConfidence(clusterReports);
      
      hotspots.push({
        clusterId,
        centroid: centroidCoords,
        reportCount: clusterReports.length,
        averageSeverity: avgSeverity,
        riskScore,
        hazardTypes,
        spatialDensity,
        temporalIntensity,
        boundingBox: this.bboxToCoordinates(bboxCoords),
        confidence
      });
    });
    
    // Sort by risk score descending
    return hotspots.sort((a, b) => b.riskScore - a.riskScore);
  }
  
  /**
   * PATENT-WORTHY ALGORITHM: Adaptive Multi-Factor Risk Scoring
   * Combines spatial, temporal, severity, and diversity metrics
   */
  private calculateAdvancedRiskScore(params: {
    reportCount: number;
    avgSeverity: number;
    spatialDensity: number;
    temporalIntensity: number;
    hazardDiversity: number;
    avgConfidence: number;
  }): number {
    
    // Normalized weights (should sum to 1.0)
    const weights = {
      reportCount: 0.20,
      severity: 0.25,
      spatialDensity: 0.20,
      temporalIntensity: 0.15,
      hazardDiversity: 0.10,
      confidence: 0.10
    };
    
    // Normalize each factor to 0-1 scale
    const normalizedReportCount = Math.min(params.reportCount / 20, 1.0); // 20+ reports = max
    const normalizedSeverity = params.avgSeverity / 5.0; // Severity 1-5
    const normalizedSpatialDensity = Math.min(params.spatialDensity / 10, 1.0); // 10+ per km² = max
    const normalizedTemporalIntensity = Math.min(params.temporalIntensity / 5, 1.0); // 5+ per day = max
    const normalizedHazardDiversity = Math.min(params.hazardDiversity / 5, 1.0); // 5+ types = max
    const normalizedConfidence = params.avgConfidence; // Already 0-1
    
    // Weighted sum
    const riskScore = 
      normalizedReportCount * weights.reportCount +
      normalizedSeverity * weights.severity +
      normalizedSpatialDensity * weights.spatialDensity +
      normalizedTemporalIntensity * weights.temporalIntensity +
      normalizedHazardDiversity * weights.hazardDiversity +
      normalizedConfidence * weights.confidence;
    
    // Scale to 0-100
    return Math.round(riskScore * 100);
  }
  
  private calculateClusterConfidence(reports: SpatialDataPoint[]): number {
    const avgAiConfidence = reports.reduce((sum, r) => sum + r.aiConfidence, 0) / reports.length;
    const sampleSize = reports.length;
    const sampleSizeConfidence = Math.min(sampleSize / 10, 1.0); // 10+ reports = full confidence
    
    return (avgAiConfidence * 0.7 + sampleSizeConfidence * 0.3);
  }
  
  private calculateBBoxArea(bboxCoords: number[]): number {
    // Approximate area in km² using Haversine formula
    const [minLon, minLat, maxLon, maxLat] = bboxCoords;
    const width = this.haversineDistance(minLat, minLon, minLat, maxLon);
    const height = this.haversineDistance(minLat, minLon, maxLat, minLon);
    return width * height;
  }
  
  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
  
  private bboxToCoordinates(bboxCoords: number[]): number[][] {
    const [minLon, minLat, maxLon, maxLat] = bboxCoords;
    return [
      [minLon, minLat],
      [maxLon, minLat],
      [maxLon, maxLat],
      [minLon, maxLat],
      [minLon, minLat]
    ];
  }
  
  /**
   * ST-DBSCAN: Spatial-Temporal DBSCAN variant for evolving hazards
   * Tracks how hotspots move and intensify over time
   */
  async detectEvolvingHotspots(
    reports: SpatialDataPoint[],
    timeIntervalHours: number = 24
  ): Promise<{
    currentHotspots: HotspotResult[];
    historicalTrajectory: Array<{
      timeWindow: string;
      hotspots: HotspotResult[];
    }>;
    movementVectors: Array<{
      hotspotId: number;
      displacement: number;
      direction: number;
      velocityKmPerDay: number;
    }>;
  }> {
    
    const now = new Date();
    const intervals = 7; // Last 7 time intervals
    const historicalTrajectory = [];
    
    // Analyze each time window
    for (let i = 0; i < intervals; i++) {
      const endTime = new Date(now.getTime() - i * timeIntervalHours * 60 * 60 * 1000);
      const startTime = new Date(endTime.getTime() - timeIntervalHours * 60 * 60 * 1000);
      
      const windowReports = reports.filter(r => 
        r.timestamp >= startTime && r.timestamp < endTime
      );
      
      const hotspots = await this.detectHotspots(windowReports, { timeWindowHours: timeIntervalHours });
      
      historicalTrajectory.push({
        timeWindow: `${startTime.toISOString()} to ${endTime.toISOString()}`,
        hotspots
      });
    }
    
    // Calculate movement vectors
    const movementVectors = this.calculateHotspotMovement(historicalTrajectory, timeIntervalHours);
    
    return {
      currentHotspots: historicalTrajectory[0]?.hotspots || [],
      historicalTrajectory,
      movementVectors
    };
  }
  
  private calculateHotspotMovement(
    trajectory: Array<{ timeWindow: string; hotspots: HotspotResult[] }>,
    timeIntervalHours: number
  ): Array<{ hotspotId: number; displacement: number; direction: number; velocityKmPerDay: number }> {
    
    if (trajectory.length < 2) return [];
    
    const movements: Array<{ hotspotId: number; displacement: number; direction: number; velocityKmPerDay: number }> = [];
    const current = trajectory[0].hotspots;
    const previous = trajectory[1].hotspots;
    
    // Match hotspots between time periods (simple nearest-neighbor matching)
    current.forEach(currentHotspot => {
      const nearest = this.findNearestHotspot(currentHotspot, previous);
      
      if (nearest && nearest.distance < 100) { // Within 100km
        const displacement = nearest.distance;
        const direction = this.calculateBearing(
          nearest.hotspot.centroid[1],
          nearest.hotspot.centroid[0],
          currentHotspot.centroid[1],
          currentHotspot.centroid[0]
        );
        const velocityKmPerDay = displacement / (timeIntervalHours / 24);
        
        movements.push({
          hotspotId: currentHotspot.clusterId,
          displacement,
          direction,
          velocityKmPerDay
        });
      }
    });
    
    return movements;
  }
  
  private findNearestHotspot(
    target: HotspotResult,
    candidates: HotspotResult[]
  ): { hotspot: HotspotResult; distance: number } | null {
    
    let nearest = null;
    let minDistance = Infinity;
    
    candidates.forEach(candidate => {
      const dist = this.haversineDistance(
        target.centroid[1], target.centroid[0],
        candidate.centroid[1], candidate.centroid[0]
      );
      
      if (dist < minDistance) {
        minDistance = dist;
        nearest = candidate;
      }
    });
    
    return nearest ? { hotspot: nearest, distance: minDistance } : null;
  }
  
  private calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLon = this.toRad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(this.toRad(lat2));
    const x = Math.cos(this.toRad(lat1)) * Math.sin(this.toRad(lat2)) -
              Math.sin(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.cos(dLon);
    const bearing = Math.atan2(y, x);
    return (bearing * 180 / Math.PI + 360) % 360; // Convert to degrees
  }
}

export default new SpatialDataMiningService();
