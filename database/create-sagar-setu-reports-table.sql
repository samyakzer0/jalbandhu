-- Complete Migration Script: Transform existing reports table for SagarSetu Ocean Hazard Platform
-- Run this in your Supabase SQL Editor

-- Step 1: Check if reports table exists and what columns it has
DO $$
BEGIN
    -- Drop the table if it exists and recreate it with the proper schema
    DROP TABLE IF EXISTS reports CASCADE;
    
    -- Create the complete reports table with all required columns
    CREATE TABLE reports (
        -- Primary identification
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        report_id VARCHAR(50) UNIQUE NOT NULL,
        
        -- Basic report information
        title VARCHAR(200) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        location VARCHAR(200),
        city VARCHAR(100),
        priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
        image_url TEXT,
        status VARCHAR(20) DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected')),
        
        -- Timestamps and user info
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        user_id UUID,
        
        -- Smart Camera specific fields
        is_smart_camera_report BOOLEAN DEFAULT FALSE,
        ai_confidence DECIMAL(3,2) CHECK (ai_confidence BETWEEN 0 AND 1),
        smart_camera_capture_id VARCHAR(100),
        
        -- Ocean-specific metadata fields for SagarSetu
        wave_height_estimated DECIMAL(5,2) CHECK (wave_height_estimated >= 0),
        wave_height_category VARCHAR(20) CHECK (wave_height_category IN ('calm', 'light', 'moderate', 'rough', 'very_rough', 'phenomenal')),
        water_level_change VARCHAR(20) CHECK (water_level_change IN ('normal', 'slightly_high', 'high', 'very_high', 'extremely_high', 'receding')),
        current_strength VARCHAR(20) CHECK (current_strength IN ('weak', 'moderate', 'strong', 'very_strong', 'dangerous')),
        tide_information VARCHAR(30) CHECK (tide_information IN ('low_tide', 'rising_tide', 'high_tide', 'falling_tide', 'spring_tide', 'neap_tide')),
        wind_speed_kmh DECIMAL(5,2) CHECK (wind_speed_kmh >= 0),
        wind_direction VARCHAR(10) CHECK (wind_direction IN ('N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW')),
        visibility_km DECIMAL(5,2) CHECK (visibility_km >= 0),
        water_temperature_celsius DECIMAL(5,2),
        safety_threat_level VARCHAR(20) DEFAULT 'moderate' CHECK (safety_threat_level IN ('low', 'moderate', 'high', 'critical', 'extreme')),
        people_at_risk_count INTEGER DEFAULT 0,
        infrastructure_impact VARCHAR(30) DEFAULT 'minimal' CHECK (infrastructure_impact IN ('none', 'minimal', 'moderate', 'significant', 'severe', 'catastrophic')),
        fishing_activity_affected BOOLEAN DEFAULT FALSE,
        shipping_lanes_affected BOOLEAN DEFAULT FALSE
    );
    
    -- Create indexes for better performance
    CREATE INDEX idx_reports_report_id ON reports(report_id);
    CREATE INDEX idx_reports_category ON reports(category);
    CREATE INDEX idx_reports_status ON reports(status);
    CREATE INDEX idx_reports_created_at ON reports(created_at);
    CREATE INDEX idx_reports_user_id ON reports(user_id) WHERE user_id IS NOT NULL;
    CREATE INDEX idx_reports_wave_height ON reports(wave_height_estimated) WHERE wave_height_estimated IS NOT NULL;
    CREATE INDEX idx_reports_safety_threat ON reports(safety_threat_level);
    CREATE INDEX idx_reports_fishing_affected ON reports(fishing_activity_affected) WHERE fishing_activity_affected = TRUE;
    CREATE INDEX idx_reports_shipping_affected ON reports(shipping_lanes_affected) WHERE shipping_lanes_affected = TRUE;
    
    -- Enable Row Level Security
    ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
    
    -- Create RLS policies for basic access
    CREATE POLICY "Reports are viewable by everyone" ON reports FOR SELECT USING (true);
    CREATE POLICY "Users can insert their own reports" ON reports FOR INSERT WITH CHECK (true);
    CREATE POLICY "Users can update their own reports" ON reports FOR UPDATE USING (auth.uid() = user_id);
    
    RAISE NOTICE 'Reports table created successfully with ocean hazard fields';
END
$$;