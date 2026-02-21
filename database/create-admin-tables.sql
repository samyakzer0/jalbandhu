-- Create admin tables for SagarSetu Ocean Hazard Platform
-- Run this in your Supabase SQL Editor

-- Create user_roles table for admin access control
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'moderator', 'user')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Create category_admins table for category-specific admin rights
CREATE TABLE IF NOT EXISTS category_admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, category)
);

-- Enable Row Level Security
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_admins ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "User roles are viewable by everyone" ON user_roles FOR SELECT USING (true);
CREATE POLICY "Category admins are viewable by everyone" ON category_admins FOR SELECT USING (true);

-- Insert sample admin data (replace with your actual user ID and email)
-- First, get your user ID from Supabase Auth users table, then run:

-- Example: Make a user admin (replace 'your-user-id-here' with actual UUID)
-- INSERT INTO user_roles (user_id, role) VALUES ('your-user-id-here', 'admin');

-- Example: Grant admin access to all ocean hazard categories
-- INSERT INTO category_admins (user_id, category) VALUES 
-- ('your-user-id-here', 'Tsunami Events'),
-- ('your-user-id-here', 'Storm Surge'),
-- ('your-user-id-here', 'High Waves'),
-- ('your-user-id-here', 'Swell Surges'),
-- ('your-user-id-here', 'Coastal Currents'),
-- ('your-user-id-here', 'Coastal Erosion'),
-- ('your-user-id-here', 'Marine Debris'),
-- ('your-user-id-here', 'Unusual Sea Behavior'),
-- ('your-user-id-here', 'Coastal Infrastructure'),
-- ('your-user-id-here', 'Others');

RAISE NOTICE 'Admin tables created successfully!';
RAISE NOTICE 'Next steps:';
RAISE NOTICE '1. Get your user ID from auth.users table';
RAISE NOTICE '2. Insert your user ID into user_roles with role = admin';
RAISE NOTICE '3. Insert your user ID into category_admins for each ocean hazard category';