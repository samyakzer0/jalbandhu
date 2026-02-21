-- Simple fix: Remove status check constraint entirely
-- This allows any status value

ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_status_check;