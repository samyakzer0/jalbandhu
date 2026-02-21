-- Fix user_roles constraint and grant admin access
-- This script will handle the constraint issue and grant proper admin access

DO $$
BEGIN
    -- First, let's drop the problematic check constraint on user_roles
    ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
    RAISE NOTICE 'Dropped user_roles check constraint';
    
    -- Add a new check constraint with proper admin values
    ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check 
    CHECK (role IN ('admin', 'moderator', 'user', 'super_admin', 'category_admin'));
    RAISE NOTICE 'Added new user_roles check constraint';
    
    -- Now grant admin access
    INSERT INTO user_roles (user_id, role) 
    VALUES ('ee415b6b-0ffa-4567-a3f4-0d59c217cea6', 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    RAISE NOTICE 'Granted admin role to user ee415b6b-0ffa-4567-a3f4-0d59c217cea6';
    
    -- Grant access to all ocean hazard categories
    INSERT INTO category_admins (user_id, category) VALUES 
    ('ee415b6b-0ffa-4567-a3f4-0d59c217cea6', 'Tsunami Events'),
    ('ee415b6b-0ffa-4567-a3f4-0d59c217cea6', 'Storm Surge'),
    ('ee415b6b-0ffa-4567-a3f4-0d59c217cea6', 'High Waves'),
    ('ee415b6b-0ffa-4567-a3f4-0d59c217cea6', 'Swell Surges'),
    ('ee415b6b-0ffa-4567-a3f4-0d59c217cea6', 'Coastal Currents'),
    ('ee415b6b-0ffa-4567-a3f4-0d59c217cea6', 'Coastal Erosion'),
    ('ee415b6b-0ffa-4567-a3f4-0d59c217cea6', 'Marine Debris'),
    ('ee415b6b-0ffa-4567-a3f4-0d59c217cea6', 'Unusual Sea Behavior'),
    ('ee415b6b-0ffa-4567-a3f4-0d59c217cea6', 'Coastal Infrastructure'),
    ('ee415b6b-0ffa-4567-a3f4-0d59c217cea6', 'Others')
    ON CONFLICT (user_id, category) DO NOTHING;
    
    RAISE NOTICE 'Granted category admin access to all 10 ocean hazard categories';
    RAISE NOTICE 'Admin setup completed successfully!';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error during admin setup: %', SQLERRM;
    -- Try alternative approach if the above fails
    BEGIN
        -- Alternative: Just remove the constraint entirely
        ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
        RAISE NOTICE 'Removed role constraint entirely as fallback';
        
        -- Try inserting again
        INSERT INTO user_roles (user_id, role) 
        VALUES ('ee415b6b-0ffa-4567-a3f4-0d59c217cea6', 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        RAISE NOTICE 'Fallback: Granted admin role';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Fallback also failed: %', SQLERRM;
        RAISE;
    END;
END
$$;