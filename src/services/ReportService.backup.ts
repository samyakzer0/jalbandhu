import { supabase } from './supabase.ts';
import { reverseGeocode } from './GeocodingService';
import { proofOfReportService, type ProofCreationResult } from './ProofOfReportServiceSimplified';

// List of major cities for mock data
export const majorCities = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", 
  "Kolkata", "Ahmedabad", "Pune", "Jaipur", "Lucknow",
  "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal",
  "Visakhapatnam", "Patna", "Vadodara", "Ludhiana", "Agra",
  "New York", "London", "Tokyo", "Shanghai", "Paris",
  "Singapore", "Dubai", "Sydney", "Toronto", "Berlin"
];

// Report data model
export interface ReportData {
  report_id: string;
  title: string;
  description: string;
  category: string;
  hazard_type: string; // Ocean hazard type classification
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  city: string; // Add city field
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'; // Add priority field
  image_url: string;
  status: 'Submitted' | 'In Review' | 'Forwarded' | 'Resolved';
  created_at: string;
  updated_at: string;
  user_id: string;
  // Smart Camera fields
  is_smart_camera_report?: boolean; // Flag for Smart Camera generated reports
  ai_confidence?: number; // AI confidence score for Smart Camera reports
  smart_camera_capture_id?: string; // Reference to Smart Camera capture
  // Proof-of-report fields
  proof_cid?: string;
  proof_timestamp?: string;
  proof_created_at?: string;
  proof_verification_status?: 'pending' | 'verified' | 'failed';
  // Status history for timeline
  status_history?: Array<{
    status: 'Submitted' | 'In Review' | 'Forwarded' | 'Resolved';
    timestamp: string;
    actor?: string;
    notes?: string;
  }>;
}

interface ReportSubmissionResponse {
  success: boolean;
  report_id: string;
  message: string;
  proof_cid?: string;
  proof_status?: 'created' | 'failed' | 'not_attempted';
  proof_error?: string;
}

// Generate a unique reference number for each report
// Format: SG-{Category Prefix}-{Date}-{Random Number}
export const generateReferenceNumber = (category: string): string => {
  const categoryPrefixes: { [key: string]: string } = {
    'Tsunami Events': 'TS',
    'Storm Surge': 'SS',
    'High Waves': 'HW',
    'Swell Surges': 'SW',
    'Coastal Currents': 'CC',
    'Coastal Erosion': 'CE',
    'Marine Debris': 'MD',
    'Unusual Sea Behavior': 'USB',
    'Coastal Infrastructure': 'CI',
    'Others': 'OT'
  };

  // Make case-insensitive lookup
  const normalizedCategory = Object.keys(categoryPrefixes).find(
    key => key.toLowerCase() === category.toLowerCase()
  ) || category;
  const prefix = categoryPrefixes[normalizedCategory] || 'OT';
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const randomNum = String(Math.floor(Math.random() * 10000)).padStart(4, '0');

  return `SG-${prefix}-${dateStr}-${randomNum}`;
};

// Map ocean hazard categories to hazard types for database consistency
export const getHazardTypeFromCategory = (category: string): string => {
  const categoryToHazardType: { [key: string]: string } = {
    'Tsunami Events': 'tsunami',
    'Storm Surge': 'storm_surge', 
    'High Waves': 'high_waves',
    'Swell Surges': 'swell_surge',
    'Coastal Currents': 'coastal_current',
    'Coastal Erosion': 'coastal_erosion',
    'Marine Debris': 'marine_debris',
    'Unusual Sea Behavior': 'unusual_sea_behavior',
    'Coastal Infrastructure': 'infrastructure_damage',
    'Others': 'general_hazard'
  };

  // Make case-insensitive lookup
  const normalizedCategory = Object.keys(categoryToHazardType).find(
    key => key.toLowerCase() === category.toLowerCase()
  ) || category;
  
  return categoryToHazardType[normalizedCategory] || 'general_hazard';
};

