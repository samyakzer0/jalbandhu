/**
 * Report Grouping Integration Hooks for Nivaran
 * 
 * Provides async hooks to trigger duplicate detection on report creation and updates
 * without disrupting current workflows. These hooks integrate with existing services
 * to add grouping functionality seamlessly.
 */

import { reportGroupingService, ReportData, GroupingAnalysis } from './ReportGroupingService';

/**
 * Interface for hook configuration
 */
export interface GroupingHooksConfig {
  enableAutoDetection: boolean; // Automatically detect duplicates on report changes
  enableAsyncProcessing: boolean; // Process in background to avoid blocking
  batchProcessingDelay: number; // Delay before processing batched reports (ms)
  maxBatchSize: number; // Maximum number of reports to process in one batch
  enableLogging: boolean; // Log grouping activities
  notifyOnGrouping: boolean; // Notify users when reports are grouped
  autoGroupThreshold: number; // Threshold for automatic grouping (0.9 = very high confidence)
  reviewThreshold: number; // Threshold for flagging for review (0.7)
}

/**
 * Default hook configuration
 */
const DEFAULT_HOOKS_CONFIG: GroupingHooksConfig = {
  enableAutoDetection: true,
  enableAsyncProcessing: true,
  batchProcessingDelay: 5000, // 5 seconds
  maxBatchSize: 10,
  enableLogging: true,
  notifyOnGrouping: false, // Default off to avoid notification spam
  autoGroupThreshold: 0.9,
  reviewThreshold: 0.7
};

/**
 * Interface for grouping event data
 */
export interface GroupingEvent {
  type: 'report_created' | 'report_updated' | 'report_deleted' | 'batch_process';
  reportId: string;
  timestamp: Date;
  userId?: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Interface for grouping results callback
 */
export interface GroupingResultCallback {
  onGroupingDetected?: (reportId: string, analysis: GroupingAnalysis) => void;
  onGroupingError?: (reportId: string, error: Error) => void;
  onBatchComplete?: (results: Map<string, GroupingAnalysis>) => void;
}

/**
 * Grouping hooks service for integration
 */
export class ReportGroupingHooks {
  private static instance: ReportGroupingHooks;
  private config: GroupingHooksConfig;
  private pendingReports: Map<string, { event: GroupingEvent; report: ReportData }> = new Map();
  private batchTimer: NodeJS.Timeout | null = null;
  private callbacks: GroupingResultCallback = {};
  private isProcessing = false;

  private constructor(config: Partial<GroupingHooksConfig> = {}) {
    this.config = { ...DEFAULT_HOOKS_CONFIG, ...config };
  }

  /**
   * Singleton pattern with configuration
   */
  static getInstance(config: Partial<GroupingHooksConfig> = {}): ReportGroupingHooks {
    if (!this.instance) {
      this.instance = new ReportGroupingHooks(config);
    }
    return this.instance;
  }

