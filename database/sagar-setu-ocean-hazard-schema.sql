-- ========================================
-- SagarSetu Ocean Hazard Reporting Platform
-- Complete Database Schema for INCOIS Integration
-- ========================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ========================================
-- Core Ocean Hazard Reporting Tables
-- ========================================

-- Main reports table with ocean-specific enhancements
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id VARCHAR(50) UNIQUE NOT NULL,
    
    -- Basic report information
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Ocean hazard categories
    hazard_type VARCHAR(50) NOT NULL CHECK (hazard_type IN (
        'tsunami_events',           -- Tsunami waves, unusual retreat, flooding
        'storm_surge',             -- Coastal flooding, high water levels
        'high_waves',              -- Dangerous wave conditions, coastal damage
        'swell_surges',            -- Abnormal wave patterns, harbor oscillations
        'coastal_currents',        -- Dangerous rip currents, unusual current patterns
        'coastal_erosion',         -- Beach/cliff erosion, infrastructure damage
        'marine_debris',           -- Pollution, floating objects, oil spills
        'unusual_sea_behavior',    -- Color changes, foam, dead marine life
        'coastal_infrastructure_damage'  -- Ports, sea walls, coastal roads
    )),
    
    -- Location data (enhanced for coastal areas)
    location JSONB NOT NULL,
    coordinates POINT, -- PostGIS point for better spatial queries
    coastal_zone VARCHAR(100), -- INCOIS coastal zone classification
    water_body VARCHAR(100), -- Bay of Bengal, Arabian Sea, etc.
    nearest_port VARCHAR(100),
    distance_from_shore_km DECIMAL(8,2),
    
    -- Ocean-specific metadata fields
    wave_height_estimated DECIMAL(5,2) CHECK (wave_height_estimated >= 0), -- in meters
    wave_height_category VARCHAR(20) CHECK (wave_height_category IN ('calm', 'light', 'moderate', 'rough', 'very_rough', 'phenomenal')),
    water_level_change VARCHAR(20) CHECK (water_level_change IN ('normal', 'slightly_high', 'high', 'very_high', 'extremely_high', 'receding')),
    current_strength VARCHAR(20) CHECK (current_strength IN ('weak', 'moderate', 'strong', 'very_strong', 'dangerous')),
    
    -- Weather and environmental conditions
    weather_conditions JSONB DEFAULT '{}'::jsonb, -- wind speed, direction, visibility, etc.
    tide_information VARCHAR(30) CHECK (tide_information IN ('low_tide', 'rising_tide', 'high_tide', 'falling_tide', 'spring_tide', 'neap_tide')),
    sea_state INTEGER CHECK (sea_state BETWEEN 0 AND 9), -- Douglas sea state scale
    visibility_km DECIMAL(5,2) CHECK (visibility_km >= 0),
    water_temperature_celsius DECIMAL(5,2),
    wind_speed_kmh DECIMAL(5,2) CHECK (wind_speed_kmh >= 0),
    wind_direction VARCHAR(10) CHECK (wind_direction IN ('N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW')),
    
    -- Safety and impact assessment
    severity_level INTEGER DEFAULT 1 CHECK (severity_level BETWEEN 1 AND 5),
    safety_threat_level VARCHAR(20) DEFAULT 'low' CHECK (safety_threat_level IN ('low', 'moderate', 'high', 'critical', 'extreme')),
    people_at_risk_count INTEGER DEFAULT 0,
    infrastructure_impact VARCHAR(30) CHECK (infrastructure_impact IN ('none', 'minimal', 'moderate', 'significant', 'severe', 'catastrophic')),
    fishing_activity_affected BOOLEAN DEFAULT FALSE,
    shipping_lanes_affected BOOLEAN DEFAULT FALSE,
    
    -- Media and evidence
    image_url TEXT,
    additional_images JSONB DEFAULT '[]'::jsonb,
    video_url TEXT,
    
    -- Status and verification
    status VARCHAR(20) NOT NULL DEFAULT 'submitted' CHECK (status IN (
        'submitted', 'under_review', 'verified', 'forwarded_to_incois', 
        'forwarded_to_coast_guard', 'alert_issued', 'resolved', 'false_alarm'
    )),
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN (
        'pending', 'verified_by_community', 'verified_by_official', 'verified_by_sensor', 'disputed'
    )),
    verified_by_user_id UUID,
    verification_timestamp TIMESTAMPTZ,
    verification_notes TEXT,
    
    -- INCOIS integration
    incois_alert_id VARCHAR(100), -- Reference to INCOIS early warning system
    incois_severity_score DECIMAL(3,2), -- INCOIS calculated severity (0-1)
    early_warning_correlation BOOLEAN DEFAULT FALSE,
    sensor_data_correlation JSONB DEFAULT '{}'::jsonb,
    
    -- AI analysis results
    ai_analysis JSONB DEFAULT '{}'::jsonb,
    ai_confidence_score DECIMAL(3,2) CHECK (ai_confidence_score BETWEEN 0 AND 1),
    auto_classification_accuracy DECIMAL(3,2),
    
    -- User and tracking information
    user_id UUID NOT NULL,
    is_anonymous_report BOOLEAN DEFAULT FALSE,
    reporter_contact_info JSONB DEFAULT '{}'::jsonb,
    
    -- Smart camera and IoT integration
    is_smart_camera_report BOOLEAN DEFAULT FALSE,
    smart_camera_id VARCHAR(100),
    iot_sensor_data JSONB DEFAULT '{}'::jsonb,
    
    -- Priority and urgency
    priority_level INTEGER DEFAULT 3 CHECK (priority_level BETWEEN 1 AND 5),
    urgency_score DECIMAL(3,2) DEFAULT 0.5 CHECK (urgency_score BETWEEN 0 AND 1),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reported_incident_time TIMESTAMPTZ, -- When the actual incident occurred
    
    -- Metadata
    tags JSONB DEFAULT '[]'::jsonb,
    source_platform VARCHAR(50) DEFAULT 'web_app',
    language VARCHAR(10) DEFAULT 'en',
    
    -- Constraints
    CONSTRAINT valid_coordinates CHECK (
        location IS NOT NULL AND 
        location ? 'lat' AND 
        location ? 'lng'
    )
);

