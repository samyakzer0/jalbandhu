/**
 * Report Grouping Service for Nivaran
 * 
 * Orchestrates duplicate detection by combining text similarity, geospatial proximity,
 * and category matching with confidence scoring and group management. This service
 * provides the main API for detecting and managing duplicate/related reports.
 */

import { textSimilarityService, TextSimilarityResult } from './TextSimilarityService';
import { geospatialUtils, GeoCoordinate, ProximityResult } from './GeospatialUtils';

/**
 * Interface for report data used in grouping analysis
 */
export interface ReportData {
  id: string;
  title: string;
  description: string;
  category: string;
  location?: GeoCoordinate;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Interface for grouping analysis results
 */
export interface GroupingAnalysis {
  reportId: string;
  similarReports: Array<{
    reportId: string;
    overallScore: number;
    confidence: number;
    reasons: {
      textSimilarity?: TextSimilarityResult;
      proximityResult?: ProximityResult;
      categoryMatch: boolean;
      statusConsistency: boolean;
      priorityAlignment: boolean;
      temporalProximity: number; // Days between reports
    };
    recommendation: 'group' | 'review' | 'separate';
  }>;
  suggestedGroupId?: string;
  analysisMetadata: {
    timestamp: Date;
    analysisVersion: string;
    processingTimeMs: number;
  };
}

/**
 * Interface for report group data
 */
export interface ReportGroup {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'duplicate';
  location?: GeoCoordinate;
  reportCount: number;
  reportIds: string[];
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    primaryReportId: string; // The main/original report
    groupingReasons: string[];
    averageConfidence: number;
    spatialRadius?: number;
    textSimilarityRange: { min: number; max: number };
  };
}

/**
 * Configuration for grouping analysis
 */
export interface GroupingConfig {
  textSimilarityThreshold: number; // 0.7 default
  proximityRadiusMeters: number; // 100 default
  categoryMatchWeight: number; // 0.3 default
  textSimilarityWeight: number; // 0.4 default
  proximityWeight: number; // 0.3 default
  minConfidenceThreshold: number; // 0.6 default
  maxGroupSize: number; // 10 default
  temporalWindowDays: number; // 30 default - only group reports within this timeframe
  enableAutoGrouping: boolean; // true default
  requireHumanReview: boolean; // false default for high-confidence matches
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: GroupingConfig = {
  textSimilarityThreshold: 0.7,
  proximityRadiusMeters: 100,
  categoryMatchWeight: 0.3,
  textSimilarityWeight: 0.4,
  proximityWeight: 0.3,
  minConfidenceThreshold: 0.6,
  maxGroupSize: 10,
  temporalWindowDays: 30,
  enableAutoGrouping: true,
  requireHumanReview: false
};

/**
 * Main Report Grouping Service
 */
export class ReportGroupingService {
  private static instance: ReportGroupingService;
  private config: GroupingConfig;
  private analysisVersion = '1.0.0';

