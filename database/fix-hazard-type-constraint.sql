-- Fix hazard_type check constraint issue
-- This will show current constraint and update it for ocean hazards

DO $$
BEGIN
    -- First, let's see what the current check constraint allows
    -- Drop the existing check constraint
    ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_hazard_type_check;
    RAISE NOTICE 'Dropped existing hazard_type check constraint';
    
    -- Create a new check constraint with ocean hazard types
    ALTER TABLE reports ADD CONSTRAINT reports_hazard_type_check 
    CHECK (hazard_type IN (
        'tsunami',
        'storm_surge', 
        'high_waves',
        'swell_surge',
        'coastal_current',
        'coastal_erosion',
        'marine_debris',
        'unusual_sea_behavior',
        'infrastructure_damage',
        'general_hazard',
        'water_quality_issue',
        'flood_risk',
        'sea_level_anomaly'
    ));
    RAISE NOTICE 'Added new hazard_type check constraint for ocean hazards';
    
    -- Also make sure the column allows NULL values as backup
    ALTER TABLE reports ALTER COLUMN hazard_type DROP NOT NULL;
    RAISE NOTICE 'Made hazard_type column nullable';
    
    -- Set default value
    ALTER TABLE reports ALTER COLUMN hazard_type SET DEFAULT 'general_hazard';
    RAISE NOTICE 'Set default value for hazard_type column';
    
    RAISE NOTICE 'Hazard type constraint fix completed successfully!';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error during hazard_type constraint fix: %', SQLERRM;
    RAISE;
END
$$;