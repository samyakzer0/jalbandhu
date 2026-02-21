-- Simple fix for user_id column type issue
-- This will change the user_id column from UUID to TEXT

ALTER TABLE reports ALTER COLUMN user_id TYPE TEXT;