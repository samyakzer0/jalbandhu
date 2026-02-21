/**
 * Geospatial Utilities for Nivaran Report Grouping
 * 
 * Provides GPS coordinate distance calculations, proximity filtering,
 * and location-based grouping functions for spatial duplicate detection.
 * Uses the Haversine formula for accurate distance calculations on Earth's surface.
 */

/**
 * Interface for GPS coordinates
 */
export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

/**
 * Interface for location-based proximity results
 */
export interface ProximityResult {
  distance: number; // Distance in meters
  isWithinRadius: boolean; // Whether within specified radius
  bearing: number; // Compass bearing from point A to point B (0-360 degrees)
  accuracy: 'high' | 'medium' | 'low'; // Accuracy assessment based on coordinate precision
}

/**
 * Interface for geospatial clustering results
 */
export interface GeoCluster {
  centroid: GeoCoordinate; // Center point of the cluster
  radius: number; // Effective radius of the cluster in meters
  points: Array<{
    coordinate: GeoCoordinate;
    index: number;
    distanceFromCentroid: number;
  }>;
  density: number; // Points per square kilometer
}

/**
 * Constants for geospatial calculations
 */
const EARTH_RADIUS_KM = 6371; // Earth's radius in kilometers
const EARTH_RADIUS_M = EARTH_RADIUS_KM * 1000; // Earth's radius in meters
const DEFAULT_PROXIMITY_RADIUS = 100; // Default proximity radius in meters
const HIGH_PRECISION_THRESHOLD = 0.00001; // ~1 meter precision
const MEDIUM_PRECISION_THRESHOLD = 0.0001; // ~10 meter precision

/**
 * Geospatial utility functions
 */
export class GeospatialUtils {
  private static instance: GeospatialUtils;

  /**
   * Singleton pattern for service instance
   */
  static getInstance(): GeospatialUtils {
    if (!this.instance) {
      this.instance = new GeospatialUtils();
    }
    return this.instance;
  }

