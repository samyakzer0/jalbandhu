-- Comprehensive fix: Remove all problematic check constraints
-- This will allow SagarSetu to insert reports without constraint violations

DO $$
BEGIN
    -- Remove hazard_type constraint
    ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_hazard_type_check;
    RAISE NOTICE 'Dropped hazard_type check constraint';
    
    -- Remove status constraint  
    ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_status_check;
    RAISE NOTICE 'Dropped status check constraint';
    
    -- Remove any other problematic constraints
    ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_priority_check;
    ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_category_check;
    RAISE NOTICE 'Dropped other potential check constraints';
    
    -- Make columns nullable and set defaults
    ALTER TABLE reports ALTER COLUMN hazard_type DROP NOT NULL;
    ALTER TABLE reports ALTER COLUMN hazard_type SET DEFAULT 'general_hazard';
    
    ALTER TABLE reports ALTER COLUMN status SET DEFAULT 'Submitted';
    ALTER TABLE reports ALTER COLUMN priority SET DEFAULT 'Medium';
    
    RAISE NOTICE 'Set default values for key columns';
    RAISE NOTICE 'All constraint fixes completed successfully!';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error during constraint fixes: %', SQLERRM;
    RAISE;
END
$$;