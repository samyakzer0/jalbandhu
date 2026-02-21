-- Fix status check constraint issue
-- This will update the constraint to allow the status values used by the app

DO $$
BEGIN
    -- Drop the existing status check constraint
    ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_status_check;
    RAISE NOTICE 'Dropped existing status check constraint';
    
    -- Create a new check constraint with the status values used by SagarSetu
    ALTER TABLE reports ADD CONSTRAINT reports_status_check 
    CHECK (status IN (
        'Submitted',
        'Under Review', 
        'In Review',
        'In Progress',
        'Forwarded',
        'Resolved',
        'Rejected',
        'Closed'
    ));
    RAISE NOTICE 'Added new status check constraint for SagarSetu';
    
    -- Set default value
    ALTER TABLE reports ALTER COLUMN status SET DEFAULT 'Submitted';
    RAISE NOTICE 'Set default status to Submitted';
    
    RAISE NOTICE 'Status constraint fix completed successfully!';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error during status constraint fix: %', SQLERRM;
    RAISE;
END
$$;