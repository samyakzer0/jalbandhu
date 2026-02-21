-- Update status constraints to new workflow: Submitted -> Reviewed -> Verified
-- Migration to change from old 4-status system to new 3-status system

DO $$
BEGIN
    RAISE NOTICE 'Starting status workflow migration...';

    -- Step 1: Remove existing status constraints
    IF EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE table_name = 'reports' AND constraint_name LIKE '%status%check%'
    ) THEN
        ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_status_check;
        RAISE NOTICE 'Dropped existing status constraint';
    END IF;

    -- Step 2: Update existing data to new status types
    -- Map old statuses to new ones
    UPDATE reports SET status = 'Reviewed' WHERE status = 'In Review';
    UPDATE reports SET status = 'Verified' WHERE status = 'Resolved';
    UPDATE reports SET status = 'Verified' WHERE status = 'Forwarded'; -- Forwarded becomes Verified
    
    RAISE NOTICE 'Updated existing report statuses';

    -- Step 3: Add new status constraint with the 3-status system
    ALTER TABLE reports ADD CONSTRAINT reports_status_check 
        CHECK (status IN ('Submitted', 'Reviewed', 'Verified', 'Rejected'));
    
    RAISE NOTICE 'Added new status constraint: Submitted, Reviewed, Verified, Rejected';

    -- Step 4: Update report grouping table status constraints if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'report_groups') THEN
        -- Remove old constraint
        ALTER TABLE report_groups DROP CONSTRAINT IF EXISTS report_groups_aggregated_status_check;
        
        -- Update existing data
        UPDATE report_groups SET aggregated_status = 'Reviewed' WHERE aggregated_status = 'In Review';
        UPDATE report_groups SET aggregated_status = 'Verified' WHERE aggregated_status = 'Resolved';
        UPDATE report_groups SET aggregated_status = 'Verified' WHERE aggregated_status = 'Forwarded';
        
        -- Add new constraint
        ALTER TABLE report_groups ADD CONSTRAINT report_groups_aggregated_status_check 
            CHECK (aggregated_status IN ('Submitted', 'Reviewed', 'Verified', 'Rejected'));
        
        RAISE NOTICE 'Updated report_groups status constraints';
    END IF;

    -- Step 5: Update any views that filter by status
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'active_ocean_hazard_reports') THEN
        DROP VIEW IF EXISTS active_ocean_hazard_reports;
        
        CREATE VIEW active_ocean_hazard_reports AS
        SELECT * FROM reports 
        WHERE status != 'Verified' 
        AND created_at >= NOW() - INTERVAL '30 days'
        ORDER BY created_at DESC;
        
        RAISE NOTICE 'Updated active_ocean_hazard_reports view to use new status';
    END IF;

    -- Step 6: Update status history for existing reports to maintain timeline
    UPDATE reports 
    SET status_history = jsonb_set(
        COALESCE(status_history, '[]'::jsonb),
        '{999}',  -- Add at the end
        jsonb_build_object(
            'status', status,
            'timestamp', NOW()::text,
            'actor', 'System Migration',
            'notes', 'Status updated during system migration to new 3-status workflow'
        ),
        true
    )
    WHERE status_history IS NULL OR jsonb_array_length(status_history) = 0;
    
    RAISE NOTICE 'Updated status history for reports without history';

    RAISE NOTICE 'Status workflow migration completed successfully!';
    RAISE NOTICE 'New workflow: Submitted -> Reviewed -> Verified';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error during status migration: %', SQLERRM;
    RAISE;
END
$$;