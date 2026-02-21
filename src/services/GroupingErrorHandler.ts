/**
 * Error Handling and Logging System for Nivaran Report Grouping
 * 
 * Provides comprehensive error handling, logging, and fallback mechanisms
 * throughout the grouping system to ensure robustness and debuggability.
 * Includes structured logging, error recovery, and monitoring capabilities.
 */

/**
 * Log levels for structured logging
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

/**
 * Error categories for classification
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  NETWORK = 'network',
  DATABASE = 'database',
  PROCESSING = 'processing',
  CONFIGURATION = 'configuration',
  EXTERNAL_SERVICE = 'external_service',
  USER_INPUT = 'user_input',
  SYSTEM = 'system'
}

/**
 * Interface for structured log entries
 */
export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
  context?: Record<string, any>;
  error?: Error;
  stackTrace?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

/**
 * Interface for error context information
 */
export interface ErrorContext {
  operation: string;
  component: string;
  reportId?: string;
  groupId?: string;
  userId?: string;
  additionalData?: Record<string, any>;
}

/**
 * Custom error classes for different types of grouping errors
 */
export class GroupingError extends Error {
  public readonly category: ErrorCategory;
  public readonly context: ErrorContext;
  public readonly timestamp: Date;
  public readonly recoverable: boolean;
  public readonly originalCause?: Error;

  constructor(
    message: string,
    category: ErrorCategory,
    context: ErrorContext,
    recoverable: boolean = true,
    cause?: Error
  ) {
    super(message);
    this.name = 'GroupingError';
    this.category = category;
    this.context = context;
    this.timestamp = new Date();
    this.recoverable = recoverable;
    this.originalCause = cause;
  }
}

