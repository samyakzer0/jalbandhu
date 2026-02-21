/**
 * Ocean Smart Camera Integration Service
 * Simulates IoT marine monitoring cameras with user mobile devices for automatic ocean hazard detection
 * 
 * Features:
 * - Auto-capture at configurable intervals for coastal surveillance
 * - Local storage with offline queue for remote ocean monitoring
 * - Background processing when online
 * - AI-powered marine hazard detection
 * - Automatic ocean hazard alert generation
 */

import { getCurrentLocation } from './ReportService';
import { analyzeImage } from './AIService';
import { submitReport } from './ReportService';

// Ocean Smart Camera configuration interface
export interface SmartCameraConfig {
  enabled: boolean;
  captureIntervalMinutes: number; // Ocean scan interval in minutes (can be fractional for testing, e.g., 1/6 = 10 seconds)
  autoUpload: boolean; // Auto upload marine hazard alerts when online
  aiEventDetection: boolean; // Enable AI ocean hazard detection
  confidenceThreshold: number; // Minimum AI confidence (0-1) to create ocean hazard alert
  priorityFilter: string[]; // Only create alerts for these priorities ['High', 'Urgent']
  locationTracking: boolean; // Enable coastal position tracking with each capture
}

// Ocean Smart Camera capture data interface
export interface SmartCameraCaptureData {
  id: string;
  imageData: string; // Base64 image data
  timestamp: string; // ISO timestamp
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
  } | null;
  uploaded: boolean; // Whether this ocean hazard detection has been uploaded
  processed: boolean; // Whether AI marine hazard analysis is complete
  aiResult?: {
    title: string;
    category: string;
    description: string;
    confidence: number;
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  };
  reportId?: string; // If an ocean hazard alert was created from this capture
  error?: string; // Any error during ocean hazard processing
}

class SmartCameraService {
  private config: SmartCameraConfig;
  private captureTimer: NodeJS.Timeout | null = null;
  private isCapturing = false;
  private videoStream: MediaStream | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private isProcessing = false;
  private isMobileDevice: boolean;

  // Default ocean monitoring configuration
  private defaultConfig: SmartCameraConfig = {
    enabled: true,
    captureIntervalMinutes: 1, // 1 minute for testing
    autoUpload: true,
    aiEventDetection: true,
    confidenceThreshold: 0.7, // 70% confidence minimum
    priorityFilter: ['Medium', 'High', 'Urgent'], // Create reports for these priorities
    locationTracking: true
  };

  constructor() {
    console.log('Ocean Smart Camera: Initializing Ocean Smart Camera Service...');
    
    // Detect if we're on a mobile device
    this.isMobileDevice = this.detectMobileDevice();
    console.log(`Ocean Smart Camera: Detected device type: ${this.isMobileDevice ? 'mobile' : 'desktop'}`);
    
    // Load configuration from localStorage or use defaults
    this.config = this.loadConfig();
    console.log('Ocean Smart Camera: Loaded configuration:', this.config);
    
    // Create canvas for image capture
    this.canvas = document.createElement('canvas');
    this.canvas.width = 800;
    this.canvas.height = 600;
    console.log('Ocean Smart Camera: Created canvas for image capture');

    // Listen for online/offline events
    window.addEventListener('online', this.processQueuedCaptures.bind(this));
    
    // Process any queued captures on initialization
    this.processQueuedCaptures();
    
    console.log('Ocean Smart Camera: Initialization complete');
  }

  /**
   * Get current Ocean Smart Camera configuration
   */
  getConfig(): SmartCameraConfig {
    return { ...this.config };
  }

