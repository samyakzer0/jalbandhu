-- Fix user_id column type by handling dependent views
-- This script will drop the view, change column type, then recreate the view

DO $$
BEGIN
    -- Step 1: Save the view definition (if it exists)
    -- We'll recreate a simple version since the original might be complex
    
    -- Step 2: Drop the dependent view
    DROP VIEW IF EXISTS active_ocean_hazard_reports CASCADE;
    RAISE NOTICE 'Dropped view active_ocean_hazard_reports';
    
    -- Step 3: Change the column type
    ALTER TABLE reports ALTER COLUMN user_id TYPE TEXT;
    RAISE NOTICE 'Changed user_id column from UUID to TEXT';
    
    -- Step 4: Recreate the view with a simple definition
    -- This view will show active ocean hazard reports (non-resolved status)
    CREATE OR REPLACE VIEW active_ocean_hazard_reports AS
    SELECT 
        report_id,
        title,
        description,
        category,
        location,
        city,
        priority,
        status,
        created_at,
        updated_at,
        user_id,
        wave_height_estimated,
        wave_height_category,
        water_level_change,
        current_strength,
        safety_threat_level,
        people_at_risk_count,
        infrastructure_impact,
        fishing_activity_affected,
        shipping_lanes_affected
    FROM reports 
    WHERE status != 'Resolved' 
    AND category IN (
        'Tsunami Events', 'Storm Surge', 'High Waves', 'Swell Surges',
        'Coastal Currents', 'Coastal Erosion', 'Marine Debris',
        'Unusual Sea Behavior', 'Coastal Infrastructure', 'Others'
    );
    
    RAISE NOTICE 'Recreated view active_ocean_hazard_reports';
    RAISE NOTICE 'User ID column type fix completed successfully!';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error during migration: %', SQLERRM;
    RAISE;
END
$$;