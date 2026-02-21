# Smart Camera Integration - Testing Guide

## Overview
This document provides testing steps for the Smart Camera Integration feature in Nivaran.

**Note:** Smart Camera is **disabled by default** for security and privacy reasons. Users must explicitly enable it through the UI.

## Features Added

### 1. Smart Camera Service (`src/services/SmartCameraService.ts`)
- Auto-capture at configurable intervals (10 seconds for testing, configurable 1-60 minutes)
- Local storage with offline queue support
- AI-powered event detection using Perplexity Pro API
- Automatic report generation for detected civic issues
- Background processing when device comes online

### 2. Enhanced AI Service (`src/services/AIService.ts`)
- Enhanced prompts for Smart Camera automated detection
- Priority-based filtering for urgent civic issues
- Improved confidence scoring for automated systems

### 3. Enhanced Report Service (`src/services/ReportService.ts`)
- Smart Camera metadata support in reports
- Special tagging for Smart Camera generated reports
- AI confidence tracking

### 4. UI Components
- **SmartCameraPanel** (`src/components/SmartCameraPanel.tsx`): Full management interface
- **SmartCameraToggle** (`src/components/SmartCameraToggle.tsx`): Quick toggle button
- Visual indicators in report displays (HomePage, StatusPage, IssuesMap)

## Mobile Access Options

Smart Camera is now accessible through the following entry points:

### 1. Desktop Header (Desktop Only)
- **Location**: Top-right header on desktop
- **Appearance**: Full-sized button with status indicators
- **Access**: Click to open Smart Camera management panel

### 2. Profile Settings (All Devices)
- **Location**: Profile Page → App Settings section
- **Appearance**: Inline toggle with camera icon
- **Access**: Tap the toggle to open Smart Camera management panel

## Testing Steps

### 1. Smart Camera Functionality Test
1. In the Smart Camera panel:
   - Check that camera support is detected
   - **Note**: Capture interval is set to 10 seconds for testing purposes
   - Set AI confidence threshold to 70%
   - Enable location tracking
   - Click "Start Monitoring"

2. Grant camera permissions when prompted
3. The system should start capturing images **every 10 seconds**
4. Check the "Recent Captures" section for processing status

### 2. Report Generation Test
1. To test automatic report generation:
   - Point camera at a civic issue (garbage, pothole, etc.)
   - Wait for capture and AI processing
   - Check if a report is automatically created
   - Look for "📸 Smart Camera" tags in reports

### 3. Visual Indicators Test
1. Check HomePage for Smart Camera reports with purple badges
2. Check StatusPage for Smart Camera indicators
3. Check IssuesMap for Smart Camera markers in popups

### 4. Demo Fallback Test
1. Upload an image named "image1.jpeg" through normal report flow
2. Verify the fallback data fills in automatically with 5-9 second delay
3. Confirm all existing flows remain unaffected

## Configuration Options

### Smart Camera Config
- **Capture Interval**: 10 seconds (for testing), configurable 1-60 minutes
- **AI Confidence Threshold**: 0.1-1.0 (default: 0.7)
- **Auto Upload**: Enable/disable (default: enabled)
- **Location Tracking**: Enable/disable (default: enabled)
- **Priority Filter**: Which priority levels trigger reports (default: Medium, High, Urgent)

### Storage
- Captures stored in localStorage with 50-item limit
- Configuration persisted in localStorage
- Works offline with sync when online

## Expected Behavior

### Device-Specific Camera Access
- **Desktop**: Uses default webcam (typically front-facing)
- **Mobile**: Uses rear camera (`environment` facing mode) for better civic issue detection
- **Detection**: Automatically detects device type based on user agent, screen size, and touch capabilities

### Normal Operation
1. Camera captures image every configured interval
2. AI analyzes image for civic issues
3. If issue detected with sufficient confidence:
   - Automatic report created
   - Tagged as Smart Camera report
   - Shows in all report views with special indicators
4. Statistics updated in real-time

### Error Handling
- Camera permission denied: Shows specific error message with guidance
- Network failures: Queue captures for later processing
- AI processing failures: Log error, continue capturing
- Storage limits: Auto-cleanup old captures
- Device detection: Fallback to generic camera if device type unclear

## Architecture

### Non-Breaking Design
- All existing Nivaran flows remain unchanged
- Smart Camera is additive functionality only
- Existing report creation, display, and management unaffected
- Progressive enhancement approach

### Modular Components
- Services can be imported independently
- UI components can be placed anywhere
- Configuration is self-contained
- No dependencies on external libraries

## Troubleshooting

### Smart Camera Not Working
1. Check browser camera support
2. Verify camera permissions granted
3. Check console for errors
4. Ensure HTTPS (required for camera access)
5. **Desktop**: Check if webcam is available and not blocked by other applications
6. **Mobile**: Check if rear camera is accessible and not obstructed

### Permission Errors
- **"Camera permission denied"**: Allow camera access when prompted by browser
- **"No camera found"**: Check if camera hardware is working and not disabled
- **"Camera is already in use"**: Close other applications using the camera
- **"Camera access blocked due to security restrictions"**: Ensure using HTTPS and not HTTP

### Device-Specific Issues
- **Desktop**: If webcam doesn't work, try a different browser or check camera settings
- **Mobile**: Ensure rear camera is not covered and app has necessary permissions
- **Detection Issues**: If wrong camera is used, check device detection logic in console

### Reports Not Being Created
1. Check AI confidence threshold setting
2. Verify priority filter settings
3. Check network connectivity
4. Review recent captures for processing status

### Performance Issues
1. Reduce capture frequency
2. Clear old capture data
3. Check image size/quality settings

## Integration Verification Checklist

- [ ] Smart Camera button appears on homepage
- [ ] Smart Camera panel opens and closes properly
- [ ] Camera permissions requested and handled
- [ ] Capture interval configuration works
- [ ] AI analysis processes captures
- [ ] Reports created automatically when criteria met
- [ ] Smart Camera tags appear in all report views
- [ ] Existing manual reporting flows unaffected
- [ ] Offline/online sync working
- [ ] Statistics display correctly
- [ ] Error states handled gracefully