  /**
   * Update hook configuration
   */
  public updateConfig(newConfig: Partial<GroupingHooksConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Set result callbacks
   */
  public setCallbacks(callbacks: GroupingResultCallback): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Hook for when a new report is created
   * Call this from your existing report creation logic
   */
  public async onReportCreated(report: ReportData, userId?: string): Promise<void> {
    if (!this.config.enableAutoDetection) {
      return;
    }

    const event: GroupingEvent = {
      type: 'report_created',
      reportId: report.id,
      timestamp: new Date(),
      userId,
      metadata: { action: 'create' }
    };

    this.log(`Report created hook triggered for report ${report.id}`);

    if (this.config.enableAsyncProcessing) {
      this.addToBatch(event, report);
    } else {
      await this.processReportImmediately(report, event);
    }
  }

  /**
   * Hook for when a report is updated
   * Call this from your existing report update logic
   */
  public async onReportUpdated(
    report: ReportData, 
    changes: Record<string, any>,
    userId?: string
  ): Promise<void> {
    if (!this.config.enableAutoDetection) {
      return;
    }

    // Only process if meaningful fields changed
    const meaningfulFields = ['title', 'description', 'category', 'location', 'status'];
    const hasSignificantChanges = meaningfulFields.some(field => 
      changes.hasOwnProperty(field)
    );

    if (!hasSignificantChanges) {
      this.log(`Report ${report.id} updated but no significant changes detected`);
      return;
    }

    const event: GroupingEvent = {
      type: 'report_updated',
      reportId: report.id,
      timestamp: new Date(),
      userId,
      changes,
      metadata: { action: 'update', changedFields: Object.keys(changes) }
    };

    this.log(`Report updated hook triggered for report ${report.id}`);

    if (this.config.enableAsyncProcessing) {
      this.addToBatch(event, report);
    } else {
      await this.processReportImmediately(report, event);
    }
  }

  /**
   * Hook for when a report is deleted
   * Call this from your existing report deletion logic
   */
  public async onReportDeleted(reportId: string, userId?: string): Promise<void> {
    this.log(`Report deleted hook triggered for report ${reportId}`);

    // Remove from pending batch if it exists
    this.pendingReports.delete(reportId);

    // TODO: In a full implementation, you would:
    // 1. Remove the report from any existing groups
    // 2. Recalculate group statistics
    // 3. Potentially dissolve groups if they become too small
    // 4. Update the database accordingly

    const event: GroupingEvent = {
      type: 'report_deleted',
      reportId,
      timestamp: new Date(),
      userId,
      metadata: { action: 'delete' }
    };

    // For now, just log the event
    this.log(`Report ${reportId} deletion processed`, event);
  }

  /**
   * Add report to batch processing queue
   */
  private addToBatch(event: GroupingEvent, report: ReportData): void {
    this.pendingReports.set(report.id, { event, report });

    // Clear existing timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    // Set new timer or process immediately if batch is full
    if (this.pendingReports.size >= this.config.maxBatchSize) {
      this.processBatch();
    } else {
      this.batchTimer = setTimeout(() => {
        this.processBatch();
      }, this.config.batchProcessingDelay);
    }
  }

  /**
   * Process reports in batch
   */
  private async processBatch(): Promise<void> {
    if (this.isProcessing || this.pendingReports.size === 0) {
      return;
    }

    this.isProcessing = true;
    this.log(`Processing batch of ${this.pendingReports.size} reports`);

    try {
      const batchReports = Array.from(this.pendingReports.values());
      
      // Clear the pending queue
      this.pendingReports.clear();
      
      if (this.batchTimer) {
        clearTimeout(this.batchTimer);
        this.batchTimer = null;
      }

      // Get all existing reports for comparison (this would be a database query in practice)
      const existingReports = await this.fetchExistingReports();

      // Process each report in the batch
      const results = new Map<string, GroupingAnalysis>();

      for (const { report, event } of batchReports) {
        try {
          const candidateReports = existingReports.filter(r => r.id !== report.id);
          const analysis = await reportGroupingService.analyzeReportForGrouping(
            report, 
            candidateReports
          );

          results.set(report.id, analysis);

          // Handle the results
          await this.handleGroupingResults(report, analysis, event);

        } catch (error) {
          this.log(`Error processing report ${report.id}:`, error);
          this.callbacks.onGroupingError?.(report.id, error as Error);
        }
      }

      // Notify batch completion
      this.callbacks.onBatchComplete?.(results);
      this.log(`Batch processing completed. Processed ${results.size} reports.`);

    } catch (error) {
      this.log('Error in batch processing:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single report immediately
   */
  private async processReportImmediately(report: ReportData, event: GroupingEvent): Promise<void> {
    try {
      this.log(`Processing report ${report.id} immediately`);

      // Get existing reports for comparison
      const existingReports = await this.fetchExistingReports();
      const candidateReports = existingReports.filter(r => r.id !== report.id);

      const analysis = await reportGroupingService.analyzeReportForGrouping(
        report, 
        candidateReports
      );

      await this.handleGroupingResults(report, analysis, event);

    } catch (error) {
      this.log(`Error processing report ${report.id}:`, error);
      this.callbacks.onGroupingError?.(report.id, error as Error);
    }
  }

  /**
   * Handle grouping analysis results
   */
  private async handleGroupingResults(
    report: ReportData, 
    analysis: GroupingAnalysis, 
    event: GroupingEvent
  ): Promise<void> {
    // Filter high-confidence matches
    const highConfidenceMatches = analysis.similarReports.filter(
      result => result.overallScore >= this.config.autoGroupThreshold
    );

    const reviewMatches = analysis.similarReports.filter(
      result => result.overallScore >= this.config.reviewThreshold && 
                result.overallScore < this.config.autoGroupThreshold
    );

    if (highConfidenceMatches.length > 0) {
      this.log(`Found ${highConfidenceMatches.length} high-confidence matches for report ${report.id}`);
      
      // In a full implementation, you would:
      // 1. Create or update report groups in the database
      // 2. Send notifications if enabled
      // 3. Update report statuses
      await this.handleAutoGrouping(report, highConfidenceMatches, analysis);
    }

    if (reviewMatches.length > 0) {
      this.log(`Found ${reviewMatches.length} matches requiring review for report ${report.id}`);
      
      // In a full implementation, you would:
      // 1. Flag reports for human review
      // 2. Create review tasks in admin dashboard
      // 3. Send notifications to administrators
      await this.handleReviewRequired(report, reviewMatches, analysis);
    }

    // Always notify about grouping detection
    this.callbacks.onGroupingDetected?.(report.id, analysis);

    this.log(`Grouping analysis completed for report ${report.id}`, {
      totalSimilar: analysis.similarReports.length,
      highConfidence: highConfidenceMatches.length,
      needsReview: reviewMatches.length,
      event
    });
  }

  /**
   * Handle automatic grouping for high-confidence matches
   */
  private async handleAutoGrouping(
    report: ReportData,
    matches: any[],
    _analysis: GroupingAnalysis // Prefixed with underscore to indicate unused parameter
  ): Promise<void> {
    this.log(`Auto-grouping report ${report.id} with ${matches.length} similar reports`);

    // TODO: Implement database operations:
    // 1. Insert into report_groups table
    // 2. Insert into report_group_memberships table
    // 3. Insert into report_grouping_history table
    // 4. Update report statuses if needed
    // 5. Send notifications if enabled

    if (this.config.notifyOnGrouping) {
      // TODO: Send notification about automatic grouping
      this.log(`Notification would be sent about grouping for report ${report.id}`);
    }
  }

  /**
   * Handle cases requiring human review
   */
  private async handleReviewRequired(
    report: ReportData,
    matches: any[],
    _analysis: GroupingAnalysis // Prefixed with underscore to indicate unused parameter
  ): Promise<void> {
    this.log(`Flagging report ${report.id} for human review due to ${matches.length} potential matches`);

    // TODO: Implement review workflow:
    // 1. Create review tasks in admin dashboard
    // 2. Flag reports with review status
    // 3. Send notifications to administrators
    // 4. Store pending review data
  }

  /**
   * Fetch existing reports for comparison
   * This is a placeholder - in practice, this would be a database query
   */
  private async fetchExistingReports(): Promise<ReportData[]> {
    // TODO: Implement actual database query
    // This should fetch recent reports (within temporal window) for comparison
    
    // For now, return empty array
    return [];
  }

  /**
   * Utility method for logging
   */
  private log(message: string, data?: any): void {
    if (this.config.enableLogging) {
      const timestamp = new Date().toISOString();
      console.log(`[ReportGroupingHooks ${timestamp}] ${message}`, data || '');
    }
  }

  /**
   * Manual trigger for processing a specific report
   */
  public async triggerManualAnalysis(report: ReportData): Promise<GroupingAnalysis> {
    this.log(`Manual analysis triggered for report ${report.id}`);

    const existingReports = await this.fetchExistingReports();
    const candidateReports = existingReports.filter(r => r.id !== report.id);

    return await reportGroupingService.analyzeReportForGrouping(report, candidateReports);
  }

  /**
   * Get current batch status
   */
  public getBatchStatus(): {
    pendingCount: number;
    isProcessing: boolean;
    nextBatchIn?: number;
  } {
    const nextBatchIn = this.batchTimer ? this.config.batchProcessingDelay : undefined;

    return {
      pendingCount: this.pendingReports.size,
      isProcessing: this.isProcessing,
      nextBatchIn
    };
  }

  /**
   * Flush pending batch immediately
   */
  public async flushBatch(): Promise<void> {
    if (this.pendingReports.size > 0) {
      this.log('Manually flushing pending batch');
      await this.processBatch();
    }
  }

  /**
   * Clear all pending reports without processing
   */
  public clearBatch(): void {
    this.pendingReports.clear();
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    this.log('Pending batch cleared');
  }

  /**
   * Get configuration
   */
  public getConfig(): GroupingHooksConfig {
    return { ...this.config };
  }

  /**
   * Enable or disable the hooks
   */
  public setEnabled(enabled: boolean): void {
    this.config.enableAutoDetection = enabled;
    if (!enabled) {
      this.clearBatch();
    }
    this.log(`Grouping hooks ${enabled ? 'enabled' : 'disabled'}`);
  }
}

/**
 * Export singleton instance
 */
export const reportGroupingHooks = ReportGroupingHooks.getInstance();

/**
 * Convenience wrapper functions for easy integration
 */

/**
 * Call this when creating a new report
 */
export async function notifyReportCreated(report: ReportData, userId?: string): Promise<void> {
  await reportGroupingHooks.onReportCreated(report, userId);
}

/**
 * Call this when updating an existing report
 */
export async function notifyReportUpdated(
  report: ReportData, 
  changes: Record<string, any>, 
  userId?: string
): Promise<void> {
  await reportGroupingHooks.onReportUpdated(report, changes, userId);
}

/**
 * Call this when deleting a report
 */
export async function notifyReportDeleted(reportId: string, userId?: string): Promise<void> {
  await reportGroupingHooks.onReportDeleted(reportId, userId);
}

/**
 * Initialize the hooks with custom configuration
 */
export function initializeGroupingHooks(
  config?: Partial<GroupingHooksConfig>,
  callbacks?: GroupingResultCallback
): ReportGroupingHooks {
  const hooks = ReportGroupingHooks.getInstance(config);
  
  if (callbacks) {
    hooks.setCallbacks(callbacks);
  }

  return hooks;
}

/**
 * Example usage in existing report service:
 * 
 * ```typescript
 * import { notifyReportCreated, notifyReportUpdated, notifyReportDeleted } from './ReportGroupingHooks';
 * 
 * // In your existing report creation function:
 * async function createReport(reportData: ReportData): Promise<Report> {
 *   const report = await database.createReport(reportData);
 *   
 *   // Add this line to trigger grouping analysis
 *   await notifyReportCreated(report, currentUserId);
 *   
 *   return report;
 * }
 * 
 * // In your existing report update function:
 * async function updateReport(reportId: string, updates: any): Promise<Report> {
 *   const report = await database.updateReport(reportId, updates);
 *   
 *   // Add this line to trigger grouping analysis
 *   await notifyReportUpdated(report, updates, currentUserId);
 *   
 *   return report;
 * }
 * ```
 */