-- Performance indexes for reports
CREATE INDEX IF NOT EXISTS idx_reports_hazard_type ON reports(hazard_type);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_severity ON reports(severity_level DESC);
CREATE INDEX IF NOT EXISTS idx_reports_safety_threat ON reports(safety_threat_level);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_coastal_zone ON reports(coastal_zone);
CREATE INDEX IF NOT EXISTS idx_reports_water_body ON reports(water_body);
CREATE INDEX IF NOT EXISTS idx_reports_verification_status ON reports(verification_status);
CREATE INDEX IF NOT EXISTS idx_reports_incois_alert ON reports(incois_alert_id) WHERE incois_alert_id IS NOT NULL;

-- Spatial indexes for location-based queries
CREATE INDEX IF NOT EXISTS idx_reports_location_gin ON reports USING GIN (location);
CREATE INDEX IF NOT EXISTS idx_reports_coordinates_gist ON reports USING GIST (coordinates) WHERE coordinates IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_reports_hazard_status ON reports(hazard_type, status);
CREATE INDEX IF NOT EXISTS idx_reports_zone_created ON reports(coastal_zone, created_at DESC);

-- ========================================
-- Social Media Intelligence System
-- ========================================

-- Social media posts monitoring
CREATE TABLE IF NOT EXISTS social_media_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Platform and post identification
    platform VARCHAR(30) NOT NULL CHECK (platform IN ('twitter', 'facebook', 'youtube', 'instagram', 'telegram', 'whatsapp')),
    post_id VARCHAR(200) NOT NULL,
    external_url TEXT,
    
    -- Content information
    content TEXT NOT NULL,
    original_language VARCHAR(10),
    translated_content JSONB DEFAULT '{}'::jsonb, -- Multiple language translations
    
    -- Author information
    author_username VARCHAR(200),
    author_display_name VARCHAR(200),
    author_verified BOOLEAN DEFAULT FALSE,
    author_follower_count INTEGER DEFAULT 0,
    author_location VARCHAR(200),
    
    -- Location data
    location JSONB,
    coordinates POINT,
    mentioned_locations TEXT[],
    coastal_zone VARCHAR(100),
    
    -- Engagement metrics
    likes_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,4) DEFAULT 0.0000,
    
    -- AI Analysis results
    hazard_classification VARCHAR(50),
    hazard_keywords TEXT[],
    sentiment_score DECIMAL(4,3) CHECK (sentiment_score BETWEEN -1 AND 1),
    emotion_analysis JSONB DEFAULT '{}'::jsonb,
    confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
    urgency_level INTEGER DEFAULT 1 CHECK (urgency_level BETWEEN 1 AND 5),
    panic_indicator BOOLEAN DEFAULT FALSE,
    
    -- Content analysis
    contains_media BOOLEAN DEFAULT FALSE,
    media_urls TEXT[],
    media_type VARCHAR(20) CHECK (media_type IN ('image', 'video', 'audio', 'mixed', 'none')),
    mentions TEXT[],
    hashtags TEXT[],
    
    -- Ocean hazard specific analysis
    ocean_hazard_indicators JSONB DEFAULT '{}'::jsonb,
    weather_mentions JSONB DEFAULT '{}'::jsonb,
    marine_terms_found TEXT[],
    coastal_impact_mentions JSONB DEFAULT '{}'::jsonb,
    
    -- Verification and credibility
    verified_by_officials BOOLEAN DEFAULT FALSE,
    credibility_score DECIMAL(3,2) DEFAULT 0.50 CHECK (credibility_score BETWEEN 0 AND 1),
    fake_news_probability DECIMAL(3,2) DEFAULT 0.00 CHECK (fake_news_probability BETWEEN 0 AND 1),
    verification_notes TEXT,
    
    -- Cross-referencing
    related_reports UUID[], -- Array of report IDs
    duplicate_of_post UUID REFERENCES social_media_posts(id),
    similarity_cluster VARCHAR(100),
    
    -- Timestamps
    post_created_at TIMESTAMPTZ,
    collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    analyzed_at TIMESTAMPTZ,
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Processing metadata
    processing_version VARCHAR(20),
    nlp_model_version VARCHAR(20),
    
    UNIQUE(platform, post_id)
);

