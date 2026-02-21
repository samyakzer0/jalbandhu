-- Migration Script: Add Ocean Hazard Fields to Existing Reports Table
-- Run this in your Supabase SQL Editor to add the missing columns

-- First, let's add the basic columns that the reports table needs
ALTER TABLE reports ADD COLUMN IF NOT EXISTS report_id VARCHAR(50) PRIMARY KEY;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS title VARCHAR(200) NOT NULL;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS category VARCHAR(50) NOT NULL;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS location VARCHAR(200);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High'));
ALTER TABLE reports ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected'));
ALTER TABLE reports ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE reports ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add Smart Camera specific columns
ALTER TABLE reports ADD COLUMN IF NOT EXISTS is_smart_camera_report BOOLEAN DEFAULT FALSE;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS ai_confidence DECIMAL(3,2) CHECK (ai_confidence BETWEEN 0 AND 1);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS smart_camera_capture_id VARCHAR(100);

-- Add the ocean-specific metadata fields
ALTER TABLE reports ADD COLUMN IF NOT EXISTS wave_height_estimated DECIMAL(5,2) CHECK (wave_height_estimated >= 0);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS wave_height_category VARCHAR(20) CHECK (wave_height_category IN ('calm', 'light', 'moderate', 'rough', 'very_rough', 'phenomenal'));
ALTER TABLE reports ADD COLUMN IF NOT EXISTS water_level_change VARCHAR(20) CHECK (water_level_change IN ('normal', 'slightly_high', 'high', 'very_high', 'extremely_high', 'receding'));
ALTER TABLE reports ADD COLUMN IF NOT EXISTS current_strength VARCHAR(20) CHECK (current_strength IN ('weak', 'moderate', 'strong', 'very_strong', 'dangerous'));
ALTER TABLE reports ADD COLUMN IF NOT EXISTS tide_information VARCHAR(30) CHECK (tide_information IN ('low_tide', 'rising_tide', 'high_tide', 'falling_tide', 'spring_tide', 'neap_tide'));
ALTER TABLE reports ADD COLUMN IF NOT EXISTS wind_speed_kmh DECIMAL(5,2) CHECK (wind_speed_kmh >= 0);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS wind_direction VARCHAR(10) CHECK (wind_direction IN ('N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'));
ALTER TABLE reports ADD COLUMN IF NOT EXISTS visibility_km DECIMAL(5,2) CHECK (visibility_km >= 0);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS water_temperature_celsius DECIMAL(5,2);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS safety_threat_level VARCHAR(20) DEFAULT 'moderate' CHECK (safety_threat_level IN ('low', 'moderate', 'high', 'critical', 'extreme'));
ALTER TABLE reports ADD COLUMN IF NOT EXISTS people_at_risk_count INTEGER DEFAULT 0;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS infrastructure_impact VARCHAR(30) DEFAULT 'minimal' CHECK (infrastructure_impact IN ('none', 'minimal', 'moderate', 'significant', 'severe', 'catastrophic'));
ALTER TABLE reports ADD COLUMN IF NOT EXISTS fishing_activity_affected BOOLEAN DEFAULT FALSE;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS shipping_lanes_affected BOOLEAN DEFAULT FALSE;

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_reports_wave_height ON reports(wave_height_estimated) WHERE wave_height_estimated IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reports_safety_threat ON reports(safety_threat_level);
CREATE INDEX IF NOT EXISTS idx_reports_fishing_affected ON reports(fishing_activity_affected) WHERE fishing_activity_affected = TRUE;
CREATE INDEX IF NOT EXISTS idx_reports_shipping_affected ON reports(shipping_lanes_affected) WHERE shipping_lanes_affected = TRUE;

-- Update any existing reports to have default ocean metadata if needed
UPDATE reports 
SET 
    safety_threat_level = COALESCE(safety_threat_level, 'moderate'),
    people_at_risk_count = COALESCE(people_at_risk_count, 0),
    infrastructure_impact = COALESCE(infrastructure_impact, 'minimal'),
    fishing_activity_affected = COALESCE(fishing_activity_affected, FALSE),
    shipping_lanes_affected = COALESCE(shipping_lanes_affected, FALSE)
WHERE safety_threat_level IS NULL 
   OR people_at_risk_count IS NULL 
   OR infrastructure_impact IS NULL 
   OR fishing_activity_affected IS NULL 
   OR shipping_lanes_affected IS NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'reports' 
AND column_name IN (
    'ai_confidence', 
    'smart_camera_capture_id',
    'wave_height_estimated',
    'wave_height_category',
    'water_level_change',
    'current_strength',
    'tide_information',
    'wind_speed_kmh',
    'wind_direction',
    'visibility_km',
    'water_temperature_celsius',
    'safety_threat_level',
    'people_at_risk_count',
    'infrastructure_impact',
    'fishing_activity_affected',
    'shipping_lanes_affected'
)
ORDER BY column_name;