// Convert image data URL to a file and upload it to Supabase Storage
const uploadImage = async (imageData: string, reportId: string): Promise<string> => {
  try {
    // Check if Supabase is configured
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.warn('Supabase not configured, using fallback URL');
      return `https://via.placeholder.com/800x600?text=Image+${reportId}`;
    }

    // Convert base64 to blob
    const base64Data = imageData.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid image data format');
    }

    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, { type: 'image/jpeg' });

    // Create unique filename with timestamp
    const timestamp = Date.now();
    const fileName = `reports/${reportId}/${timestamp}.jpg`;

    console.log('Uploading image to Supabase storage:', fileName);

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('report-images')
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);

      // If bucket doesn't exist, try to create it
      if (error.message.includes('bucket') || error.message.includes('not found')) {
        console.log('Attempting to create storage bucket...');
        try {
          const { error: createError } = await supabase.storage.createBucket('report-images', {
            public: true,
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
            fileSizeLimit: 10485760 // 10MB
          });

          if (createError) {
            console.error('Failed to create bucket:', createError);
          } else {
            console.log('Bucket created successfully, retrying upload...');
            // Retry upload after bucket creation
            const { error: retryError } = await supabase.storage
              .from('report-images')
              .upload(fileName, blob, {
                cacheControl: '3600',
                upsert: false
              });

            if (retryError) {
              throw retryError;
            }

            // Get public URL for the uploaded image
            const { data: urlData } = supabase.storage
              .from('report-images')
              .getPublicUrl(fileName);

            console.log('Image uploaded successfully:', urlData.publicUrl);
            return urlData.publicUrl;
          }
        } catch (bucketError) {
          console.error('Bucket creation failed:', bucketError);
        }
      }

      throw error;
    }

    // Get public URL for the uploaded image
    const { data: urlData } = supabase.storage
      .from('report-images')
      .getPublicUrl(fileName);

    if (!urlData.publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }

    console.log('Image uploaded successfully:', urlData.publicUrl);
    return urlData.publicUrl;

  } catch (error) {
    console.error('Error uploading image:', error);

    // Multiple fallback options
    try {
      // Try Cloudinary as secondary option if configured
      if (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME &&
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET) {
        console.log('Attempting Cloudinary upload as fallback...');
        const cloudinaryUrl = await uploadToCloudinary(imageData, reportId);
        return cloudinaryUrl;
      }
    } catch (cloudinaryError) {
      console.error('Cloudinary fallback failed:', cloudinaryError);
    }

    // Final fallback - return a placeholder
    console.warn('All upload methods failed, using placeholder');
    return `https://via.placeholder.com/800x600?text=Image+${reportId}`;
  }
};

// Fallback upload to Cloudinary
const uploadToCloudinary = async (imageData: string, reportId: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', dataURLToBlob(imageData));
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  formData.append('public_id', `jalBandhu-${reportId}-${Date.now()}`);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData
    }
  );

  if (!response.ok) {
    throw new Error('Cloudinary upload failed');
  }

  const data = await response.json();
  return data.secure_url;
};

// Helper function to convert data URL to blob
const dataURLToBlob = (dataURL: string): Blob => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

// Generate thumbnail URL from full image URL
export const getThumbnailUrl = (imageUrl: string, size: number = 300): string => {
  // If no image URL provided, return empty string
  if (!imageUrl || imageUrl.trim() === '') {
    return '';
  }

  // If it's a placeholder URL, return it as-is (no thumbnail needed)
  if (imageUrl.includes('via.placeholder.com')) {
    return imageUrl;
  }

  // If it's a Supabase URL, try to get thumbnail
  if (imageUrl.includes('supabase')) {
    // For Supabase, we can use transform parameters
    // Note: This requires Supabase Image Transformation to be enabled
    return `${imageUrl}?width=${size}&height=${size}&resize=contain`;
  }

  // If it's a Cloudinary URL, use Cloudinary transformations
  if (imageUrl.includes('cloudinary')) {
    const urlParts = imageUrl.split('/upload/');
    if (urlParts.length === 2) {
      return `${urlParts[0]}/upload/w_${size},h_${size},c_fill/${urlParts[1]}`;
    }
  }

  // For other URLs or if transformations aren't available, return original
  return imageUrl;
};

// Get user's current location
export const getCurrentLocation = (): Promise<{ lat: number, lng: number, address: string, city: string }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Use our free geocoding service instead of Google Maps
          console.log('Getting location using free geocoding service...');
          const geocodeResult = await reverseGeocode(lat, lng);

          resolve({
            lat: lat,
            lng: lng,
            address: geocodeResult.address,
            city: geocodeResult.city
          });
        } catch (error) {
          console.warn('Geocoding failed, using coordinates only:', error);
          // If geocoding fails, still return the coordinates
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: `Lat: ${position.coords.latitude.toFixed(6)}, Lng: ${position.coords.longitude.toFixed(6)}`,
            city: "Unknown"
          });
        }
      },
      (error) => {
        reject(error);
      }
    );
  });
};