-- Indexes for social media posts
CREATE INDEX IF NOT EXISTS idx_social_media_platform ON social_media_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_media_hazard_class ON social_media_posts(hazard_classification);
CREATE INDEX IF NOT EXISTS idx_social_media_urgency ON social_media_posts(urgency_level DESC);
CREATE INDEX IF NOT EXISTS idx_social_media_sentiment ON social_media_posts(sentiment_score);
CREATE INDEX IF NOT EXISTS idx_social_media_confidence ON social_media_posts(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_social_media_collected ON social_media_posts(collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_media_post_created ON social_media_posts(post_created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_media_coastal_zone ON social_media_posts(coastal_zone);
CREATE INDEX IF NOT EXISTS idx_social_media_panic ON social_media_posts(panic_indicator) WHERE panic_indicator = TRUE;

-- GIN indexes for arrays and JSONB fields
CREATE INDEX IF NOT EXISTS idx_social_media_keywords_gin ON social_media_posts USING GIN (hazard_keywords);
CREATE INDEX IF NOT EXISTS idx_social_media_hashtags_gin ON social_media_posts USING GIN (hashtags);
CREATE INDEX IF NOT EXISTS idx_social_media_location_gin ON social_media_posts USING GIN (location);
CREATE INDEX IF NOT EXISTS idx_social_media_ocean_indicators_gin ON social_media_posts USING GIN (ocean_hazard_indicators);

-- ========================================
-- User Management & Roles
-- ========================================

-- Enhanced user roles for maritime context
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    
    -- Role definitions
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'coastal_citizen',        -- General coastal community member
        'fisherman',             -- Fishing community member
        'marine_volunteer',      -- Trained marine safety volunteer
        'port_authority',        -- Port and harbor officials
        'coast_guard_officer',   -- Indian Coast Guard personnel
        'incois_official',       -- INCOIS scientists/officials
        'disaster_manager',      -- State/District disaster management
        'meteorologist',         -- Weather and ocean forecasting
        'marine_researcher',     -- Academic/research institutions
        'emergency_responder',   -- First responders, rescue teams
        'system_admin'          -- Platform administrators
    )),
    
    -- Permissions and capabilities
    permissions JSONB DEFAULT '{}'::jsonb,
    can_verify_reports BOOLEAN DEFAULT FALSE,
    can_issue_warnings BOOLEAN DEFAULT FALSE,
    can_access_sensor_data BOOLEAN DEFAULT FALSE,
    can_moderate_social_media BOOLEAN DEFAULT FALSE,
    
    -- Geographic coverage
    assigned_coastal_zones TEXT[],
    assigned_water_bodies TEXT[],
    jurisdiction_radius_km INTEGER DEFAULT 50,
    home_port VARCHAR(100),
    
    -- Contact and identification
    official_id VARCHAR(100), -- Employee ID, Coast Guard number, etc.
    certification_level VARCHAR(30),
    emergency_contact_info JSONB DEFAULT '{}'::jsonb,
    
    -- Activity tracking
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    reports_verified_count INTEGER DEFAULT 0,
    warnings_issued_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

-- Indexes for user roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_can_verify ON user_roles(can_verify_reports) WHERE can_verify_reports = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_roles_zones_gin ON user_roles USING GIN (assigned_coastal_zones);

-- Hazard category administrators
CREATE TABLE IF NOT EXISTS hazard_category_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    
    -- Category specialization
    hazard_types TEXT[] NOT NULL,
    expertise_level VARCHAR(20) DEFAULT 'intermediate' CHECK (expertise_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    
    -- Coverage areas
    coastal_zones TEXT[],
    water_bodies TEXT[],
    priority_regions TEXT[],
    
    -- Notification preferences
    notification_preferences JSONB DEFAULT '{
        "immediate_alerts": true,
        "daily_summary": true,
        "weekly_report": true,
        "social_media_mentions": true,
        "threshold_breaches": true
    }'::jsonb,
    
    -- Performance metrics
    response_time_minutes INTEGER DEFAULT 30,
    verification_accuracy_rate DECIMAL(5,2) DEFAULT 85.00,
    false_positive_rate DECIMAL(5,2) DEFAULT 5.00,
    
    -- Status
    is_on_duty BOOLEAN DEFAULT TRUE,
    availability_schedule JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for category admins
CREATE INDEX IF NOT EXISTS idx_category_admins_user_id ON hazard_category_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_category_admins_hazard_types_gin ON hazard_category_admins USING GIN (hazard_types);
CREATE INDEX IF NOT EXISTS idx_category_admins_on_duty ON hazard_category_admins(is_on_duty) WHERE is_on_duty = TRUE;

-- ========================================
-- Hotspot Analysis & Analytics
-- ========================================

-- Ocean hazard hotspots
CREATE TABLE IF NOT EXISTS ocean_hazard_hotspots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotspot_id VARCHAR(50) UNIQUE NOT NULL,
    
    -- Spatial data
    center_coordinates POINT NOT NULL,
    bounding_box POLYGON, -- Area covered by hotspot
    coastal_zone VARCHAR(100),
    water_body VARCHAR(100),
    affected_radius_km DECIMAL(8,2),
    
    -- Hazard information
    primary_hazard_type VARCHAR(50) NOT NULL,
    secondary_hazard_types TEXT[],
    intensity_score DECIMAL(5,2) NOT NULL CHECK (intensity_score >= 0),
    severity_classification VARCHAR(20) CHECK (severity_classification IN ('low', 'moderate', 'high', 'critical', 'extreme')),
    
    -- Data sources contributing to hotspot
    verified_reports_count INTEGER DEFAULT 0,
    social_media_mentions_count INTEGER DEFAULT 0,
    sensor_readings_count INTEGER DEFAULT 0,
    official_warnings_count INTEGER DEFAULT 0,
    citizen_reports_count INTEGER DEFAULT 0,
    
    -- Marine-specific attributes
    depth_range_meters VARCHAR(50), -- For underwater hazards
    affected_shipping_lanes TEXT[],
    affected_fishing_zones TEXT[],
    coastal_infrastructure_at_risk TEXT[],
    estimated_people_affected INTEGER DEFAULT 0,
    
    -- Temporal analysis
    first_detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    peak_intensity_at TIMESTAMPTZ,
    expected_duration_hours INTEGER,
    
    -- Status tracking
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('emerging', 'active', 'escalating', 'stabilizing', 'declining', 'resolved', 'false_alarm')),
    alert_level INTEGER DEFAULT 1 CHECK (alert_level BETWEEN 1 AND 5),
    public_warning_issued BOOLEAN DEFAULT FALSE,
    
    -- Predictions and forecasting
    trend_direction VARCHAR(20) CHECK (trend_direction IN ('increasing', 'stable', 'decreasing', 'unknown')),
    predicted_peak_time TIMESTAMPTZ,
    confidence_level DECIMAL(3,2) DEFAULT 0.70 CHECK (confidence_level BETWEEN 0 AND 1),
    forecast_model_used VARCHAR(50),
    
    -- Impact assessment
    economic_impact_estimate DECIMAL(15,2), -- in Indian Rupees
    environmental_impact_score INTEGER CHECK (environmental_impact_score BETWEEN 1 AND 10),
    tourism_impact_level VARCHAR(20) CHECK (tourism_impact_level IN ('none', 'minimal', 'moderate', 'significant', 'severe')),
    
    -- Resolution tracking
    resolved_at TIMESTAMPTZ,
    resolution_method VARCHAR(50),
    lessons_learned TEXT,
    
    -- Metadata
    created_by_user_id UUID,
    detection_algorithm VARCHAR(50),
    metadata JSONB DEFAULT '{}'::jsonb,
    
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spatial and performance indexes for hotspots
CREATE INDEX IF NOT EXISTS idx_hotspots_coordinates_gist ON ocean_hazard_hotspots USING GIST (center_coordinates);
CREATE INDEX IF NOT EXISTS idx_hotspots_bounding_box_gist ON ocean_hazard_hotspots USING GIST (bounding_box) WHERE bounding_box IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_hotspots_hazard_type ON ocean_hazard_hotspots(primary_hazard_type);
CREATE INDEX IF NOT EXISTS idx_hotspots_status ON ocean_hazard_hotspots(status);
CREATE INDEX IF NOT EXISTS idx_hotspots_alert_level ON ocean_hazard_hotspots(alert_level DESC);
CREATE INDEX IF NOT EXISTS idx_hotspots_intensity ON ocean_hazard_hotspots(intensity_score DESC);
CREATE INDEX IF NOT EXISTS idx_hotspots_coastal_zone ON ocean_hazard_hotspots(coastal_zone);
CREATE INDEX IF NOT EXISTS idx_hotspots_water_body ON ocean_hazard_hotspots(water_body);
CREATE INDEX IF NOT EXISTS idx_hotspots_last_activity ON ocean_hazard_hotspots(last_activity_at DESC);

