-- Simple fix: Remove user_roles constraint and grant admin access
-- Run this in your Supabase SQL Editor

-- Step 1: Remove the problematic constraint
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;

-- Step 2: Grant admin role
INSERT INTO user_roles (user_id, role) 
VALUES ('ee415b6b-0ffa-4567-a3f4-0d59c217cea6', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: Grant category access
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