// Submit a report to Supabase
export const submitReport = async (
  title: string,
  description: string,
  category: string,
  location: { lat: number, lng: number, address: string, city: string },
  imageData: string | null,
  userId: string = 'anon_user',
  priority: 'Low' | 'Medium' | 'High' | 'Urgent' = 'Medium',
  smartCameraData?: { // Optional Smart Camera metadata
    isSmartCamera?: boolean;
    aiConfidence?: number;
    captureId?: string;
  },
  oceanMetadata?: { // Ocean-specific metadata for SagarSetu
    waveHeightEstimate?: number;
    waveHeightCategory?: string;
    waterLevelChange?: string;
    currentStrength?: string;
    tideInformation?: string;
    windSpeed?: number;
    windDirection?: string;
    visibilityKm?: number;
    waterTemperature?: number;
    safetyThreatLevel?: string;
    peopleAtRisk?: number;
    infrastructureImpact?: string;
    fishingActivityAffected?: boolean;
    shippingLanesAffected?: boolean;
  }
): Promise<ReportSubmissionResponse> => {
  try {
    const reportId = generateReferenceNumber(category);
    const timestamp = new Date().toISOString();
    
    // Upload image if available
    let imageUrl = '';
    if (imageData) {
      imageUrl = await uploadImage(imageData, reportId);
    }

    // Standardize category case to match our ocean hazard categories
    const standardCategories = ['Tsunami Events', 'Storm Surge', 'High Waves', 'Swell Surges', 'Coastal Currents', 'Coastal Erosion', 'Marine Debris', 'Unusual Sea Behavior', 'Coastal Infrastructure', 'Others'];
    const normalizedCategory = standardCategories.find(
      c => c.toLowerCase() === category.toLowerCase()
    ) || category;
    
    // Extract city from address if not provided
    let city = location.city || "Unknown";
    if (city === "Unknown" && location.address) {
      // Try to extract city from address as fallback
      const addressParts = location.address.split(',').map(part => part.trim());
      if (addressParts.length > 1) {
        // Assume second-to-last part might be the city in many address formats
        city = addressParts[addressParts.length - 2];
      }
    }
    
    // Prepare proof generation variables
    let proofCid: string | undefined;
    let proofStatus: 'created' | 'failed' | 'not_attempted' = 'not_attempted';
    let proofError: string | undefined;
    let proofTimestamp: string | undefined;
    
    // Generate proof-of-report asynchronously (fail-safe)
    try {
      console.log(`Creating proof-of-report for ${reportId} in ${city}...`);
      const proofResult: ProofCreationResult = await proofOfReportService.createProofOfReport(
        reportId, 
        city
      );
      
      if (proofResult.success && proofResult.cid) {
        proofCid = proofResult.cid;
        proofTimestamp = proofResult.proof_timestamp;
        proofStatus = 'created';
        console.log(`Proof-of-report created successfully for ${reportId}: ${proofCid}`);
      } else {
        proofStatus = 'failed';
        proofError = proofResult.error || 'Unknown proof creation error';
        console.warn(`Proof-of-report creation failed for ${reportId}:`, proofError);
      }
    } catch (error) {
      proofStatus = 'failed';
      proofError = error instanceof Error ? error.message : 'Unknown proof error';
      console.error(`Proof-of-report creation failed for ${reportId}:`, error);
      // Continue with report submission even if proof fails
    }
    
    const reportData = {
      report_id: reportId,
      title,
      description,
      category: normalizedCategory, // Use the normalized category with proper case
      hazard_type: getHazardTypeFromCategory(normalizedCategory), // Map category to hazard type
      location,
      city, // Add city to report data
      priority, // Add priority to report data
      image_url: imageUrl,
      status: 'Submitted',
      created_at: timestamp,
      updated_at: timestamp,
      user_id: userId,
      // Smart Camera fields
      is_smart_camera_report: smartCameraData?.isSmartCamera || false,
      ai_confidence: smartCameraData?.aiConfidence || null,
      smart_camera_capture_id: smartCameraData?.captureId || null,
      // Ocean-specific metadata for SagarSetu
      wave_height_estimated: oceanMetadata?.waveHeightEstimate || null,
      wave_height_category: oceanMetadata?.waveHeightCategory || null,
      water_level_change: oceanMetadata?.waterLevelChange || null,
      current_strength: oceanMetadata?.currentStrength || null,
      tide_information: oceanMetadata?.tideInformation || null,
      wind_speed_kmh: oceanMetadata?.windSpeed || null,
      wind_direction: oceanMetadata?.windDirection || null,
      visibility_km: oceanMetadata?.visibilityKm || null,
      water_temperature_celsius: oceanMetadata?.waterTemperature || null,
      safety_threat_level: oceanMetadata?.safetyThreatLevel || 'moderate',
      people_at_risk_count: oceanMetadata?.peopleAtRisk || 0,
      infrastructure_impact: oceanMetadata?.infrastructureImpact || 'minimal',
      fishing_activity_affected: oceanMetadata?.fishingActivityAffected || false,
      shipping_lanes_affected: oceanMetadata?.shippingLanesAffected || false,
      // Add proof fields (will be null if proof creation failed)
      proof_cid: proofCid || null,
      proof_timestamp: proofTimestamp || null,
      proof_verification_status: proofCid ? 'pending' : null,
      // Initialize status history
      status_history: [{
        status: 'Submitted',
        timestamp: timestamp,
        actor: smartCameraData?.isSmartCamera ? 'Smart Camera System' : 'Citizen',
        notes: smartCameraData?.isSmartCamera 
          ? `Auto-detected civic issue (AI confidence: ${smartCameraData.aiConfidence ? (smartCameraData.aiConfidence * 100).toFixed(1) + '%' : 'N/A'})`
          : 'Initial grievance submission'
      }]
    };

    // Insert into Supabase if configured
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.log('Submitting report to Supabase:', reportData.report_id);
      const { error } = await supabase
        .from('reports')
        .insert([reportData])
        .select();

      if (error) {
        console.error('Supabase insert error:', error);
        // Don't throw - continue with localStorage fallback
      } else {
        console.log('Report successfully submitted to Supabase with proof data');
      }
    } else {
      console.log('Supabase not configured, using localStorage only');
    }
    
    // Always save to localStorage for backup and local development
    try {
      const existingReports = JSON.parse(localStorage.getItem('jalBandhu_reports') || '[]');
      console.log(`Found ${existingReports.length} existing reports in localStorage`);
      existingReports.push(reportData);
      localStorage.setItem('jalBandhu_reports', JSON.stringify(existingReports));
      console.log(`Report ${reportData.report_id} saved to localStorage with proof data`);
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }

    // Return response with proof information
    return {
      success: true,
      report_id: reportId,
      message: proofCid 
        ? 'Report submitted successfully with tamper-proof verification'
        : 'Report submitted successfully (proof creation failed but report is saved)',
      proof_cid: proofCid,
      proof_status: proofStatus,
      proof_error: proofError
    };
  } catch (error) {
    console.error('Error submitting report:', error);
    throw new Error('Failed to submit report');
  }
};