-- ========================================
-- INCOIS Integration Tables
-- ========================================

-- Early warning system integration
CREATE TABLE IF NOT EXISTS incois_early_warnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warning_id VARCHAR(100) UNIQUE NOT NULL,
    
    -- Warning details
    warning_type VARCHAR(50) NOT NULL CHECK (warning_type IN (
        'tsunami_warning', 'cyclone_warning', 'storm_surge_warning', 
        'high_wave_warning', 'coastal_flood_warning', 'marine_weather_warning'
    )),
    severity_level INTEGER CHECK (severity_level BETWEEN 1 AND 5),
    urgency VARCHAR(20) CHECK (urgency IN ('immediate', 'expected', 'future', 'past')),
    certainty VARCHAR(20) CHECK (certainty IN ('observed', 'likely', 'possible', 'unlikely', 'unknown')),
    
    -- Affected areas
    affected_coastal_zones TEXT[],
    affected_coordinates POLYGON[],
    affected_water_bodies TEXT[],
    
    -- Warning content
    warning_title TEXT NOT NULL,
    warning_description TEXT NOT NULL,
    safety_instructions TEXT,
    recommended_actions TEXT,
    
    -- Timing information
    issued_at TIMESTAMPTZ NOT NULL,
    effective_from TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ,
    expected_onset TIMESTAMPTZ,
    
    -- Source and validation
    issuing_authority VARCHAR(100) DEFAULT 'INCOIS',
    data_source VARCHAR(100),
    validation_status VARCHAR(20) DEFAULT 'official',
    
    -- Correlation with platform data
    related_reports UUID[],
    related_social_media_posts UUID[],
    related_hotspots UUID[],
    
    -- Distribution tracking
    notification_sent BOOLEAN DEFAULT FALSE,
    platforms_notified TEXT[],
    estimated_reach INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'updated', 'cancelled', 'expired')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for INCOIS warnings
