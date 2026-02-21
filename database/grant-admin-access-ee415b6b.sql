-- Grant admin access to user ee415b6b-0ffa-4567-a3f4-0d59c217cea6 for all ocean hazard categories
-- Run this in your Supabase SQL Editor

DO $$
BEGIN
    -- First, make the user an admin
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
    
    -- Verify the grants were successful
    RAISE NOTICE 'Admin setup completed for user ee415b6b-0ffa-4567-a3f4-0d59c217cea6';
    RAISE NOTICE 'User now has full admin access to SagarSetu Ocean Hazard Platform';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error granting admin access: %', SQLERRM;
    RAISE;
END
$$;

-- Verify the setup (optional - run this separately to check)
-- SELECT 'Admin Role:' as type, role FROM user_roles WHERE user_id = 'ee415b6b-0ffa-4567-a3f4-0d59c217cea6'
-- UNION ALL
-- SELECT 'Category Access:', category FROM category_admins WHERE user_id = 'ee415b6b-0ffa-4567-a3f4-0d59c217cea6'
-- ORDER BY type, role;