// Get all reports for the current user
export const getUserReports = async (userId: string = 'anon_user'): Promise<ReportData[]> => {
  try {
    // Try to get from Supabase first
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.log(`Fetching reports for user: ${userId} from Supabase`);
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} reports in Supabase`);
      return data as ReportData[];
    } else {
      console.log('Supabase credentials not found, using localStorage');
    }
    
    // Fallback to localStorage
    const storageData = localStorage.getItem('jalBandhu_reports');
    console.log(`LocalStorage data exists: ${!!storageData}`);
    const allReports: ReportData[] = JSON.parse(storageData || '[]');
    const filteredReports = allReports.filter(report => report.user_id === userId);
    console.log(`Found ${filteredReports.length} reports in localStorage for user ${userId}`);
    return filteredReports;
  } catch (error) {
    console.error('Error fetching user reports:', error);
    
    // Final fallback
    try {
      const allReports: ReportData[] = JSON.parse(localStorage.getItem('jalBandhu_reports') || '[]');
      return allReports.filter(report => report.user_id === userId);
    } catch (e) {
      console.error('Failed to parse localStorage data:', e);
      return [];
    }
  }
};

// Get all reports for admin by category
export const getReportsByCategory = async (category: string): Promise<ReportData[]> => {
  try {
    // Try to get from Supabase first
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.log(`Fetching reports for category: ${category} from Supabase`);
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .ilike('category', category) // Case-insensitive match
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} reports for category ${category} in Supabase`);
      return data as ReportData[];
    } else {
      console.log('Supabase credentials not found, using localStorage');
    }
    
    // Fallback to localStorage with case-insensitive comparison
    const storageData = localStorage.getItem('jalBandhu_reports');
    console.log(`LocalStorage data exists: ${!!storageData}`);
    const allReports: ReportData[] = JSON.parse(storageData || '[]');
    const filteredReports = allReports.filter(report => 
      report.category.toLowerCase() === category.toLowerCase()
    );
    console.log(`Found ${filteredReports.length} reports in localStorage for category ${category}`);
    return filteredReports;
  } catch (error) {
    console.error('Error fetching category reports:', error);
    
    // Final fallback
    try {
      const allReports: ReportData[] = JSON.parse(localStorage.getItem('jalBandhu_reports') || '[]');
      return allReports.filter(report => 
        report.category.toLowerCase() === category.toLowerCase()
      );
    } catch (e) {
      console.error('Failed to parse localStorage data:', e);
      return [];
    }
  }
};