CREATE INDEX IF NOT EXISTS idx_incois_warnings_type ON incois_early_warnings(warning_type);
CREATE INDEX IF NOT EXISTS idx_incois_warnings_severity ON incois_early_warnings(severity_level DESC);
CREATE INDEX IF NOT EXISTS idx_incois_warnings_issued ON incois_early_warnings(issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_incois_warnings_effective ON incois_early_warnings(effective_from);
CREATE INDEX IF NOT EXISTS idx_incois_warnings_status ON incois_early_warnings(status);
CREATE INDEX IF NOT EXISTS idx_incois_warnings_zones_gin ON incois_early_warnings USING GIN (affected_coastal_zones);

-- Sensor data integration
CREATE TABLE IF NOT EXISTS sensor_data_feeds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sensor_id VARCHAR(100) NOT NULL,
    
    -- Sensor information
    sensor_type VARCHAR(50) CHECK (sensor_type IN (
        'tide_gauge', 'wave_buoy', 'weather_station', 'seismic_sensor',
        'water_quality_sensor', 'current_meter', 'coastal_webcam'
    )),
    sensor_location POINT NOT NULL,
    installation_depth_meters DECIMAL(8,2),
    coastal_zone VARCHAR(100),
    
    -- Readings and measurements
    timestamp TIMESTAMPTZ NOT NULL,
    raw_data JSONB NOT NULL,
    processed_values JSONB DEFAULT '{}'::jsonb,
    
    -- Ocean parameters
    wave_height_meters DECIMAL(5,2),
    wave_period_seconds DECIMAL(5,2),
    water_level_meters DECIMAL(8,3),
    current_speed_mps DECIMAL(5,2),
    current_direction INTEGER CHECK (current_direction BETWEEN 0 AND 360),
    water_temperature_celsius DECIMAL(5,2),
    salinity_ppt DECIMAL(5,2),
    ph_level DECIMAL(4,2),
    
    -- Weather parameters
    wind_speed_mps DECIMAL(5,2),
    wind_direction INTEGER CHECK (wind_direction BETWEEN 0 AND 360),
    atmospheric_pressure_hpa DECIMAL(7,2),
    air_temperature_celsius DECIMAL(5,2),
    humidity_percent DECIMAL(5,2),
    visibility_km DECIMAL(5,2),
    
    -- Quality indicators
    data_quality_score DECIMAL(3,2) DEFAULT 0.95 CHECK (data_quality_score BETWEEN 0 AND 1),
    anomaly_detected BOOLEAN DEFAULT FALSE,
    anomaly_confidence DECIMAL(3,2),
    
    -- Processing metadata
    source_system VARCHAR(100),
    processing_timestamp TIMESTAMPTZ DEFAULT NOW(),
    correlation_id VARCHAR(100),
    
    CONSTRAINT unique_sensor_timestamp UNIQUE (sensor_id, timestamp)
);

