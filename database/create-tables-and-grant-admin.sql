-- Create the category_admins table and grant admin access
-- This will create the missing table and grant permissions

DO $$
BEGIN
    -- Create the category_admins table that the code expects
    CREATE TABLE IF NOT EXISTS category_admins (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        category VARCHAR(50) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, category)
    );
    RAISE NOTICE 'Created category_admins table';
    
    -- Enable Row Level Security
    ALTER TABLE category_admins ENABLE ROW LEVEL SECURITY;
    
    -- Create RLS policies
    DROP POLICY IF EXISTS "Category admins are viewable by everyone" ON category_admins;
    CREATE POLICY "Category admins are viewable by everyone" ON category_admins FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Users can manage their own categories" ON category_admins;
    CREATE POLICY "Users can manage their own categories" ON category_admins FOR ALL USING (auth.uid() = user_id);
    
    RAISE NOTICE 'Set up RLS policies for category_admins';
    
    -- Create the user_roles table if it doesn't exist
    CREATE TABLE IF NOT EXISTS user_roles (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, role)
    );
    RAISE NOTICE 'Created user_roles table';
    
    -- Enable RLS on user_roles
    ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "User roles are viewable by everyone" ON user_roles;
    CREATE POLICY "User roles are viewable by everyone" ON user_roles FOR SELECT USING (true);
    
    -- Remove any problematic constraints
    ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
    RAISE NOTICE 'Removed problematic constraints';
    
    -- Grant admin role to the user
    INSERT INTO user_roles (user_id, role) 
    VALUES ('ee415b6b-0ffa-4567-a3f4-0d59c217cea6', 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    RAISE NOTICE 'Granted admin role to user';
    
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
    RAISE NOTICE 'Setup completed successfully! User now has full admin access.';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error during setup: %', SQLERRM;
    RAISE;
END
$$;