// Get all reports for admin by city
export const getReportsByCity = async (city: string): Promise<ReportData[]> => {
  try {
    // Try to get from Supabase first
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.log(`Fetching reports for city: ${city} from Supabase`);
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .ilike('city', city) // Case-insensitive match
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} reports for city ${city} in Supabase`);
      return data as ReportData[];
    } else {
      console.log('Supabase credentials not found, using localStorage');
    }
    
    // Fallback to localStorage with case-insensitive comparison
    const storageData = localStorage.getItem('jalBandhu_reports');
    console.log(`LocalStorage data exists: ${!!storageData}`);
    const allReports: ReportData[] = JSON.parse(storageData || '[]');
    const filteredReports = allReports.filter(report => 
      report.city && report.city.toLowerCase().includes(city.toLowerCase())
    );
    console.log(`Found ${filteredReports.length} reports in localStorage for city ${city}`);
    return filteredReports;
  } catch (error) {
    console.error('Error fetching city reports:', error);
    
    // Final fallback
    try {
      const allReports: ReportData[] = JSON.parse(localStorage.getItem('jalBandhu_reports') || '[]');
      return allReports.filter(report => 
        report.city && report.city.toLowerCase().includes(city.toLowerCase())
      );
    } catch (e) {
      console.error('Failed to parse localStorage data:', e);
      return [];
    }
  }
};

// Get a specific report by ID
export const getReportById = async (reportId: string): Promise<ReportData | null> => {
  try {
    // Try to get from Supabase first
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('report_id', reportId)
        .single();
      
      if (error) throw error;
      return data as ReportData;
    }
    
    // Fallback to localStorage
    const allReports: ReportData[] = JSON.parse(localStorage.getItem('jalBandhu_reports') || '[]');
    const report = allReports.find(r => r.report_id === reportId);
    return report || null;
  } catch (error) {
    console.error('Error fetching report:', error);
    
    // Final fallback
    try {
      const allReports: ReportData[] = JSON.parse(localStorage.getItem('jalBandhu_reports') || '[]');
      const report = allReports.find(r => r.report_id === reportId);
      return report || null;
    } catch {
      return null;
    }
  }
};

// Get list of cities from all reports (for autocomplete)
export const getCityList = async (): Promise<string[]> => {
  try {
    // Try to get from Supabase first
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { data, error } = await supabase
        .from('reports')
        .select('city');
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Extract unique cities
      const cities = [...new Set(data?.map(report => report.city).filter(Boolean))];
      
      // If we don't have many cities, add some from our major cities list
      if (cities.length < 5) {
        return [...cities, ...majorCities.slice(0, 10)];
      }
      
      return cities as string[];
    }
    
    // Fallback to localStorage
    const storageData = localStorage.getItem('jalBandhu_reports');
    const allReports: ReportData[] = JSON.parse(storageData || '[]');
    const cities = [...new Set(allReports.map(report => report.city).filter(Boolean))];
    
    // If we don't have many cities, add some from our major cities list
    if (cities.length < 5) {
      return [...cities, ...majorCities.slice(0, 10)];
    }
    
    return cities;
  } catch (error) {
    console.error('Error fetching city list:', error);
    // Return some default cities
    return majorCities.slice(0, 10);
  }
};

// Get recent reports for the homepage
export const getRecentReports = async (limit: number = 5): Promise<ReportData[]> => {
  try {
    // Try to get from Supabase first
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.log(`Fetching recent reports from Supabase (limit: ${limit})`);
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} recent reports in Supabase`);
      return data as ReportData[];
    } else {
      console.log('Supabase credentials not found, using localStorage');
    }
    
    // Fallback to localStorage
    const storageData = localStorage.getItem('jalBandhu_reports');
    console.log(`LocalStorage data exists: ${!!storageData}`);
    const allReports: ReportData[] = JSON.parse(storageData || '[]');
    
    // Sort by updated_at and take the most recent ones
    const sortedReports = [...allReports].sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    ).slice(0, limit);
    
    console.log(`Found ${sortedReports.length} recent reports in localStorage`);
    return sortedReports;
  } catch (error) {
    console.error('Error fetching recent reports:', error);
    
    // Final fallback
    try {
      const allReports: ReportData[] = JSON.parse(localStorage.getItem('jalBandhu_reports') || '[]');
      const sortedReports = [...allReports].sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      ).slice(0, limit);
      return sortedReports;
    } catch (e) {
      console.error('Failed to parse localStorage data:', e);
      return [];
    }
  }
};

// Update user_id in reports when user signs in
export const updateUserIdInReports = async (oldUserId: string, newUserId: string): Promise<boolean> => {
  try {
    // Try to update in Supabase first
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { error } = await supabase
        .from('reports')
        .update({ user_id: newUserId })
        .eq('user_id', oldUserId);
      
      if (error) throw error;
      return true;
    }
    
    // Fallback to localStorage
    const allReports: ReportData[] = JSON.parse(localStorage.getItem('jalBandhu_reports') || '[]');
    const updatedReports = allReports.map(report => {
      if (report.user_id === oldUserId) {
        return { ...report, user_id: newUserId };
      }
      return report;
    });
    
    localStorage.setItem('jalBandhu_reports', JSON.stringify(updatedReports));
    return true;
  } catch (error) {
    console.error('Error updating user_id in reports:', error);
    return false;
  }
};

