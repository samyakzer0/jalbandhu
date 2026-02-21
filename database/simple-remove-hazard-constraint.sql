-- Simple fix: Remove hazard_type check constraint entirely
-- This allows any value for hazard_type

ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_hazard_type_check;
ALTER TABLE reports ALTER COLUMN hazard_type DROP NOT NULL;
ALTER TABLE reports ALTER COLUMN hazard_type SET DEFAULT 'general_hazard';