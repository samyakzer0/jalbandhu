-- Create comments schema for SagarSetu hazard commentary system
-- This replaces task management with admin commentary on coastal hazard reports

DO $$
BEGIN
    -- Create hazard_comments table for admin commentary on reports
    CREATE TABLE IF NOT EXISTS hazard_comments (
        id SERIAL PRIMARY KEY,
        report_id VARCHAR(50) REFERENCES reports(report_id) ON DELETE CASCADE,
        hazard_type_id INTEGER DEFAULT 1, -- References hazard category
        commenter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        comment_text TEXT NOT NULL,
        comment_type VARCHAR(50) DEFAULT 'general' CHECK (comment_type IN ('general', 'advisory', 'urgent', 'resolved', 'analysis')),
        urgency_level VARCHAR(20) DEFAULT 'medium' CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
        is_public BOOLEAN DEFAULT false, -- whether visible to report submitter
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
        parent_comment_id INTEGER REFERENCES hazard_comments(id) ON DELETE SET NULL, -- for threaded comments
        metadata JSONB DEFAULT '{}', -- additional context like weather conditions, response actions
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        
        -- Ocean hazard specific context
        affected_area_km2 DECIMAL(10,2),
        wave_height_meters DECIMAL(5,2),
        wind_speed_kmh DECIMAL(6,2),
        tide_level VARCHAR(20) CHECK (tide_level IN ('low', 'normal', 'high', 'extreme')),
        response_required BOOLEAN DEFAULT false,
        estimated_resolution_time INTERVAL,
        
        -- Geographic context
        coastal_state VARCHAR(100),
        nearest_port VARCHAR(100),
        coordinates POINT
    );
    
    RAISE NOTICE 'Created hazard_comments table';
    
    -- Create comment_reactions table for acknowledgments and reactions
    CREATE TABLE IF NOT EXISTS comment_reactions (
        id SERIAL PRIMARY KEY,
        comment_id INTEGER REFERENCES hazard_comments(id) ON DELETE CASCADE,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        reaction_type VARCHAR(20) CHECK (reaction_type IN ('helpful', 'acknowledged', 'implemented', 'urgent', 'resolved')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        
        -- Prevent duplicate reactions from same user on same comment
        UNIQUE(comment_id, user_id, reaction_type)
    );
    
    RAISE NOTICE 'Created comment_reactions table';
    
    -- Create indexes for optimal performance
    CREATE INDEX IF NOT EXISTS idx_hazard_comments_report_hazard ON hazard_comments(report_id, hazard_type_id);
    CREATE INDEX IF NOT EXISTS idx_hazard_comments_urgency_time ON hazard_comments(urgency_level, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_hazard_comments_status ON hazard_comments(status) WHERE status = 'active';
    CREATE INDEX IF NOT EXISTS idx_hazard_comments_commenter ON hazard_comments(commenter_id) WHERE commenter_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_hazard_comments_public ON hazard_comments(is_public) WHERE is_public = true;
    CREATE INDEX IF NOT EXISTS idx_hazard_comments_type_urgency ON hazard_comments(comment_type, urgency_level);
    CREATE INDEX IF NOT EXISTS idx_hazard_comments_parent ON hazard_comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_hazard_comments_state ON hazard_comments(coastal_state) WHERE coastal_state IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_hazard_comments_response ON hazard_comments(response_required, created_at) WHERE response_required = true;
    
    -- Index for comment reactions
    CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON comment_reactions(comment_id);
    CREATE INDEX IF NOT EXISTS idx_comment_reactions_user ON comment_reactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_comment_reactions_type ON comment_reactions(reaction_type);
    
    -- Enable RLS on comment tables
    ALTER TABLE hazard_comments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;
    
    -- RLS policies for hazard_comments
    DROP POLICY IF EXISTS "Public comments are viewable by everyone" ON hazard_comments;
    CREATE POLICY "Public comments are viewable by everyone" ON hazard_comments 
    FOR SELECT USING (is_public = true OR auth.uid() IS NOT NULL);
    
    DROP POLICY IF EXISTS "Admins can view all comments" ON hazard_comments;
    CREATE POLICY "Admins can view all comments" ON hazard_comments 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'analyst', 'official', 'system_admin', 'maritime_official')
        )
    );
    
    DROP POLICY IF EXISTS "Authorized users can create comments" ON hazard_comments;
    CREATE POLICY "Authorized users can create comments" ON hazard_comments 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'analyst', 'official', 'system_admin', 'maritime_official')
        )
    );
    
    DROP POLICY IF EXISTS "Users can update their own comments" ON hazard_comments;
    CREATE POLICY "Users can update their own comments" ON hazard_comments 
    FOR UPDATE USING (
        commenter_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'analyst', 'system_admin')
        )
    );
    
    -- RLS policies for comment_reactions
    DROP POLICY IF EXISTS "Users can view all reactions" ON comment_reactions;
    CREATE POLICY "Users can view all reactions" ON comment_reactions 
    FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Users can create reactions" ON comment_reactions;
    CREATE POLICY "Users can create reactions" ON comment_reactions 
    FOR INSERT WITH CHECK (user_id = auth.uid());
    
    DROP POLICY IF EXISTS "Users can update their own reactions" ON comment_reactions;
    CREATE POLICY "Users can update their own reactions" ON comment_reactions 
    FOR UPDATE USING (user_id = auth.uid());
    
    DROP POLICY IF EXISTS "Users can delete their own reactions" ON comment_reactions;
    CREATE POLICY "Users can delete their own reactions" ON comment_reactions 
    FOR DELETE USING (user_id = auth.uid());
    
    RAISE NOTICE 'Created indexes and RLS policies for comment tables';
    
    -- Insert sample hazard comments
    INSERT INTO hazard_comments (
        report_id, hazard_type_id, commenter_id, comment_text, comment_type, 
        urgency_level, is_public, coastal_state, response_required, metadata
    ) VALUES 
    ('SGST-2024-001', 1, 'ee415b6b-0ffa-4567-a3f4-0d59c217cea6', 
     'Tsunami warning issued for eastern coast. All coastal areas should be evacuated immediately. Wave heights expected to reach 8-10 meters.', 
     'urgent', 'critical', true, 'Tamil Nadu', true, 
     '{"evacuation_zones": ["Zone A", "Zone B"], "estimated_arrival": "2024-03-15T14:30:00Z", "source": "INCOIS"}'),
     
    ('SGST-2024-002', 2, 'ee415b6b-0ffa-4567-a3f4-0d59c217cea6', 
     'Storm surge monitoring indicates 3-meter waves approaching Kerala coast. Fishermen advised to return to harbor immediately.', 
     'advisory', 'high', true, 'Kerala', true,
     '{"wave_height": 3.2, "wind_speed": 65, "affected_ports": ["Kochi", "Alappuzha"]}'),
     
    ('SGST-2024-003', 3, 'ee415b6b-0ffa-4567-a3f4-0d59c217cea6', 
     'High wave conditions observed in Bay of Bengal. Coastal erosion risk elevated for next 48 hours.', 
     'general', 'medium', false, 'Andhra Pradesh', false,
     '{"duration_hours": 48, "erosion_risk": "elevated", "monitoring_stations": 3}'),
     
    ('SGST-2024-001', 1, 'ee415b6b-0ffa-4567-a3f4-0d59c217cea6', 
     'Update: Evacuation proceeding smoothly. Emergency shelters at 80% capacity. Continuing to monitor wave progression.', 
     'analysis', 'high', true, 'Tamil Nadu', true,
     '{"shelter_capacity": 80, "evacuated_population": 15000, "status": "ongoing"}')
    ON CONFLICT DO NOTHING;
    
    -- Insert sample reactions
    INSERT INTO comment_reactions (comment_id, user_id, reaction_type) VALUES 
    (1, 'ee415b6b-0ffa-4567-a3f4-0d59c217cea6', 'urgent'),
    (1, 'ee415b6b-0ffa-4567-a3f4-0d59c217cea6', 'acknowledged'),
    (2, 'ee415b6b-0ffa-4567-a3f4-0d59c217cea6', 'helpful'),
    (3, 'ee415b6b-0ffa-4567-a3f4-0d59c217cea6', 'acknowledged')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Inserted sample hazard comments and reactions';
    RAISE NOTICE 'Comments schema setup completed successfully!';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating comments schema: %', SQLERRM;
    RAISE;
END
$$;