-- Indexes for sensor data
CREATE INDEX IF NOT EXISTS idx_sensor_data_sensor_id ON sensor_data_feeds(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_data_timestamp ON sensor_data_feeds(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_data_type ON sensor_data_feeds(sensor_type);
CREATE INDEX IF NOT EXISTS idx_sensor_data_location_gist ON sensor_data_feeds USING GIST (sensor_location);
CREATE INDEX IF NOT EXISTS idx_sensor_data_anomaly ON sensor_data_feeds(anomaly_detected) WHERE anomaly_detected = TRUE;
CREATE INDEX IF NOT EXISTS idx_sensor_data_coastal_zone ON sensor_data_feeds(coastal_zone);

-- ========================================
-- Notification & Communication System
-- ========================================

-- Enhanced notification system for marine emergencies
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id VARCHAR(100) UNIQUE NOT NULL,
    
    -- Target information
    user_id UUID NOT NULL,
    user_roles TEXT[], -- For role-based targeting
    coastal_zones TEXT[], -- For location-based targeting
    
    -- Notification content
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) CHECK (notification_type IN (
        'hazard_alert', 'warning_update', 'safety_advisory', 
        'report_status_update', 'system_announcement', 'emergency_broadcast'
    )),
    
    -- Priority and urgency
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical', 'emergency')),
    urgency_level INTEGER DEFAULT 3 CHECK (urgency_level BETWEEN 1 AND 5),
    requires_acknowledgment BOOLEAN DEFAULT FALSE,
    
    -- Source information
    source_type VARCHAR(30) CHECK (source_type IN ('report', 'incois_warning', 'social_media', 'sensor_data', 'manual', 'system')),
    source_id UUID, -- ID of the source (report, warning, etc.)
    issued_by_user_id UUID,
    issuing_authority VARCHAR(100),
    
    -- Content details
    hazard_types TEXT[],
    affected_locations JSONB,
    safety_instructions TEXT,
    recommended_actions TEXT,
    contact_information JSONB DEFAULT '{}'::jsonb,
    
    -- Media attachments
    image_urls TEXT[],
    document_urls TEXT[],
    emergency_contact_numbers TEXT[],
    
    -- Delivery tracking
    delivery_channels TEXT[], -- 'app', 'push', 'email', 'sms', 'social_media'
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    
    -- Expiration and lifecycle
    expires_at TIMESTAMPTZ,
    auto_delete_after_hours INTEGER DEFAULT 168, -- 7 days
    
    -- Multi-language support
    language VARCHAR(10) DEFAULT 'en',
    translations JSONB DEFAULT '{}'::jsonb,
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'acknowledged', 'expired', 'cancelled')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_urgency ON notifications(urgency_level DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_roles_gin ON notifications USING GIN (user_roles);
CREATE INDEX IF NOT EXISTS idx_notifications_zones_gin ON notifications USING GIN (coastal_zones);
CREATE INDEX IF NOT EXISTS idx_notifications_hazard_types_gin ON notifications USING GIN (hazard_types);

-- ========================================
-- Analytics & Reporting Tables
-- ========================================

-- System analytics and metrics
CREATE TABLE IF NOT EXISTS system_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_date DATE NOT NULL,
    
    -- Report metrics
    total_reports_submitted INTEGER DEFAULT 0,
    verified_reports_count INTEGER DEFAULT 0,
    false_alarm_reports_count INTEGER DEFAULT 0,
    avg_response_time_minutes DECIMAL(8,2),
    avg_resolution_time_hours DECIMAL(10,2),
    
    -- Hazard type breakdown
    tsunami_reports INTEGER DEFAULT 0,
    storm_surge_reports INTEGER DEFAULT 0,
    high_waves_reports INTEGER DEFAULT 0,
    coastal_erosion_reports INTEGER DEFAULT 0,
    marine_debris_reports INTEGER DEFAULT 0,
    other_hazard_reports INTEGER DEFAULT 0,
    
    -- Social media metrics
    social_posts_analyzed INTEGER DEFAULT 0,
    high_urgency_social_posts INTEGER DEFAULT 0,
    social_media_verified_events INTEGER DEFAULT 0,
    avg_social_sentiment_score DECIMAL(4,3),
    
    -- User engagement metrics
    active_users INTEGER DEFAULT 0,
    new_user_registrations INTEGER DEFAULT 0,
    notification_delivery_rate DECIMAL(5,2),
    user_acknowledgment_rate DECIMAL(5,2),
    
    -- Geographic distribution
    coastal_zone_activity JSONB DEFAULT '{}'::jsonb,
    top_reporting_cities TEXT[],
    
    -- System performance
    api_response_time_ms DECIMAL(8,2),
    system_uptime_percentage DECIMAL(5,2),
    data_processing_lag_minutes INTEGER,
    
    -- INCOIS integration metrics
    incois_warnings_processed INTEGER DEFAULT 0,
    sensor_data_points_received INTEGER DEFAULT 0,
    cross_validation_accuracy DECIMAL(5,2),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_metric_date UNIQUE (metric_date)
);