// Update a report's status
export const updateReportStatus = async (reportId: string, status: 'Submitted' | 'In Review' | 'Forwarded' | 'Resolved', actor?: string, notes?: string): Promise<boolean> => {
  try {
    const timestamp = new Date().toISOString();
    
    // Get current report to update history
    const currentReport = await getReportById(reportId);
    if (!currentReport) return false;
    
    // Prepare new history entry
    const newHistoryEntry = {
      status,
      timestamp,
      actor: actor || 'System',
      notes: notes || `Status changed to ${status}`
    };
    
    // Update history array
    const updatedHistory = [...(currentReport.status_history || []), newHistoryEntry];
    
    // Try to update in Supabase first
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { error } = await supabase
        .from('reports')
        .update({ 
          status,
          updated_at: timestamp,
          status_history: updatedHistory
        })
        .eq('report_id', reportId);
      
      if (error) throw error;
      return true;
    }
    
    // Fallback to localStorage
    const allReports: ReportData[] = JSON.parse(localStorage.getItem('jalBandhu_reports') || '[]');
    const reportIndex = allReports.findIndex(r => r.report_id === reportId);
    
    if (reportIndex === -1) return false;
    
    allReports[reportIndex].status = status;
    allReports[reportIndex].updated_at = timestamp;
    allReports[reportIndex].status_history = updatedHistory;
    
    localStorage.setItem('jalBandhu_reports', JSON.stringify(allReports));
    return true;
  } catch (error) {
    console.error('Error updating report status:', error);
    
    // Final fallback
    try {
      const allReports: ReportData[] = JSON.parse(localStorage.getItem('jalBandhu_reports') || '[]');
      const reportIndex = allReports.findIndex(r => r.report_id === reportId);
      
      if (reportIndex === -1) return false;
      
      allReports[reportIndex].status = status;
      allReports[reportIndex].updated_at = new Date().toISOString();
      
      localStorage.setItem('jalBandhu_reports', JSON.stringify(allReports));
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Get reports with their proof information for admin panel
    }

    // Fallback to localStorage
    const allTasks: TaskData[] = JSON.parse(localStorage.getItem('jalBandhu_tasks') || '[]');
    return allTasks.filter(task => task.report_id === reportId);
  } catch (error) {
    console.error('Error fetching tasks for report:', error);

    // Final fallback
    try {
      const allTasks: TaskData[] = JSON.parse(localStorage.getItem('jalBandhu_tasks') || '[]');
      return allTasks.filter(task => task.report_id === reportId);
    } catch {
      return [];
    }
  }
};

// Get all tasks for a specific category (for admin task overview)
export const getTasksByCategory = async (category: string): Promise<TaskData[]> => {
  try {
    // Try to get from Supabase first
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { data, error } = await supabase
        .from('report_tasks')
        .select('*')
        .ilike('category', category)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return data as TaskData[];
    }

    // Fallback to localStorage
    const allTasks: TaskData[] = JSON.parse(localStorage.getItem('jalBandhu_tasks') || '[]');
    return allTasks.filter(task => task.category.toLowerCase() === category.toLowerCase());
  } catch (error) {
    console.error('Error fetching tasks by category:', error);

    // Final fallback
    try {
      const allTasks: TaskData[] = JSON.parse(localStorage.getItem('jalBandhu_tasks') || '[]');
      return allTasks.filter(task => task.category.toLowerCase() === category.toLowerCase());
    } catch {
      return [];
    }
  }
};

// Get task statistics for a category
export const getTaskStatsByCategory = async (category: string): Promise<{
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
}> => {
  try {
    const tasks = await getTasksByCategory(category);
    const now = new Date();

    return {
      total: tasks.length,
      pending: tasks.filter(task => task.status === 'Pending').length,
      inProgress: tasks.filter(task => task.status === 'In Progress').length,
      completed: tasks.filter(task => task.status === 'Completed').length,
      overdue: tasks.filter(task =>
        task.due_date &&
        new Date(task.due_date) < now &&
        task.status !== 'Completed' &&
        task.status !== 'Cancelled'
      ).length
    };
  } catch (error) {
    console.error('Error getting task stats:', error);
    return { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 };
  }
};