export class ValidationError extends GroupingError {
  constructor(message: string, context: ErrorContext, cause?: Error) {
    super(message, ErrorCategory.VALIDATION, context, true, cause);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends GroupingError {
  constructor(message: string, context: ErrorContext, cause?: Error) {
    super(message, ErrorCategory.NETWORK, context, true, cause);
    this.name = 'NetworkError';
  }
}

export class ProcessingError extends GroupingError {
  constructor(message: string, context: ErrorContext, cause?: Error) {
    super(message, ErrorCategory.PROCESSING, context, true, cause);
    this.name = 'ProcessingError';
  }
}

export class DatabaseError extends GroupingError {
  constructor(message: string, context: ErrorContext, cause?: Error) {
    super(message, ErrorCategory.DATABASE, context, false, cause);
    this.name = 'DatabaseError';
  }
}

/**
 * Configuration for error handling system
 */
export interface ErrorHandlingConfig {
  enableLogging: boolean;
  enableConsoleOutput: boolean;
  enableRemoteLogging: boolean;
  logLevel: LogLevel;
  maxLogEntries: number;
  enableRetry: boolean;
  maxRetries: number;
  retryDelayMs: number;
  enableFallback: boolean;
  enableErrorReporting: boolean;
}

/**
 * Default error handling configuration
 */
const DEFAULT_CONFIG: ErrorHandlingConfig = {
  enableLogging: true,
  enableConsoleOutput: true,
  enableRemoteLogging: false,
  logLevel: LogLevel.INFO,
  maxLogEntries: 1000,
  enableRetry: true,
  maxRetries: 3,
  retryDelayMs: 1000,
  enableFallback: true,
  enableErrorReporting: true
};

/**
 * Main error handling and logging service
 */
export class GroupingErrorHandler {
  private static instance: GroupingErrorHandler;
  private config: ErrorHandlingConfig;
  private logEntries: LogEntry[] = [];
  private sessionId: string;

  private constructor(config: Partial<ErrorHandlingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = this.generateSessionId();
  }

  /**
   * Singleton pattern with configuration
   */
  static getInstance(config: Partial<ErrorHandlingConfig> = {}): GroupingErrorHandler {
    if (!this.instance) {
      this.instance = new GroupingErrorHandler(config);
    }
    return this.instance;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log a message with specified level and context
   */
  public log(
    level: LogLevel,
    category: string,
    message: string,
    context?: Record<string, any>,
    error?: Error,
    userId?: string
  ): void {
    if (!this.config.enableLogging) return;

    // Check if log level meets threshold
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    const currentLevelIndex = levels.indexOf(level);
    const configLevelIndex = levels.indexOf(this.config.logLevel);
    
    if (currentLevelIndex < configLevelIndex) return;

    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      category,
      message,
      context,
      error,
      stackTrace: error?.stack,
      userId,
      sessionId: this.sessionId,
      requestId: context?.requestId as string
    };

    // Add to in-memory log
    this.logEntries.push(logEntry);
    
    // Maintain max log entries
    if (this.logEntries.length > this.config.maxLogEntries) {
      this.logEntries = this.logEntries.slice(-this.config.maxLogEntries);
    }

    // Console output
    if (this.config.enableConsoleOutput) {
      this.outputToConsole(logEntry);
    }

    // Remote logging (if configured)
    if (this.config.enableRemoteLogging) {
      this.sendToRemoteLogger(logEntry).catch(err => 
        console.error('Failed to send log to remote service:', err)
      );
    }
  }

  /**
   * Output log entry to console with appropriate formatting
   */
  private outputToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.category}]`;
    
    const contextStr = entry.context ? JSON.stringify(entry.context, null, 2) : '';
    const fullMessage = `${prefix} ${entry.message}${contextStr ? '\nContext: ' + contextStr : ''}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(fullMessage, entry.error);
        break;
      case LogLevel.INFO:
        console.info(fullMessage);
        break;
      case LogLevel.WARN:
        console.warn(fullMessage, entry.error);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(fullMessage, entry.error);
        break;
    }
  }

  /**
   * Send log entry to remote logging service
   */
  private async sendToRemoteLogger(entry: LogEntry): Promise<void> {
    // TODO: Implement actual remote logging service integration
    // This could send to services like:
    // - Application Insights
    // - CloudWatch
    // - Datadog
    // - Custom logging endpoint
    console.debug('Would send log entry to remote service:', entry);
  }

  /**
   * Handle and log errors with context
   */
  public handleError(
    error: Error | GroupingError,
    context: ErrorContext,
    userId?: string
  ): GroupingError {
    let groupingError: GroupingError;

    if (error instanceof GroupingError) {
      groupingError = error;
    } else {
      // Convert generic error to GroupingError
      groupingError = new GroupingError(
        error.message,
        ErrorCategory.SYSTEM,
        context,
        true,
        error
      );
    }

    // Log the error
    this.log(
      LogLevel.ERROR,
      groupingError.category,
      `Error in ${context.operation}: ${groupingError.message}`,
      {
        component: context.component,
        reportId: context.reportId,
        groupId: context.groupId,
        additionalData: context.additionalData,
        recoverable: groupingError.recoverable,
        errorName: groupingError.name
      },
      groupingError,
      userId
    );

    // Report error if enabled
    if (this.config.enableErrorReporting) {
      this.reportError(groupingError, context, userId);
    }

    return groupingError;
  }

  /**
   * Execute operation with retry logic and error handling
   */
  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    userId?: string,
    customRetries?: number
  ): Promise<T> {
    const maxRetries = customRetries ?? this.config.maxRetries;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        this.log(
          LogLevel.DEBUG,
          'retry',
          `Executing ${context.operation}, attempt ${attempt + 1}`,
          { ...context, attempt },
          undefined,
          userId
        );

        const result = await operation();
        
        if (attempt > 0) {
          this.log(
            LogLevel.INFO,
            'retry',
            `Operation ${context.operation} succeeded on attempt ${attempt + 1}`,
            { ...context, attempt },
            undefined,
            userId
          );
        }

        return result;

      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries && this.config.enableRetry) {
          this.log(
            LogLevel.WARN,
            'retry',
            `Operation ${context.operation} failed on attempt ${attempt + 1}, retrying...`,
            { ...context, attempt, error: error instanceof Error ? error.message : String(error) },
            error as Error,
            userId
          );

          // Wait before retry
          await this.delay(this.config.retryDelayMs * Math.pow(2, attempt)); // Exponential backoff
        } else {
          // Final attempt failed
          const groupingError = this.handleError(error as Error, context, userId);
          throw groupingError;
        }
      }
    }

    // This should never be reached, but just in case
    throw lastError || new Error('Unknown error in retry logic');
  }

  /**
   * Execute operation with fallback handling
   */
  public async executeWithFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    context: ErrorContext,
    userId?: string
  ): Promise<T> {
    if (!this.config.enableFallback) {
      return this.executeWithRetry(primaryOperation, context, userId);
    }

    try {
      return await this.executeWithRetry(primaryOperation, context, userId);
    } catch (primaryError) {
      this.log(
        LogLevel.WARN,
        'fallback',
        `Primary operation ${context.operation} failed, attempting fallback`,
        { 
          ...context, 
          primaryError: primaryError instanceof Error ? primaryError.message : String(primaryError)
        },
        primaryError instanceof Error ? primaryError : undefined,
        userId
      );

      try {
        const result = await fallbackOperation();
        
        this.log(
          LogLevel.INFO,
          'fallback',
          `Fallback operation ${context.operation} succeeded`,
          context,
          undefined,
          userId
        );

        return result;
      } catch (fallbackError) {
        this.log(
          LogLevel.ERROR,
          'fallback',
          `Both primary and fallback operations failed for ${context.operation}`,
          { 
            ...context, 
            primaryError: primaryError instanceof Error ? primaryError.message : String(primaryError),
            fallbackError: fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
          },
          fallbackError instanceof Error ? fallbackError : undefined,
          userId
        );

        // Throw the primary error as it's likely more relevant
        throw primaryError;
      }
    }
  }

  /**
   * Validate input and throw ValidationError if invalid
   */
  public validateInput(
    condition: boolean,
    message: string,
    context: ErrorContext,
    userId?: string
  ): void {
    if (!condition) {
      const error = new ValidationError(message, context);
      this.handleError(error, context, userId);
      throw error;
    }
  }

  /**
   * Report error to external monitoring service
   */
  private reportError(error: GroupingError, context: ErrorContext, userId?: string): void {
    // TODO: Implement actual error reporting service integration
    // This could report to services like:
    // - Sentry
    // - Bugsnag
    // - Rollbar
    // - Custom error tracking endpoint
    
    console.debug('Would report error to monitoring service:', {
      error: error.message,
      category: error.category,
      context,
      userId,
      timestamp: error.timestamp,
      recoverable: error.recoverable
    });
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get recent log entries
   */
  public getRecentLogs(limit: number = 100, level?: LogLevel): LogEntry[] {
    let filtered = this.logEntries;
    
    if (level) {
      filtered = filtered.filter(entry => entry.level === level);
    }

    return filtered.slice(-limit);
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): {
    totalErrors: number;
    errorsByCategory: Record<string, number>;
    errorsByLevel: Record<string, number>;
    recentErrorRate: number; // Errors per hour in last 24h
  } {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentLogs = this.logEntries.filter(entry => entry.timestamp >= oneDayAgo);
    const recentErrors = recentLogs.filter(entry => 
      entry.level === LogLevel.ERROR || entry.level === LogLevel.FATAL
    );

    const errorsByCategory: Record<string, number> = {};
    const errorsByLevel: Record<string, number> = {};

    for (const entry of this.logEntries) {
      if (entry.level === LogLevel.ERROR || entry.level === LogLevel.FATAL) {
        errorsByCategory[entry.category] = (errorsByCategory[entry.category] || 0) + 1;
        errorsByLevel[entry.level] = (errorsByLevel[entry.level] || 0) + 1;
      }
    }

    return {
      totalErrors: Object.values(errorsByLevel).reduce((sum, count) => sum + count, 0),
      errorsByCategory,
      errorsByLevel,
      recentErrorRate: recentErrors.length / 24 // Errors per hour
    };
  }

  /**
   * Clear log entries
   */
  public clearLogs(): void {
    this.logEntries = [];
    this.log(LogLevel.INFO, 'system', 'Log entries cleared');
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<ErrorHandlingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.log(LogLevel.INFO, 'system', 'Error handling configuration updated', { newConfig });
  }

  /**
   * Export logs for debugging
   */
  public exportLogs(): string {
    return JSON.stringify(this.logEntries, null, 2);
  }
}