  /**
   * Convert degrees to radians
   */
  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convert radians to degrees
   */
  private radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }

  /**
   * Validate GPS coordinates
   */
  public isValidCoordinate(coord: GeoCoordinate): boolean {
    return (
      coord &&
      typeof coord.latitude === 'number' &&
      typeof coord.longitude === 'number' &&
      coord.latitude >= -90 &&
      coord.latitude <= 90 &&
      coord.longitude >= -180 &&
      coord.longitude <= 180 &&
      !isNaN(coord.latitude) &&
      !isNaN(coord.longitude)
    );
  }

  /**
   * Calculate distance between two GPS coordinates using Haversine formula
   * Returns distance in meters
   */
  public calculateDistance(coord1: GeoCoordinate, coord2: GeoCoordinate): number {
    if (!this.isValidCoordinate(coord1) || !this.isValidCoordinate(coord2)) {
      throw new Error('Invalid GPS coordinates provided');
    }

    // Handle identical coordinates
    if (coord1.latitude === coord2.latitude && coord1.longitude === coord2.longitude) {
      return 0;
    }

    const lat1Rad = this.degreesToRadians(coord1.latitude);
    const lat2Rad = this.degreesToRadians(coord2.latitude);
    const deltaLatRad = this.degreesToRadians(coord2.latitude - coord1.latitude);
    const deltaLonRad = this.degreesToRadians(coord2.longitude - coord1.longitude);

    const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return EARTH_RADIUS_M * c;
  }

  /**
   * Calculate bearing (compass direction) from coord1 to coord2
   * Returns bearing in degrees (0-360)
   */
  public calculateBearing(coord1: GeoCoordinate, coord2: GeoCoordinate): number {
    if (!this.isValidCoordinate(coord1) || !this.isValidCoordinate(coord2)) {
      throw new Error('Invalid GPS coordinates provided');
    }

    const lat1Rad = this.degreesToRadians(coord1.latitude);
    const lat2Rad = this.degreesToRadians(coord2.latitude);
    const deltaLonRad = this.degreesToRadians(coord2.longitude - coord1.longitude);

    const y = Math.sin(deltaLonRad) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLonRad);

    const bearingRad = Math.atan2(y, x);
    const bearingDeg = this.radiansToDegrees(bearingRad);

    // Normalize to 0-360 degrees
    return (bearingDeg + 360) % 360;
  }

  /**
   * Assess coordinate precision for accuracy rating
   */
  public assessCoordinateAccuracy(coord: GeoCoordinate): 'high' | 'medium' | 'low' {
    const latPrecision = Math.abs(coord.latitude % 1);
    const lonPrecision = Math.abs(coord.longitude % 1);
    const maxPrecision = Math.max(latPrecision, lonPrecision);

    if (maxPrecision >= HIGH_PRECISION_THRESHOLD) {
      return 'high';
    } else if (maxPrecision >= MEDIUM_PRECISION_THRESHOLD) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Check if two coordinates are within a specified radius
   */
  public isWithinRadius(
    coord1: GeoCoordinate, 
    coord2: GeoCoordinate, 
    radiusMeters: number = DEFAULT_PROXIMITY_RADIUS
  ): ProximityResult {
    const distance = this.calculateDistance(coord1, coord2);
    const bearing = this.calculateBearing(coord1, coord2);
    
    // Get accuracy ratings and determine the lower (worse) accuracy
    const accuracy1 = this.assessCoordinateAccuracy(coord1);
    const accuracy2 = this.assessCoordinateAccuracy(coord2);
    
    let accuracy: 'high' | 'medium' | 'low' = 'high';
    if (accuracy1 === 'low' || accuracy2 === 'low') {
      accuracy = 'low';
    } else if (accuracy1 === 'medium' || accuracy2 === 'medium') {
      accuracy = 'medium';
    }

    return {
      distance,
      isWithinRadius: distance <= radiusMeters,
      bearing,
      accuracy
    };
  }

  /**
   * Find all coordinates within a specified radius of a center point
   */
  public findNearbyCoordinates(
    center: GeoCoordinate,
    candidates: GeoCoordinate[],
    radiusMeters: number = DEFAULT_PROXIMITY_RADIUS
  ): Array<{
    coordinate: GeoCoordinate;
    index: number;
    proximityResult: ProximityResult;
  }> {
    const nearby: Array<{
      coordinate: GeoCoordinate;
      index: number;
      proximityResult: ProximityResult;
    }> = [];

    for (let i = 0; i < candidates.length; i++) {
      const coord = candidates[i];
      if (!this.isValidCoordinate(coord)) {
        continue;
      }

      const proximityResult = this.isWithinRadius(center, coord, radiusMeters);
      
      if (proximityResult.isWithinRadius) {
        nearby.push({
          coordinate: coord,
          index: i,
          proximityResult
        });
      }
    }

    // Sort by distance (closest first)
    return nearby.sort((a, b) => a.proximityResult.distance - b.proximityResult.distance);
  }

  /**
   * Calculate the centroid (average center) of a group of coordinates
   */
  public calculateCentroid(coordinates: GeoCoordinate[]): GeoCoordinate | null {
    if (!coordinates || coordinates.length === 0) {
      return null;
    }

    const validCoords = coordinates.filter(coord => this.isValidCoordinate(coord));
    
    if (validCoords.length === 0) {
      return null;
    }

    if (validCoords.length === 1) {
      return { ...validCoords[0] };
    }

    // Convert to Cartesian coordinates for accurate averaging
    let x = 0, y = 0, z = 0;

    for (const coord of validCoords) {
      const latRad = this.degreesToRadians(coord.latitude);
      const lonRad = this.degreesToRadians(coord.longitude);

      x += Math.cos(latRad) * Math.cos(lonRad);
      y += Math.cos(latRad) * Math.sin(lonRad);
      z += Math.sin(latRad);
    }

    // Average the coordinates
    x /= validCoords.length;
    y /= validCoords.length;
    z /= validCoords.length;

    // Convert back to lat/lon
    const lonRad = Math.atan2(y, x);
    const hyp = Math.sqrt(x * x + y * y);
    const latRad = Math.atan2(z, hyp);

    return {
      latitude: this.radiansToDegrees(latRad),
      longitude: this.radiansToDegrees(lonRad)
    };
  }

  /**
   * Create spatial clusters from a set of coordinates
   */
  public createSpatialClusters(
    coordinates: GeoCoordinate[],
    maxClusterRadius: number = DEFAULT_PROXIMITY_RADIUS
  ): GeoCluster[] {
    const validCoords = coordinates
      .map((coord, index) => ({ coord, index }))
      .filter(item => this.isValidCoordinate(item.coord));

    if (validCoords.length === 0) {
      return [];
    }

    const clusters: GeoCluster[] = [];
    const processed = new Set<number>();

    for (let i = 0; i < validCoords.length; i++) {
      if (processed.has(i)) {
        continue;
      }

      const centerCoord = validCoords[i];
      const clusterPoints: Array<{
        coordinate: GeoCoordinate;
        index: number;
        distanceFromCentroid: number;
      }> = [];

      // Find all points within cluster radius
      for (let j = 0; j < validCoords.length; j++) {
        if (processed.has(j)) {
          continue;
        }

        const candidateCoord = validCoords[j];
        const distance = this.calculateDistance(centerCoord.coord, candidateCoord.coord);

        if (distance <= maxClusterRadius) {
          clusterPoints.push({
            coordinate: candidateCoord.coord,
            index: candidateCoord.index,
            distanceFromCentroid: distance
          });
          processed.add(j);
        }
      }

      if (clusterPoints.length > 0) {
        // Calculate actual centroid
        const centroid = this.calculateCentroid(
          clusterPoints.map(p => p.coordinate)
        );

        if (centroid) {
          // Recalculate distances from actual centroid
          for (const point of clusterPoints) {
            point.distanceFromCentroid = this.calculateDistance(centroid, point.coordinate);
          }

          // Calculate effective radius and density
          const maxDistance = Math.max(...clusterPoints.map(p => p.distanceFromCentroid));
          const area = Math.PI * (maxDistance / 1000) * (maxDistance / 1000); // Area in km²
          const density = area > 0 ? clusterPoints.length / area : clusterPoints.length;

          clusters.push({
            centroid,
            radius: maxDistance,
            points: clusterPoints.sort((a, b) => a.distanceFromCentroid - b.distanceFromCentroid),
            density
          });
        }
      }
    }

    // Sort clusters by point count (largest first)
    return clusters.sort((a, b) => b.points.length - a.points.length);
  }

  /**
   * Get bounding box for a set of coordinates
   */
  public getBoundingBox(coordinates: GeoCoordinate[]): {
    north: number;
    south: number;
    east: number;
    west: number;
    center: GeoCoordinate;
    span: { latSpan: number; lonSpan: number };
  } | null {
    const validCoords = coordinates.filter(coord => this.isValidCoordinate(coord));
    
    if (validCoords.length === 0) {
      return null;
    }

    const latitudes = validCoords.map(c => c.latitude);
    const longitudes = validCoords.map(c => c.longitude);

    const north = Math.max(...latitudes);
    const south = Math.min(...latitudes);
    const east = Math.max(...longitudes);
    const west = Math.min(...longitudes);

    const center: GeoCoordinate = {
      latitude: (north + south) / 2,
      longitude: (east + west) / 2
    };

    const span = {
      latSpan: north - south,
      lonSpan: east - west
    };

    return { north, south, east, west, center, span };
  }

  /**
   * Estimate walking time between two coordinates
   * Assumes average walking speed of 5 km/h
   */
  public estimateWalkingTime(coord1: GeoCoordinate, coord2: GeoCoordinate): {
    minutes: number;
    readableTime: string;
  } {
    const distance = this.calculateDistance(coord1, coord2);
    const distanceKm = distance / 1000;
    const walkingSpeedKmh = 5; // Average walking speed
    const hours = distanceKm / walkingSpeedKmh;
    const minutes = Math.round(hours * 60);

    let readableTime: string;
    if (minutes < 1) {
      readableTime = 'Less than 1 minute';
    } else if (minutes === 1) {
      readableTime = '1 minute';
    } else if (minutes < 60) {
      readableTime = `${minutes} minutes`;
    } else {
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      readableTime = hrs === 1 
        ? `1 hour${mins > 0 ? ` ${mins} minutes` : ''}`
        : `${hrs} hours${mins > 0 ? ` ${mins} minutes` : ''}`;
    }

    return { minutes, readableTime };
  }

  /**
   * Check if a coordinate is within a bounding box
   */
  public isWithinBoundingBox(
    coordinate: GeoCoordinate,
    boundingBox: { north: number; south: number; east: number; west: number }
  ): boolean {
    return (
      coordinate.latitude >= boundingBox.south &&
      coordinate.latitude <= boundingBox.north &&
      coordinate.longitude >= boundingBox.west &&
      coordinate.longitude <= boundingBox.east
    );
  }

  /**
   * Create a bounding box around a center point with a given radius
   */
  public createBoundingBoxFromRadius(
    center: GeoCoordinate,
    radiusMeters: number
  ): { north: number; south: number; east: number; west: number } {
    // Approximate conversion (works well for small distances)
    const latDelta = (radiusMeters / EARTH_RADIUS_M) * (180 / Math.PI);
    const lonDelta = latDelta / Math.cos(this.degreesToRadians(center.latitude));

    return {
      north: center.latitude + latDelta,
      south: center.latitude - latDelta,
      east: center.longitude + lonDelta,
      west: center.longitude - lonDelta
    };
  }
}

