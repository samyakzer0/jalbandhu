-- Fix user_id column type to accept emails and anonymous users
-- Run this after the main migration to fix the UUID type issue

DO $$
BEGIN
    -- Change user_id from UUID to TEXT to support emails and anonymous users
    ALTER TABLE reports ALTER COLUMN user_id TYPE TEXT;
    RAISE NOTICE 'Changed user_id column from UUID to TEXT';
    
    -- Add a check constraint to ensure user_id is not empty
    ALTER TABLE reports ADD CONSTRAINT check_user_id_not_empty 
    CHECK (user_id IS NOT NULL AND LENGTH(TRIM(user_id)) > 0);
    RAISE NOTICE 'Added check constraint for user_id';
    
    RAISE NOTICE 'User ID column type fix completed successfully!';
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Check constraint already exists, continuing...';
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error during migration: %', SQLERRM;
    RAISE;
END
$$;