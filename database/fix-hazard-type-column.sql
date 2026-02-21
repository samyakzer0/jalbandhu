-- Fix hazard_type column constraint issue
-- This will make hazard_type nullable or provide a default value

DO $$
BEGIN
    -- Option 1: Make hazard_type nullable (since the code doesn't use it yet)
    ALTER TABLE reports ALTER COLUMN hazard_type DROP NOT NULL;
    RAISE NOTICE 'Removed NOT NULL constraint from hazard_type column';
    
    -- Option 2: Set a default value based on category mapping for ocean hazards
    ALTER TABLE reports ALTER COLUMN hazard_type SET DEFAULT 'general_hazard';
    RAISE NOTICE 'Set default value for hazard_type column';
    
    RAISE NOTICE 'Hazard type column fix completed successfully!';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error during hazard_type fix: %', SQLERRM;
    RAISE;
END
$$;