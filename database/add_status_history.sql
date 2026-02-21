-- SQL script to add status_history column to the reports table
-- This script adds the status_history JSONB field to track report status changes over time

-- Add status_history column to reports table
ALTER TABLE reports
ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'::jsonb;

-- Add index on status_history for performance (if needed for queries)
-- CREATE INDEX IF NOT EXISTS idx_reports_status_history ON reports USING GIN (status_history);

-- Add comment to document the new field
COMMENT ON COLUMN reports.status_history IS 'JSON array containing the history of status changes for this report, including timestamps, actors, and notes';

-- Example query to check the new schema
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'reports'
-- AND column_name = 'status_history';