-- Index for analytics
CREATE INDEX IF NOT EXISTS idx_analytics_date ON system_analytics(metric_date DESC);

-- ========================================
-- Database Functions and Triggers
-- ========================================

-- Function to update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to relevant tables
CREATE TRIGGER update_reports_updated_at 
    BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_media_posts_updated_at 
    BEFORE UPDATE ON social_media_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at 
    BEFORE UPDATE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hazard_category_admins_updated_at 
    BEFORE UPDATE ON hazard_category_admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ocean_hazard_hotspots_updated_at 
    BEFORE UPDATE ON ocean_hazard_hotspots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incois_early_warnings_updated_at 
    BEFORE UPDATE ON incois_early_warnings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate report IDs
CREATE OR REPLACE FUNCTION generate_report_id()
RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    year_suffix TEXT;
    counter INTEGER;
BEGIN
    year_suffix := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Get the next counter for this year
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(report_id FROM 'SG-' || year_suffix || '-(\d+)') AS INTEGER)
    ), 0) + 1
    INTO counter
    FROM reports
    WHERE report_id ~ ('^SG-' || year_suffix || '-\d+$');
    
    new_id := 'SG-' || year_suffix || '-' || LPAD(counter::TEXT, 6, '0');
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate urgency score based on multiple factors
CREATE OR REPLACE FUNCTION calculate_urgency_score(
    p_hazard_type VARCHAR,
    p_severity_level INTEGER,
    p_wave_height DECIMAL,
    p_people_at_risk INTEGER,
    p_infrastructure_impact VARCHAR
) RETURNS DECIMAL AS $$
DECLARE
    urgency_score DECIMAL := 0.0;
BEGIN
    -- Base score from severity level
    urgency_score := p_severity_level * 0.2;
    
    -- Hazard type modifiers
    CASE p_hazard_type
        WHEN 'tsunami_events' THEN urgency_score := urgency_score + 0.4;
        WHEN 'storm_surge' THEN urgency_score := urgency_score + 0.3;
        WHEN 'high_waves' THEN urgency_score := urgency_score + 0.2;
        WHEN 'coastal_currents' THEN urgency_score := urgency_score + 0.25;
        ELSE urgency_score := urgency_score + 0.1;
    END CASE;
    
    -- Wave height impact
    IF p_wave_height IS NOT NULL THEN
        IF p_wave_height > 6 THEN urgency_score := urgency_score + 0.2;
        ELSIF p_wave_height > 4 THEN urgency_score := urgency_score + 0.15;
        ELSIF p_wave_height > 2 THEN urgency_score := urgency_score + 0.1;
        END IF;
    END IF;
    
    -- People at risk factor
    IF p_people_at_risk > 1000 THEN urgency_score := urgency_score + 0.15;
    ELSIF p_people_at_risk > 100 THEN urgency_score := urgency_score + 0.1;
    ELSIF p_people_at_risk > 10 THEN urgency_score := urgency_score + 0.05;
    END IF;
    
    -- Infrastructure impact
    CASE p_infrastructure_impact
        WHEN 'catastrophic' THEN urgency_score := urgency_score + 0.2;
        WHEN 'severe' THEN urgency_score := urgency_score + 0.15;
        WHEN 'significant' THEN urgency_score := urgency_score + 0.1;
        WHEN 'moderate' THEN urgency_score := urgency_score + 0.05;
        ELSE urgency_score := urgency_score + 0.0;
    END CASE;
    
    -- Cap at 1.0
    IF urgency_score > 1.0 THEN urgency_score := 1.0; END IF;
    
    RETURN urgency_score;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Views for Common Queries
-- ========================================