/**
 * Export singleton instance
 */
export const geospatialUtils = GeospatialUtils.getInstance();

/**
 * Utility function for quick distance check
 */
export function quickDistanceCheck(
  coord1: GeoCoordinate,
  coord2: GeoCoordinate,
  maxDistanceMeters: number = DEFAULT_PROXIMITY_RADIUS
): boolean {
  try {
    const distance = geospatialUtils.calculateDistance(coord1, coord2);
    return distance <= maxDistanceMeters;
  } catch {
    return false;
  }
}

/**
 * Utility function for finding the closest coordinate from a list
 */
export function findClosestCoordinate(
  target: GeoCoordinate,
  candidates: GeoCoordinate[]
): { coordinate: GeoCoordinate; distance: number; index: number } | null {
  let closest: { coordinate: GeoCoordinate; distance: number; index: number } | null = null;
  let shortestDistance = Infinity;

  for (let i = 0; i < candidates.length; i++) {
    try {
      const distance = geospatialUtils.calculateDistance(target, candidates[i]);
      
      if (distance < shortestDistance) {
        shortestDistance = distance;
        closest = {
          coordinate: candidates[i],
          distance,
          index: i
        };
      }
    } catch {
      // Skip invalid coordinates
      continue;
    }
  }

  return closest;
}

/**
 * Utility function for grouping coordinates by proximity
 */
export function groupByProximity(
  coordinates: GeoCoordinate[],
  radiusMeters: number = DEFAULT_PROXIMITY_RADIUS
): GeoCluster[] {
  return geospatialUtils.createSpatialClusters(coordinates, radiusMeters);
}