// Get all tasks for admin overview (across all categories)
export const getAllTasksForAdmin = async (categories: string[]): Promise<TaskData[]> => {
  try {
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { data, error } = await supabase
        .from('report_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error in getAllTasksForAdmin:', error);
        throw error;
      }

      // Filter tasks in JavaScript to handle case-insensitive matching
      const filteredData = data?.filter(task =>
        categories.some(cat =>
          cat.toLowerCase() === task.category.toLowerCase()
        )
      ) || [];

      return filteredData as TaskData[];
    }

    // Fallback to localStorage
    const allTasks: TaskData[] = JSON.parse(localStorage.getItem('jalBandhu_tasks') || '[]');
    const filteredTasks = allTasks.filter(task => categories.some(cat => cat.toLowerCase() === task.category.toLowerCase()));
    return filteredTasks;
  } catch (error) {
    console.error('Error fetching all tasks for admin:', error);

    // If Supabase fails, try getting tasks by category individually
    try {
      const allTasks: TaskData[] = [];
      for (const category of categories) {
        const categoryTasks = await getTasksByCategory(category);
        allTasks.push(...categoryTasks);
      }
      return allTasks;
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);

      // Final fallback to localStorage
      try {
        const allTasks: TaskData[] = JSON.parse(localStorage.getItem('jalBandhu_tasks') || '[]');
        return allTasks.filter(task => categories.some(cat => cat.toLowerCase() === task.category.toLowerCase()));
      } catch {
        return [];
      }
    }
  }
};

// Update a task
export const updateTask = async (taskId: string, updates: Partial<TaskData>): Promise<boolean> => {
  try {
    const timestamp = new Date().toISOString();

    // Try to update in Supabase first
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { error } = await supabase
        .from('report_tasks')
        .update({ ...updates, updated_at: timestamp })
        .eq('id', taskId);

      if (error) throw error;
      return true;
    }

    // Fallback to localStorage
    const allTasks: TaskData[] = JSON.parse(localStorage.getItem('jalBandhu_tasks') || '[]');
    const taskIndex = allTasks.findIndex(task => task.id === taskId);

    if (taskIndex === -1) return false;

    allTasks[taskIndex] = {
      ...allTasks[taskIndex],
      ...updates,
      updated_at: timestamp
    };

    localStorage.setItem('jalBandhu_tasks', JSON.stringify(allTasks));
    return true;
  } catch (error) {
    console.error('Error updating task:', error);

    // Final fallback
    try {
      const allTasks: TaskData[] = JSON.parse(localStorage.getItem('jalBandhu_tasks') || '[]');
      const taskIndex = allTasks.findIndex(task => task.id === taskId);

      if (taskIndex === -1) return false;

      allTasks[taskIndex] = {
        ...allTasks[taskIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };

      localStorage.setItem('jalBandhu_tasks', JSON.stringify(allTasks));
      return true;
    } catch {
      return false;
    }
  }
};

// Delete a task
export const deleteTask = async (taskId: string): Promise<boolean> => {
  try {
    // Try to delete from Supabase first
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { error } = await supabase
        .from('report_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      return true;
    }

    // Fallback to localStorage
    const allTasks: TaskData[] = JSON.parse(localStorage.getItem('jalBandhu_tasks') || '[]');
    const filteredTasks = allTasks.filter(task => task.id !== taskId);

    if (filteredTasks.length === allTasks.length) return false;

    localStorage.setItem('jalBandhu_tasks', JSON.stringify(filteredTasks));
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);

    // Final fallback
    try {
      const allTasks: TaskData[] = JSON.parse(localStorage.getItem('jalBandhu_tasks') || '[]');
      const filteredTasks = allTasks.filter(task => task.id !== taskId);

      if (filteredTasks.length === allTasks.length) return false;

      localStorage.setItem('jalBandhu_tasks', JSON.stringify(filteredTasks));
      return true;
    } catch {
      return false;
    }
  }
};

// Initialize status_history for existing reports that don't have it
export const initializeStatusHistoryForExistingReports = async (): Promise<void> => {
  try {
    // Get all reports from localStorage
    const allReports: ReportData[] = JSON.parse(localStorage.getItem('jalBandhu_reports') || '[]');
    
    let updated = false;
    const updatedReports = allReports.map(report => {
      if (!report.status_history || report.status_history.length === 0) {
        // Initialize with the current status
        const historyEntry = {
          status: report.status,
          timestamp: report.updated_at,
          actor: 'System',
          notes: `Status set to ${report.status}`
        };
        
        // If the report was created before updated_at, add creation entry
        const history = [];
        if (report.created_at !== report.updated_at) {
          history.push({
            status: 'Submitted' as const,
            timestamp: report.created_at,
            actor: 'Citizen',
            notes: 'Initial grievance submission'
          });
        }
        history.push(historyEntry);
        
        updated = true;
        return {
          ...report,
          status_history: history
        };
      }
      return report;
    });
    
    if (updated) {
      localStorage.setItem('jalBandhu_reports', JSON.stringify(updatedReports));
      console.log('Initialized status_history for existing reports');
    }
  } catch (error) {
    console.error('Error initializing status history:', error);
  }
};

/**
 * Verify a proof-of-report for a given report
 * @param reportId - The report ID to verify
 * @param cid - The IPFS CID of the proof
 * @returns Promise<boolean> - True if verification succeeds
 */