-- Active ocean hazard reports with enhanced information
CREATE OR REPLACE VIEW active_ocean_hazard_reports AS
SELECT 
    r.*,
    ur.role as reporter_role,
    CASE 
        WHEN r.verification_status = 'verified_by_official' THEN 'high'
        WHEN r.verification_status = 'verified_by_community' THEN 'medium'
        WHEN r.verification_status = 'verified_by_sensor' THEN 'high'
        ELSE 'low'
    END as credibility_level,
    calculate_urgency_score(
        r.hazard_type, 
        r.severity_level, 
        r.wave_height_estimated, 
        r.people_at_risk_count, 
        r.infrastructure_impact
    ) as calculated_urgency_score
FROM reports r
LEFT JOIN user_roles ur ON r.user_id = ur.user_id
WHERE r.status NOT IN ('resolved', 'false_alarm')
ORDER BY r.severity_level DESC, r.created_at DESC;

-- High-priority social media alerts
CREATE OR REPLACE VIEW high_priority_social_alerts AS
SELECT 
    smp.*,
    CASE 
        WHEN smp.urgency_level >= 4 AND smp.confidence_score >= 0.8 THEN 'critical'
        WHEN smp.urgency_level >= 3 AND smp.confidence_score >= 0.7 THEN 'high'
        WHEN smp.urgency_level >= 2 AND smp.confidence_score >= 0.6 THEN 'medium'
        ELSE 'low'
    END as priority_classification
FROM social_media_posts smp
WHERE smp.urgency_level >= 3 
    AND smp.confidence_score >= 0.6
    AND smp.fake_news_probability <= 0.3
ORDER BY smp.urgency_level DESC, smp.confidence_score DESC, smp.collected_at DESC;

-- Active hotspots with risk assessment
CREATE OR REPLACE VIEW active_ocean_hotspots AS
SELECT 
    ohh.*,
    CASE 
        WHEN ohh.intensity_score >= 8 AND ohh.alert_level >= 4 THEN 'extreme_risk'
        WHEN ohh.intensity_score >= 6 AND ohh.alert_level >= 3 THEN 'high_risk'
        WHEN ohh.intensity_score >= 4 AND ohh.alert_level >= 2 THEN 'moderate_risk'
        ELSE 'low_risk'
    END as risk_classification,
    CASE 
        WHEN ohh.expected_duration_hours IS NOT NULL THEN 
            ohh.first_detected_at + (ohh.expected_duration_hours || ' hours')::INTERVAL
        ELSE NULL
    END as expected_resolution_time
FROM ocean_hazard_hotspots ohh
WHERE ohh.status IN ('emerging', 'active', 'escalating')
ORDER BY ohh.intensity_score DESC, ohh.alert_level DESC;

-- Current INCOIS warnings summary
CREATE OR REPLACE VIEW current_incois_warnings AS
SELECT 
    iew.*,
    CASE 
        WHEN iew.expires_at < NOW() THEN 'expired'
        WHEN iew.effective_from > NOW() THEN 'future'
        ELSE 'active'
    END as current_status,
    EXTRACT(EPOCH FROM (iew.expires_at - NOW()))/3600 as hours_until_expiry
FROM incois_early_warnings iew
WHERE iew.status = 'active'
ORDER BY iew.severity_level DESC, iew.issued_at DESC;

-- ========================================
-- Comments and Documentation
-- ========================================

COMMENT ON TABLE reports IS 'Enhanced ocean hazard reporting with INCOIS integration and marine-specific fields';
COMMENT ON TABLE social_media_posts IS 'Social media monitoring and analysis for ocean hazard detection';
COMMENT ON TABLE user_roles IS 'Maritime-focused user roles and permissions for coastal community engagement';
COMMENT ON TABLE ocean_hazard_hotspots IS 'Dynamic hotspot detection and analysis for ocean hazards';
COMMENT ON TABLE incois_early_warnings IS 'Integration with INCOIS early warning system';
COMMENT ON TABLE sensor_data_feeds IS 'Marine sensor data integration for validation and correlation';
COMMENT ON TABLE notifications IS 'Enhanced notification system for marine emergency communications';

-- Sample data inserts for testing (optional)
INSERT INTO reports (
    report_id, title, description, hazard_type, location, 
    wave_height_estimated, severity_level, user_id
) VALUES (
    generate_report_id(),
    'High waves observed near Visakhapatnam port',
    'Unusually high waves of approximately 4-5 meters observed near the port area, affecting fishing operations',
    'high_waves',
    '{"lat": 17.6868, "lng": 83.2185, "address": "Visakhapatnam Port, Andhra Pradesh"}',
    4.5,
    3,
    uuid_generate_v4()
) ON CONFLICT DO NOTHING;

-- Success message
SELECT 'SagarSetu Ocean Hazard Reporting Database Schema created successfully!' as status;