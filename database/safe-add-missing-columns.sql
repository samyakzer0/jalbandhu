-- Safe Migration Script: Add missing columns to existing reports table
-- This script preserves existing data if the table already exists

DO $$
BEGIN
    -- Check if reports table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reports' AND table_schema = 'public') THEN
        
        RAISE NOTICE 'Reports table exists, adding missing columns...';
        
        -- Add basic columns that might be missing
        BEGIN
            ALTER TABLE reports ADD COLUMN report_id VARCHAR(50);
            RAISE NOTICE 'Added report_id column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column report_id already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN title VARCHAR(200);
            RAISE NOTICE 'Added title column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column title already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN description TEXT;
            RAISE NOTICE 'Added description column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column description already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN category VARCHAR(50);
            RAISE NOTICE 'Added category column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column category already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN location VARCHAR(200);
            RAISE NOTICE 'Added location column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column location already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN city VARCHAR(100);
            RAISE NOTICE 'Added city column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column city already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN priority VARCHAR(20) DEFAULT 'Medium';
            RAISE NOTICE 'Added priority column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column priority already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN image_url TEXT;
            RAISE NOTICE 'Added image_url column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column image_url already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN status VARCHAR(20) DEFAULT 'Submitted';
            RAISE NOTICE 'Added status column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column status already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
            RAISE NOTICE 'Added created_at column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column created_at already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
            RAISE NOTICE 'Added updated_at column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column updated_at already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN user_id UUID;
            RAISE NOTICE 'Added user_id column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column user_id already exists';
        END;
        
        -- Add Smart Camera columns
        BEGIN
            ALTER TABLE reports ADD COLUMN is_smart_camera_report BOOLEAN DEFAULT FALSE;
            RAISE NOTICE 'Added is_smart_camera_report column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column is_smart_camera_report already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN ai_confidence DECIMAL(3,2);
            RAISE NOTICE 'Added ai_confidence column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column ai_confidence already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN smart_camera_capture_id VARCHAR(100);
            RAISE NOTICE 'Added smart_camera_capture_id column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column smart_camera_capture_id already exists';
        END;
        
        -- Add ocean-specific metadata fields
        BEGIN
            ALTER TABLE reports ADD COLUMN wave_height_estimated DECIMAL(5,2);
            RAISE NOTICE 'Added wave_height_estimated column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column wave_height_estimated already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN wave_height_category VARCHAR(20);
            RAISE NOTICE 'Added wave_height_category column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column wave_height_category already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN water_level_change VARCHAR(20);
            RAISE NOTICE 'Added water_level_change column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column water_level_change already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN current_strength VARCHAR(20);
            RAISE NOTICE 'Added current_strength column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column current_strength already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN tide_information VARCHAR(30);
            RAISE NOTICE 'Added tide_information column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column tide_information already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN wind_speed_kmh DECIMAL(5,2);
            RAISE NOTICE 'Added wind_speed_kmh column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column wind_speed_kmh already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN wind_direction VARCHAR(10);
            RAISE NOTICE 'Added wind_direction column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column wind_direction already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN visibility_km DECIMAL(5,2);
            RAISE NOTICE 'Added visibility_km column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column visibility_km already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN water_temperature_celsius DECIMAL(5,2);
            RAISE NOTICE 'Added water_temperature_celsius column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column water_temperature_celsius already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN safety_threat_level VARCHAR(20) DEFAULT 'moderate';
            RAISE NOTICE 'Added safety_threat_level column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column safety_threat_level already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN people_at_risk_count INTEGER DEFAULT 0;
            RAISE NOTICE 'Added people_at_risk_count column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column people_at_risk_count already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN infrastructure_impact VARCHAR(30) DEFAULT 'minimal';
            RAISE NOTICE 'Added infrastructure_impact column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column infrastructure_impact already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN fishing_activity_affected BOOLEAN DEFAULT FALSE;
            RAISE NOTICE 'Added fishing_activity_affected column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column fishing_activity_affected already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN shipping_lanes_affected BOOLEAN DEFAULT FALSE;
            RAISE NOTICE 'Added shipping_lanes_affected column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column shipping_lanes_affected already exists';
        END;
        
        -- Add blockchain proof columns
        BEGIN
            ALTER TABLE reports ADD COLUMN proof_cid VARCHAR(200);
            RAISE NOTICE 'Added proof_cid column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column proof_cid already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN proof_timestamp VARCHAR(100);
            RAISE NOTICE 'Added proof_timestamp column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column proof_timestamp already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN proof_created_at TIMESTAMPTZ;
            RAISE NOTICE 'Added proof_created_at column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column proof_created_at already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN proof_verification_status VARCHAR(20) CHECK (proof_verification_status IN ('pending', 'verified', 'failed'));
            RAISE NOTICE 'Added proof_verification_status column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column proof_verification_status already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN proof_status VARCHAR(20) CHECK (proof_status IN ('created', 'failed', 'not_attempted'));
            RAISE NOTICE 'Added proof_status column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column proof_status already exists';
        END;
        
        BEGIN
            ALTER TABLE reports ADD COLUMN proof_error TEXT;
            RAISE NOTICE 'Added proof_error column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column proof_error already exists';
        END;
        
        -- Add status history column (JSONB array for tracking report lifecycle)
        BEGIN
            ALTER TABLE reports ADD COLUMN status_history JSONB DEFAULT '[]';
            RAISE NOTICE 'Added status_history column';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Column status_history already exists';
        END;
        
        RAISE NOTICE 'Migration completed successfully!';
        
    ELSE
        RAISE NOTICE 'Reports table does not exist. Please run create-sagar-setu-reports-table.sql first';
    END IF;
END
$$;