  /**
   * Detect if the current device is mobile
   */
  private detectMobileDevice(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = ['android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
    
    // Check user agent
    const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
    
    // Check screen size and touch capability
    const isSmallScreen = window.innerWidth <= 768;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    return isMobileUA || (isSmallScreen && hasTouch);
  }

  /**
   * Update Smart Camera configuration
   */
  updateConfig(newConfig: Partial<SmartCameraConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();

    // Restart capture if configuration changed
    if (this.config.enabled) {
      this.startCapture();
    } else {
      this.stopCapture();
    }
  }

  /**
   * Start Smart Camera capture
   */
  async startCapture(): Promise<boolean> {
    try {
      console.log('SmartCamera: Starting Smart Camera capture...');
      
      // Request camera permissions
      await this.requestCameraPermission();

      // Stop existing capture
      this.stopCapture();

      // Start capture timer
      const intervalMs = this.config.captureIntervalMinutes * 60 * 1000;
      console.log(`SmartCamera: Setting up timer with interval: ${intervalMs}ms (${this.config.captureIntervalMinutes} minutes)`);
      
      this.captureTimer = setInterval(() => {
        console.log('SmartCamera: Timer triggered, attempting capture...');
        this.captureImage();
      }, intervalMs);

      // Take initial capture immediately
      console.log('SmartCamera: Taking initial capture...');
      this.captureImage();

      console.log(`SmartCamera: Started with ${this.config.captureIntervalMinutes} minute intervals (${intervalMs}ms)`);
      return true;
    } catch (error) {
      console.error('SmartCamera: Failed to start Smart Camera:', error);
      return false;
    }
  }

  /**
   * Stop Smart Camera capture
   */
  stopCapture(): void {
    console.log('Stopping Smart Camera capture...');
    
    if (this.captureTimer) {
      clearInterval(this.captureTimer);
      this.captureTimer = null;
    }

    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }

    this.isCapturing = false;
  }