/**
 * Export singleton instance
 */
export const groupingErrorHandler = GroupingErrorHandler.getInstance();

/**
 * Convenience logging functions
 */
export const logDebug = (category: string, message: string, context?: Record<string, any>, userId?: string) =>
  groupingErrorHandler.log(LogLevel.DEBUG, category, message, context, undefined, userId);

export const logInfo = (category: string, message: string, context?: Record<string, any>, userId?: string) =>
  groupingErrorHandler.log(LogLevel.INFO, category, message, context, undefined, userId);

export const logWarn = (category: string, message: string, context?: Record<string, any>, error?: Error, userId?: string) =>
  groupingErrorHandler.log(LogLevel.WARN, category, message, context, error, userId);

export const logError = (category: string, message: string, context?: Record<string, any>, error?: Error, userId?: string) =>
  groupingErrorHandler.log(LogLevel.ERROR, category, message, context, error, userId);

export const logFatal = (category: string, message: string, context?: Record<string, any>, error?: Error, userId?: string) =>
  groupingErrorHandler.log(LogLevel.FATAL, category, message, context, error, userId);

/**
 * Decorator for automatic error handling
 */
export function withErrorHandling(
  component: string,
  operation: string,
  fallbackValue?: any
) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await groupingErrorHandler.executeWithRetry(
          () => originalMethod.apply(this, args),
          { component, operation }
        );
      } catch (error) {
        if (fallbackValue !== undefined) {
          logWarn(
            'decorator',
            `Method ${operation} failed, returning fallback value`,
            { component, operation, fallbackValue },
            error as Error
          );
          return fallbackValue;
        }
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Initialize error handling with custom configuration
 */
export function initializeErrorHandling(
  config?: Partial<ErrorHandlingConfig>
): GroupingErrorHandler {
  const handler = GroupingErrorHandler.getInstance(config);
  
  // Set up global error handling
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      handler.handleError(
        event.error || new Error(event.message),
        {
          component: 'global',
          operation: 'window.error',
          additionalData: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        }
      );
    });

    window.addEventListener('unhandledrejection', (event) => {
      handler.handleError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {
          component: 'global',
          operation: 'unhandledPromiseRejection'
        }
      );
    });
  }

  logInfo('system', 'Error handling system initialized');
  return handler;
}