  private constructor(config: Partial<GroupingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Singleton pattern with configuration
   */
  static getInstance(config: Partial<GroupingConfig> = {}): ReportGroupingService {
    if (!this.instance) {
      this.instance = new ReportGroupingService(config);
    }
    return this.instance;
  }

  /**
   * Update service configuration
   */
  public updateConfig(newConfig: Partial<GroupingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  public getConfig(): GroupingConfig {
    return { ...this.config };
  }

  /**
   * Analyze a report for potential grouping with existing reports
   */
  public async analyzeReportForGrouping(
    targetReport: ReportData,
    candidateReports: ReportData[]
  ): Promise<GroupingAnalysis> {
    const startTime = Date.now();
    
    try {
      // Filter candidates by temporal window
      const recentCandidates = this.filterByTemporalWindow(targetReport, candidateReports);
      
      // Filter candidates by category if strict matching is enabled
      const categoryCandidates = this.filterByCategory(targetReport, recentCandidates);
      
      // Analyze each candidate
      const similarReports = await Promise.all(
        categoryCandidates.map(candidate => this.analyzeReportPair(targetReport, candidate))
      );

      // Filter by confidence threshold and sort by score
      const qualifyingReports = similarReports
        .filter(result => result.overallScore >= this.config.minConfidenceThreshold)
        .sort((a, b) => b.overallScore - a.overallScore);

      // Suggest group ID if high-confidence matches exist
      const suggestedGroupId = this.suggestGroupId(qualifyingReports);

      const processingTime = Date.now() - startTime;

      return {
        reportId: targetReport.id,
        similarReports: qualifyingReports,
        suggestedGroupId,
        analysisMetadata: {
          timestamp: new Date(),
          analysisVersion: this.analysisVersion,
          processingTimeMs: processingTime
        }
      };

    } catch (error) {
      console.error('Error in report grouping analysis:', error);
      
      return {
        reportId: targetReport.id,
        similarReports: [],
        analysisMetadata: {
          timestamp: new Date(),
          analysisVersion: this.analysisVersion,
          processingTimeMs: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Analyze similarity between two reports
   */
  private async analyzeReportPair(
    report1: ReportData,
    report2: ReportData
  ): Promise<{
    reportId: string;
    overallScore: number;
    confidence: number;
    reasons: any;
    recommendation: 'group' | 'review' | 'separate';
  }> {
    const reasons: any = {
      categoryMatch: report1.category === report2.category,
      statusConsistency: this.assessStatusConsistency(report1.status, report2.status),
      priorityAlignment: this.assessPriorityAlignment(report1.priority, report2.priority),
      temporalProximity: this.calculateTemporalProximity(report1.createdAt, report2.createdAt)
    };

    let scores: number[] = [];
    let weights: number[] = [];

    // Text similarity analysis
    const combinedText1 = `${report1.title} ${report1.description}`;
    const combinedText2 = `${report2.title} ${report2.description}`;
    const textSimilarity = textSimilarityService.compareTexts(combinedText1, combinedText2);
    
    reasons.textSimilarity = textSimilarity;
    
    if (textSimilarity.weightedScore >= this.config.textSimilarityThreshold) {
      scores.push(textSimilarity.weightedScore);
      weights.push(this.config.textSimilarityWeight);
    }

    // Geospatial proximity analysis
    if (report1.location && report2.location) {
      const proximityResult = geospatialUtils.isWithinRadius(
        report1.location,
        report2.location,
        this.config.proximityRadiusMeters
      );
      
      reasons.proximityResult = proximityResult;
      
      if (proximityResult.isWithinRadius) {
        // Inverse distance scoring - closer reports score higher
        const maxDistance = this.config.proximityRadiusMeters;
        const proximityScore = Math.max(0, (maxDistance - proximityResult.distance) / maxDistance);
        scores.push(proximityScore);
        weights.push(this.config.proximityWeight);
      }
    }

    // Category matching
    if (reasons.categoryMatch) {
      scores.push(1.0);
      weights.push(this.config.categoryMatchWeight);
    }

    // Calculate weighted overall score
    let overallScore = 0;
    let totalWeight = 0;

    if (scores.length > 0) {
      for (let i = 0; i < scores.length; i++) {
        overallScore += scores[i] * weights[i];
        totalWeight += weights[i];
      }
      overallScore = totalWeight > 0 ? overallScore / totalWeight : 0;
    }

    // Calculate confidence based on multiple factors
    const confidence = this.calculateConfidence(reasons, textSimilarity, overallScore);

    // Determine recommendation
    const recommendation = this.determineRecommendation(overallScore, confidence, reasons);

    return {
      reportId: report2.id,
      overallScore,
      confidence,
      reasons,
      recommendation
    };
  }

  /**
   * Filter reports by temporal window
   */
  private filterByTemporalWindow(targetReport: ReportData, candidates: ReportData[]): ReportData[] {
    const windowMs = this.config.temporalWindowDays * 24 * 60 * 60 * 1000;
    const targetTime = targetReport.createdAt.getTime();

    return candidates.filter(candidate => {
      const candidateTime = candidate.createdAt.getTime();
      return Math.abs(targetTime - candidateTime) <= windowMs;
    });
  }

  /**
   * Filter reports by category
   */
  private filterByCategory(targetReport: ReportData, candidates: ReportData[]): ReportData[] {
    // For now, include all categories but prioritize matches
    // In the future, could add strict category filtering option
    return candidates.filter(candidate => 
      candidate.id !== targetReport.id // Exclude the target report itself
    );
  }

  /**
   * Assess consistency between report statuses
   */
  private assessStatusConsistency(status1: string, status2: string): boolean {
    // Define compatible status combinations
    const compatibleStatuses = [
      ['open', 'in_progress'],
      ['resolved', 'closed'],
      ['duplicate', 'merged']
    ];

    if (status1 === status2) return true;

    return compatibleStatuses.some(group => 
      group.includes(status1) && group.includes(status2)
    );
  }

  /**
   * Assess alignment between report priorities
   */
  private assessPriorityAlignment(priority1: string, priority2: string): boolean {
    if (priority1 === priority2) return true;

    // Adjacent priorities are somewhat compatible
    const priorityOrder = ['low', 'medium', 'high', 'urgent'];
    const index1 = priorityOrder.indexOf(priority1);
    const index2 = priorityOrder.indexOf(priority2);

    if (index1 !== -1 && index2 !== -1) {
      return Math.abs(index1 - index2) <= 1;
    }

    return false;
  }

  /**
   * Calculate temporal proximity between reports (in days)
   */
  private calculateTemporalProximity(date1: Date, date2: Date): number {
    const diffMs = Math.abs(date1.getTime() - date2.getTime());
    return diffMs / (1000 * 60 * 60 * 24); // Convert to days
  }

  /**
   * Calculate confidence score for grouping recommendation
   */
  private calculateConfidence(
    reasons: any,
    textSimilarity: TextSimilarityResult,
    overallScore: number
  ): number {
    let confidenceFactors: number[] = [];

    // Text similarity confidence
    if (textSimilarity) {
      confidenceFactors.push(textSimilarity.confidence);
    }

    // Proximity confidence (if available)
    if (reasons.proximityResult) {
      const accuracyScore = reasons.proximityResult.accuracy === 'high' ? 1.0 :
                           reasons.proximityResult.accuracy === 'medium' ? 0.8 : 0.6;
      confidenceFactors.push(accuracyScore);
    }

    // Category match confidence
    if (reasons.categoryMatch) {
      confidenceFactors.push(1.0);
    }

    // Status and priority consistency
    if (reasons.statusConsistency) {
      confidenceFactors.push(0.8);
    }

    if (reasons.priorityAlignment) {
      confidenceFactors.push(0.7);
    }

    // Temporal proximity (closer in time = higher confidence)
    const temporalConfidence = Math.max(0, 1 - (reasons.temporalProximity / this.config.temporalWindowDays));
    confidenceFactors.push(temporalConfidence);

    // Calculate average confidence
    const averageConfidence = confidenceFactors.length > 0 ?
      confidenceFactors.reduce((sum, conf) => sum + conf, 0) / confidenceFactors.length : 0;

    // Weight by overall score
    return (averageConfidence * 0.7) + (overallScore * 0.3);
  }

  /**
   * Determine grouping recommendation
   */
  private determineRecommendation(
    overallScore: number,
    confidence: number,
    _reasons: any // Prefixed with underscore to indicate unused parameter
  ): 'group' | 'review' | 'separate' {
    // High confidence and score = automatic grouping
    if (overallScore >= 0.85 && confidence >= 0.8 && !this.config.requireHumanReview) {
      return 'group';
    }

    // Medium confidence = human review
    if (overallScore >= this.config.minConfidenceThreshold && confidence >= 0.6) {
      return 'review';
    }

    // Low scores = separate
    return 'separate';
  }

  /**
   * Suggest a group ID for high-confidence matches
   */
  private suggestGroupId(similarReports: any[]): string | undefined {
    const highConfidenceReports = similarReports.filter(
      report => report.recommendation === 'group' || 
               (report.overallScore >= 0.8 && report.confidence >= 0.75)
    );

    if (highConfidenceReports.length > 0) {
      // Generate a group ID based on the best match
      const bestMatch = highConfidenceReports[0];
      return `group_${bestMatch.reportId}_${Date.now()}`;
    }

    return undefined;
  }

  /**
   * Create a report group from analysis results
   */
  public createReportGroup(
    primaryReport: ReportData,
    relatedReports: ReportData[],
    groupingAnalysis: GroupingAnalysis
  ): ReportGroup {
    const allReports = [primaryReport, ...relatedReports];
    
    // Calculate group metadata
    const averageConfidence = groupingAnalysis.similarReports.reduce(
      (sum, report) => sum + report.confidence, 0
    ) / groupingAnalysis.similarReports.length;

    const textSimilarityScores = groupingAnalysis.similarReports
      .filter(r => r.reasons.textSimilarity)
      .map(r => r.reasons.textSimilarity!.weightedScore);

    const textSimilarityRange = {
      min: Math.min(...textSimilarityScores),
      max: Math.max(...textSimilarityScores)
    };

    // Determine group location (centroid of all locations)
    const locations = allReports
      .filter(r => r.location)
      .map(r => r.location!);
    
    const groupLocation = locations.length > 0 ? 
      geospatialUtils.calculateCentroid(locations) : undefined;

    // Calculate spatial radius if multiple locations
    let spatialRadius: number | undefined;
    if (locations.length > 1 && groupLocation) {
      const distances = locations.map(loc => 
        geospatialUtils.calculateDistance(groupLocation, loc)
      );
      spatialRadius = Math.max(...distances);
    }

    // Determine group priority (highest among reports)
    const priorityOrder = ['low', 'medium', 'high', 'urgent'];
    const groupPriority = allReports.reduce((highest, report) => {
      const currentIndex = priorityOrder.indexOf(report.priority);
      const highestIndex = priorityOrder.indexOf(highest);
      return currentIndex > highestIndex ? report.priority : highest;
    }, 'low' as 'low' | 'medium' | 'high' | 'urgent');

    // Generate grouping reasons
    const groupingReasons: string[] = [];
    if (textSimilarityScores.length > 0) {
      groupingReasons.push('textual similarity');
    }
    if (spatialRadius) {
      groupingReasons.push('spatial proximity');
    }
    if (groupingAnalysis.similarReports.some(r => r.reasons.categoryMatch)) {
      groupingReasons.push('category match');
    }

    return {
      id: groupingAnalysis.suggestedGroupId || `group_${primaryReport.id}_${Date.now()}`,
      title: primaryReport.title,
      description: primaryReport.description,
      category: primaryReport.category,
      priority: groupPriority,
      status: primaryReport.status as any,
      location: groupLocation || undefined,
      reportCount: allReports.length,
      reportIds: allReports.map(r => r.id),
      confidence: averageConfidence,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        primaryReportId: primaryReport.id,
        groupingReasons,
        averageConfidence,
        spatialRadius,
        textSimilarityRange
      }
    };
  }

  /**
   * Batch analyze multiple reports for potential groupings
   */
  public async batchAnalyzeReports(reports: ReportData[]): Promise<Map<string, GroupingAnalysis>> {
    const results = new Map<string, GroupingAnalysis>();
    
    for (let i = 0; i < reports.length; i++) {
      const targetReport = reports[i];
      const candidateReports = reports.filter((_, index) => index !== i);
      
      const analysis = await this.analyzeReportForGrouping(targetReport, candidateReports);
      results.set(targetReport.id, analysis);
    }

    return results;
  }

  /**
   * Find optimal groupings from batch analysis results
   */
  public findOptimalGroupings(
    batchResults: Map<string, GroupingAnalysis>
  ): ReportGroup[] {
    const processedReports = new Set<string>();
    const groups: ReportGroup[] = [];

    // Sort reports by their best similarity scores
    const sortedReports = Array.from(batchResults.entries())
      .sort((a, b) => {
        const maxScoreA = a[1].similarReports.length > 0 ? 
          Math.max(...a[1].similarReports.map(r => r.overallScore)) : 0;
        const maxScoreB = b[1].similarReports.length > 0 ? 
          Math.max(...b[1].similarReports.map(r => r.overallScore)) : 0;
        return maxScoreB - maxScoreA;
      });

    for (const [reportId, analysis] of sortedReports) {
      if (processedReports.has(reportId)) {
        continue;
      }

      const groupCandidates = analysis.similarReports.filter(
        r => r.recommendation === 'group' && !processedReports.has(r.reportId)
      );

      if (groupCandidates.length > 0) {
        // Mark all reports in this group as processed
        processedReports.add(reportId);
        groupCandidates.forEach(candidate => processedReports.add(candidate.reportId));

        // Create group (would need actual report data here)
        // This is a simplified version - in practice you'd fetch the full report data
        console.log(`Would create group for report ${reportId} with ${groupCandidates.length} related reports`);
      }
    }

    return groups;
  }
}

/**
 * Export singleton instance with default configuration
 */
export const reportGroupingService = ReportGroupingService.getInstance();

/**
 * Utility function for quick duplicate check
 */
export async function quickDuplicateCheck(
  report: ReportData,
  candidates: ReportData[],
  threshold: number = 0.8
): Promise<ReportData[]> {
  const analysis = await reportGroupingService.analyzeReportForGrouping(report, candidates);
  
  return analysis.similarReports
    .filter(result => result.overallScore >= threshold)
    .map(result => candidates.find(c => c.id === result.reportId)!)
    .filter(Boolean);
}