  /**
   * Request camera permission and set up video stream
   */
  private async requestCameraPermission(): Promise<void> {
    try {
      console.log(`SmartCamera: isMobileDevice detected as: ${this.isMobileDevice}`);
      
      // Choose camera constraints based on device type
      const constraints: MediaStreamConstraints = {
        video: this.isMobileDevice ? {
          // Mobile: prefer rear camera
          facingMode: 'environment',
          width: { ideal: 800 },
          height: { ideal: 600 }
        } : {
          // Desktop: use default webcam (usually front-facing)
          width: { ideal: 800 },
          height: { ideal: 600 }
        }
      };

      console.log(`SmartCamera: Requesting camera access for ${this.isMobileDevice ? 'mobile' : 'desktop'} device with constraints:`, constraints);
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }

      this.videoStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('SmartCamera: Camera permission granted successfully');
      console.log(`SmartCamera: Video stream tracks: ${this.videoStream.getTracks().length}`);
      
      // Log track details
      this.videoStream.getTracks().forEach((track, index) => {
        console.log(`SmartCamera: Track ${index}: ${track.kind}, enabled: ${track.enabled}, readyState: ${track.readyState}`);
      });
      
    } catch (error) {
      console.error('SmartCamera: Camera permission denied or not available:', error);
      
      // Provide specific error messages based on error type
      let errorMessage = 'Camera access required for Smart Camera feature';
      
      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotAllowedError':
            errorMessage = 'Camera permission denied. Please allow camera access and try again.';
            break;
          case 'NotFoundError':
            errorMessage = 'No camera found on this device.';
            break;
          case 'NotReadableError':
            errorMessage = 'Camera is already in use by another application.';
            break;
          case 'OverconstrainedError':
            errorMessage = 'Camera does not support the required settings.';
            break;
          case 'SecurityError':
            errorMessage = 'Camera access blocked due to security restrictions. Please use HTTPS.';
            break;
          default:
            errorMessage = `Camera error: ${error.message}`;
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Capture an image from the camera
   */
  private async captureImage(): Promise<void> {
    console.log(`SmartCamera: captureImage called - isCapturing: ${this.isCapturing}, videoStream: ${!!this.videoStream}, canvas: ${!!this.canvas}`);
    
    // Check if videoStream is still active
    if (this.videoStream) {
      const tracks = this.videoStream.getTracks();
      const activeTracks = tracks.filter(track => track.readyState === 'live');
      console.log(`SmartCamera: VideoStream tracks: ${tracks.length}, active tracks: ${activeTracks.length}`);
      
      if (activeTracks.length === 0) {
        console.log('SmartCamera: No active video tracks, stream may have ended');
        this.videoStream = null;
      }
    }
    
    if (this.isCapturing || !this.videoStream || !this.canvas) {
      console.log('SmartCamera: Skipping capture - conditions not met');
      
      // If videoStream is missing, try to re-request camera permission
      if (!this.videoStream && this.config.enabled) {
        console.log('SmartCamera: VideoStream lost, attempting to re-request camera permission...');
        try {
          await this.requestCameraPermission();
          console.log('SmartCamera: Camera permission re-requested successfully');
        } catch (error) {
          console.error('SmartCamera: Failed to re-request camera permission:', error);
          return;
        }
      } else {
        return;
      }
    }

    try {
      this.isCapturing = true;
      console.log('SmartCamera: Starting image capture...');

      // Create video element
      const video = document.createElement('video');
      video.srcObject = this.videoStream;
      video.autoplay = true;
      video.muted = true;

      console.log('SmartCamera: Waiting for video metadata...');

      // Wait for video to be ready
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Video metadata timeout'));
        }, 5000);

        video.onloadedmetadata = () => {
          clearTimeout(timeout);
          console.log(`SmartCamera: Video ready - dimensions: ${video.videoWidth}x${video.videoHeight}`);
          video.play();
          resolve(void 0);
        };

        video.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('Video loading error'));
        };
      });

      // Small delay to ensure video is playing
      console.log('SmartCamera: Waiting for video to start playing...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Draw video frame to canvas
      const ctx = this.canvas!.getContext('2d');
      if (!ctx) {
        console.error('SmartCamera: Failed to get canvas context');
        return;
      }

      console.log('SmartCamera: Drawing video frame to canvas...');
      ctx.drawImage(video, 0, 0, this.canvas!.width, this.canvas!.height);

      // Convert to base64
      const imageData = this.canvas!.toDataURL('image/jpeg', 0.8);
      console.log(`SmartCamera: Image captured, data length: ${imageData.length}`);

      // Get current location if enabled
      let location = null;
      if (this.config.locationTracking) {
        try {
          console.log('SmartCamera: Getting location...');
          location = await getCurrentLocation();
        } catch (error) {
          console.warn('SmartCamera: Failed to get location:', error);
        }
      }

      // Create capture data
      const captureData: SmartCameraCaptureData = {
        id: `smart_capture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        imageData,
        timestamp: new Date().toISOString(),
        location,
        uploaded: false,
        processed: false
      };

      // Store capture data locally
      console.log('SmartCamera: Storing capture data...');
      this.storeCaptureData(captureData);

      console.log(`SmartCamera: Image captured and stored with ID: ${captureData.id}`);

      // Process if online
      if (navigator.onLine) {
        console.log('SmartCamera: Processing capture data...');
        this.processCaptureData(captureData);
      } else {
        console.log('SmartCamera: Offline, queueing for later processing');
      }

      console.log('SmartCamera: Image capture completed successfully');

      // Clean up video element
      video.remove();
    } catch (error) {
      console.error('SmartCamera: Error capturing image:', error);
    } finally {
      this.isCapturing = false;
      console.log('SmartCamera: Capture process finished');
    }
  }

  /**
   * Store capture data in localStorage
   */
  private storeCaptureData(captureData: SmartCameraCaptureData): void {
    try {
      const existingData = this.getStoredCaptureData();
      existingData.push(captureData);

      // Keep only last 50 captures to prevent storage overflow
      if (existingData.length > 50) {
        existingData.splice(0, existingData.length - 50);
      }

      localStorage.setItem('ocean_smart_camera_captures', JSON.stringify(existingData));
    } catch (error) {
      console.error('Error storing capture data:', error);
    }
  }

  /**
   * Get stored capture data from localStorage
   */
  private getStoredCaptureData(): SmartCameraCaptureData[] {
    try {
      const data = localStorage.getItem('ocean_smart_camera_captures');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading stored capture data:', error);
      return [];
    }
  }

  /**
   * Process capture data with AI and potentially create report
   */
  private async processCaptureData(captureData: SmartCameraCaptureData): Promise<void> {
    if (!this.config.aiEventDetection || captureData.processed) {
      return;
    }

    try {
      console.log(`Processing Smart Camera capture: ${captureData.id}`);

      // Analyze image with AI (mark as Smart Camera for enhanced detection)
      const aiResult = await analyzeImage(captureData.imageData, undefined, true);

      // Update capture data with AI result
      captureData.aiResult = aiResult;
      captureData.processed = true;

      // Check if we should create a report based on confidence and priority
      const shouldCreateReport = 
        aiResult.confidence >= this.config.confidenceThreshold &&
        this.config.priorityFilter.includes(aiResult.priority);

      if (shouldCreateReport && captureData.location) {
        console.log(`Creating Smart Camera report for detected: ${aiResult.title}`);

        try {
          // Create automatic report
          const reportResponse = await submitReport(
            `[Smart Camera] ${aiResult.title}`,
            `${aiResult.description}\n\n--- \n📸 Auto-detected by Smart Camera\n🤖 AI Confidence: ${(aiResult.confidence * 100).toFixed(1)}%\n📍 Location: ${captureData.location.address}`,
            aiResult.category,
            captureData.location,
            captureData.imageData,
            'smart_camera_system', // Special user ID for Smart Camera
            aiResult.priority,
            // Smart Camera metadata
            {
              isSmartCamera: true,
              aiConfidence: aiResult.confidence,
              captureId: captureData.id
            }
          );

          if (reportResponse.success) {
            captureData.reportId = reportResponse.report_id;
            captureData.uploaded = true;
            
            console.log(`✅ Smart Camera report created successfully: ${reportResponse.report_id}`);
            console.log(`Report details:`, reportResponse);
            
            // Dispatch custom event for UI updates
            window.dispatchEvent(new CustomEvent('smartCameraReportCreated', {
              detail: {
                captureData,
                reportId: reportResponse.report_id,
                aiResult
              }
            }));
          } else {
            console.error(`❌ Smart Camera report creation failed:`, reportResponse);
            captureData.error = `Report creation failed: ${reportResponse.message || 'Unknown error'}`;
          }
        } catch (reportError) {
          console.error(`❌ Smart Camera report creation threw error:`, reportError);
          captureData.error = `Report creation error: ${reportError instanceof Error ? reportError.message : 'Unknown error'}`;
        }
      } else {
        console.log(`❌ Smart Camera capture did not meet criteria for report creation:`, {
          shouldCreateReport,
          hasLocation: !!captureData.location,
          confidence: aiResult.confidence,
          threshold: this.config.confidenceThreshold,
          priority: aiResult.priority,
          priorityFilter: this.config.priorityFilter,
          locationData: captureData.location
        });
      }

      // Update stored data
      this.updateStoredCaptureData(captureData);

    } catch (error) {
      console.error('Error processing Smart Camera capture:', error);
      captureData.error = error instanceof Error ? error.message : 'Processing failed';
      this.updateStoredCaptureData(captureData);
    }
  }

  /**
   * Update stored capture data
   */
  private updateStoredCaptureData(updatedCapture: SmartCameraCaptureData): void {
    try {
      const allData = this.getStoredCaptureData();
      const index = allData.findIndex(capture => capture.id === updatedCapture.id);
      
      if (index !== -1) {
        allData[index] = updatedCapture;
        localStorage.setItem('ocean_smart_camera_captures', JSON.stringify(allData));
      }
    } catch (error) {
      console.error('Error updating stored capture data:', error);
    }
  }

  /**
   * Process queued captures when coming back online
   */
  private async processQueuedCaptures(): Promise<void> {
    if (this.isProcessing || !navigator.onLine) {
      return;
    }

    try {
      this.isProcessing = true;
      const queuedCaptures = this.getStoredCaptureData().filter(
        capture => !capture.processed || (!capture.uploaded && capture.reportId)
      );

      console.log(`Processing ${queuedCaptures.length} queued Smart Camera captures...`);

      for (const capture of queuedCaptures) {
        await this.processCaptureData(capture);
        // Small delay between processing to avoid overwhelming the APIs
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log('Finished processing queued Smart Camera captures');
    } catch (error) {
      console.error('Error processing queued captures:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get Smart Camera statistics
   */
  getStatistics(): {
    totalCaptures: number;
    processedCaptures: number;
    reportsCreated: number;
    queuedCaptures: number;
    isEnabled: boolean;
    lastCaptureTime: string | null;
  } {
    const captureData = this.getStoredCaptureData();
    const processedCaptures = captureData.filter(c => c.processed);
    const reportsCreated = captureData.filter(c => c.reportId);
    const queuedCaptures = captureData.filter(c => !c.processed || (!c.uploaded && c.reportId));
    
    return {
      totalCaptures: captureData.length,
      processedCaptures: processedCaptures.length,
      reportsCreated: reportsCreated.length,
      queuedCaptures: queuedCaptures.length,
      isEnabled: this.config.enabled,
      lastCaptureTime: captureData.length > 0 ? captureData[captureData.length - 1].timestamp : null
    };
  }

  /**
   * Get recent Smart Camera captures for display
   */
  getRecentCaptures(limit?: number): SmartCameraCaptureData[] {
    const allCaptures = this.getStoredCaptureData()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // If no limit specified, return all captures for testing
    const result = limit ? allCaptures.slice(0, limit) : allCaptures;
    console.log(`SmartCamera: getRecentCaptures called, returning ${result.length} captures (limit: ${limit || 'none'})`);
    return result;
  }

  /**
   * Clear all stored capture data
   */
  clearCaptureData(): void {
    localStorage.removeItem('ocean_smart_camera_captures');
    console.log('Smart Camera capture data cleared');
  }

  /**
   * Delete a specific capture by ID
   */
  deleteCapture(captureId: string): boolean {
    try {
      const allCaptures = this.getStoredCaptureData();
      const filteredCaptures = allCaptures.filter(capture => capture.id !== captureId);
      
      if (filteredCaptures.length < allCaptures.length) {
        localStorage.setItem('ocean_smart_camera_captures', JSON.stringify(filteredCaptures));
        console.log(`Smart Camera capture ${captureId} deleted`);
        return true;
      } else {
        console.warn(`Smart Camera capture ${captureId} not found`);
        return false;
      }
    } catch (error) {
      console.error('Error deleting capture:', error);
      return false;
    }
  }

  /**
   * Load configuration from localStorage
   */
  private loadConfig(): SmartCameraConfig {
    try {
      const stored = localStorage.getItem('ocean_smart_camera_config');
      if (stored) {
        const parsedConfig = JSON.parse(stored);
        return { ...this.defaultConfig, ...parsedConfig };
      }
    } catch (error) {
      console.error('Error loading Smart Camera config:', error);
    }
    return { ...this.defaultConfig };
  }

  /**
   * Save configuration to localStorage
   */
  private saveConfig(): void {
    try {
            localStorage.setItem('ocean_smart_camera_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Error saving Smart Camera config:', error);
    }
  }

  /**
   * Check if Smart Camera is supported
   */
  static isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopCapture();
    window.removeEventListener('online', this.processQueuedCaptures.bind(this));
  }
}

// Create singleton instance
export const smartCameraService = new SmartCameraService();

// Export types and service
export default smartCameraService;