export const verifyReportProof = async (reportId: string, cid: string): Promise<boolean> => {
  try {
    console.log(`Getting basic proof info for report ${reportId} with CID ${cid}`);
    
    const proofInfo = await proofOfReportService.getProofInfo(cid);
    
    if (proofInfo.exists && proofInfo.data) {
      // If proof exists, it's considered valid (simplified approach)
      await updateProofVerificationStatus(reportId, 'verified');
      console.log(`Proof exists and is valid for report ${reportId}`);
      return true;
    } else {
      // Mark as failed in database
      await updateProofVerificationStatus(reportId, 'failed');
      console.warn(`Proof not found for report ${reportId}:`, proofInfo.error);
      return false;
    }
  } catch (error) {
    console.error(`Error checking proof for report ${reportId}:`, error);
    await updateProofVerificationStatus(reportId, 'failed');
    return false;
  }
};

/**
 * Update the proof verification status in the database
 * @param reportId - The report ID
 * @param status - The new verification status
 */
export const updateProofVerificationStatus = async (
  reportId: string, 
  status: 'pending' | 'verified' | 'failed'
): Promise<void> => {
  try {
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { error } = await supabase
        .from('reports')
        .update({ 
          proof_verification_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('report_id', reportId);

      if (error) {
        console.error('Error updating proof verification status in Supabase:', error);
      } else {
        console.log(`Updated proof verification status for ${reportId} to ${status}`);
      }
    }

    // Also update localStorage
    try {
      const allReports: ReportData[] = JSON.parse(localStorage.getItem('jalBandhu_reports') || '[]');
      const reportIndex = allReports.findIndex(report => report.report_id === reportId);
      
      if (reportIndex !== -1) {
        allReports[reportIndex].proof_verification_status = status;
        allReports[reportIndex].updated_at = new Date().toISOString();
        localStorage.setItem('jalBandhu_reports', JSON.stringify(allReports));
      }
    } catch (e) {
      console.error('Error updating localStorage proof status:', e);
    }
  } catch (error) {
    console.error('Error updating proof verification status:', error);
  }
};

/**
 * Get proof statistics for admin dashboard
 * @returns Promise<object> - Statistics about proof coverage and verification
 */
export const getProofStatistics = async (): Promise<{
  totalReports: number;
  reportsWithProof: number;
  verifiedProofs: number;
  pendingProofs: number;
  failedProofs: number;
  proofCoveragePercentage: number;
  verificationSuccessRate: number;
}> => {
  try {
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      // Use the view we created in the database
      const { data, error } = await supabase
        .from('proof_statistics')
        .select('*')
        .single();

      if (!error && data) {
        return {
          totalReports: data.total_reports || 0,
          reportsWithProof: data.reports_with_proof || 0,
          verifiedProofs: data.verified_proofs || 0,
          pendingProofs: data.pending_proofs || 0,
          failedProofs: data.failed_proofs || 0,
          proofCoveragePercentage: data.proof_coverage_percentage || 0,
          verificationSuccessRate: data.verification_success_rate || 0
        };
      }
    }

    // Fallback to localStorage calculation
    const allReports: ReportData[] = JSON.parse(localStorage.getItem('jalBandhu_reports') || '[]');
    const totalReports = allReports.length;
    const reportsWithProof = allReports.filter(r => r.proof_cid).length;
    const verifiedProofs = allReports.filter(r => r.proof_verification_status === 'verified').length;
    const pendingProofs = allReports.filter(r => r.proof_verification_status === 'pending').length;
    const failedProofs = allReports.filter(r => r.proof_verification_status === 'failed').length;
    
    return {
      totalReports,
      reportsWithProof,
      verifiedProofs,
      pendingProofs,
      failedProofs,
      proofCoveragePercentage: totalReports > 0 ? (reportsWithProof / totalReports) * 100 : 0,
      verificationSuccessRate: reportsWithProof > 0 ? (verifiedProofs / reportsWithProof) * 100 : 0
    };
  } catch (error) {
    console.error('Error getting proof statistics:', error);
    return {
      totalReports: 0,
      reportsWithProof: 0,
      verifiedProofs: 0,
      pendingProofs: 0,
      failedProofs: 0,
      proofCoveragePercentage: 0,
      verificationSuccessRate: 0
    };
  }
};

/**
 * Get reports with their proof information for admin panel
 * @param limit - Number of reports to fetch
 * @param offset - Offset for pagination
 * @returns Promise<ReportData[]> - Reports with proof information
 */
export const getReportsWithProofInfo = async (
  limit: number = 50, 
  offset: number = 0
): Promise<ReportData[]> => {
  try {
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!error && data) {
        return data as ReportData[];
      }
    }

    // Fallback to localStorage
    const allReports: ReportData[] = JSON.parse(localStorage.getItem('jalBandhu_reports') || '[]');
    return allReports
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(offset, offset + limit);
  } catch (error) {
    console.error('Error getting reports with proof info:', error);
    return [];
  }
};
