-- Modify existing tables to support the comments system
-- Add comment tracking and admin status to reports table

DO $$
BEGIN
    -- Add comment tracking fields to reports table
    ALTER TABLE reports 
    ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS latest_comment_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS admin_status VARCHAR(50) DEFAULT 'pending' 
        CHECK (admin_status IN ('pending', 'reviewed', 'responded', 'resolved', 'monitoring'));
    
    RAISE NOTICE 'Added comment tracking fields to reports table';
    
    -- Create index for admin status filtering
    CREATE INDEX IF NOT EXISTS idx_reports_admin_status ON reports(admin_status);
    CREATE INDEX IF NOT EXISTS idx_reports_comment_count ON reports(comment_count) WHERE comment_count > 0;
    CREATE INDEX IF NOT EXISTS idx_reports_latest_comment ON reports(latest_comment_at DESC) WHERE latest_comment_at IS NOT NULL;
    
    -- Create function to update comment count when comments are added/removed
    CREATE OR REPLACE FUNCTION update_report_comment_count()
    RETURNS TRIGGER AS $func$
    BEGIN
        IF TG_OP = 'INSERT' THEN
            UPDATE reports 
            SET comment_count = comment_count + 1,
                latest_comment_at = NEW.created_at,
                admin_status = CASE 
                    WHEN admin_status = 'pending' THEN 'reviewed'
                    ELSE admin_status
                END
            WHERE report_id = NEW.report_id;
            RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE reports 
            SET comment_count = GREATEST(comment_count - 1, 0),
                latest_comment_at = (
                    SELECT MAX(created_at) 
                    FROM hazard_comments 
                    WHERE report_id = OLD.report_id AND status = 'active'
                )
            WHERE report_id = OLD.report_id;
            RETURN OLD;
        END IF;
        RETURN NULL;
    END;
    $func$ LANGUAGE plpgsql;
    
    -- Create triggers for automatic comment count updates
    DROP TRIGGER IF EXISTS trigger_update_comment_count_insert ON hazard_comments;
    CREATE TRIGGER trigger_update_comment_count_insert
        AFTER INSERT ON hazard_comments
        FOR EACH ROW EXECUTE FUNCTION update_report_comment_count();
    
    DROP TRIGGER IF EXISTS trigger_update_comment_count_delete ON hazard_comments;
    CREATE TRIGGER trigger_update_comment_count_delete
        AFTER DELETE ON hazard_comments
        FOR EACH ROW EXECUTE FUNCTION update_report_comment_count();
    
    RAISE NOTICE 'Created comment count update triggers';
    
    -- Update existing user roles with comment permissions
    UPDATE user_roles 
    SET permissions = COALESCE(permissions, '[]'::jsonb) || 
        '["create_comments", "view_all_comments", "moderate_comments"]'::jsonb
    WHERE role_name IN ('admin', 'analyst', 'official');
    
    -- Add specific comment permissions for different roles
    UPDATE user_roles 
    SET permissions = COALESCE(permissions, '[]'::jsonb) || 
        '["set_critical_urgency", "manage_comment_visibility", "archive_comments"]'::jsonb
    WHERE role_name IN ('admin', 'analyst');
    
    -- Add limited comment permissions for officials
    UPDATE user_roles 
    SET permissions = COALESCE(permissions, '[]'::jsonb) || 
        '["create_public_comments", "view_category_comments"]'::jsonb
    WHERE role_name = 'official';
    
    RAISE NOTICE 'Updated user role permissions for comments';
    
    -- Create view for comment statistics by hazard type
    CREATE OR REPLACE VIEW hazard_comment_stats AS
    SELECT 
        hc.hazard_type_id,
        COUNT(*) as total_comments,
        COUNT(CASE WHEN hc.urgency_level = 'critical' THEN 1 END) as critical_comments,
        COUNT(CASE WHEN hc.urgency_level = 'high' THEN 1 END) as high_comments,
        COUNT(CASE WHEN hc.urgency_level = 'medium' THEN 1 END) as medium_comments,
        COUNT(CASE WHEN hc.urgency_level = 'low' THEN 1 END) as low_comments,
        COUNT(CASE WHEN hc.is_public = true THEN 1 END) as public_comments,
        COUNT(CASE WHEN hc.response_required = true THEN 1 END) as response_required_comments,
        AVG(CASE 
            WHEN hc.urgency_level = 'critical' THEN 4 
            WHEN hc.urgency_level = 'high' THEN 3 
            WHEN hc.urgency_level = 'medium' THEN 2 
            WHEN hc.urgency_level = 'low' THEN 1 
        END) as avg_urgency_score,
        MAX(hc.created_at) as latest_comment_time,
        COUNT(DISTINCT hc.report_id) as reports_with_comments,
        hc.coastal_state
    FROM hazard_comments hc
    WHERE hc.status = 'active'
    GROUP BY hc.hazard_type_id, hc.coastal_state;
    
    RAISE NOTICE 'Created hazard_comment_stats view';
    
    -- Create view for recent admin activity
    CREATE OR REPLACE VIEW recent_admin_activity AS
    SELECT 
        hc.id,
        hc.report_id,
        hc.commenter_id,
        u.email as commenter_email,
        hc.comment_text,
        hc.comment_type,
        hc.urgency_level,
        hc.is_public,
        hc.response_required,
        hc.coastal_state,
        hc.created_at,
        r.title as report_title,
        r.location as report_location,
        (
            SELECT COUNT(*) 
            FROM comment_reactions cr 
            WHERE cr.comment_id = hc.id
        ) as reaction_count
    FROM hazard_comments hc
    LEFT JOIN auth.users u ON hc.commenter_id = u.id
    LEFT JOIN reports r ON hc.report_id = r.report_id
    WHERE hc.status = 'active'
    ORDER BY hc.created_at DESC;
    
    RAISE NOTICE 'Created recent_admin_activity view';
    
    -- Initialize comment counts for existing reports
    UPDATE reports 
    SET comment_count = (
        SELECT COUNT(*) 
        FROM hazard_comments hc 
        WHERE hc.report_id = reports.report_id 
        AND hc.status = 'active'
    ),
    latest_comment_at = (
        SELECT MAX(hc.created_at) 
        FROM hazard_comments hc 
        WHERE hc.report_id = reports.report_id 
        AND hc.status = 'active'
    )
    WHERE EXISTS (
        SELECT 1 FROM hazard_comments hc 
        WHERE hc.report_id = reports.report_id
    );
    
    RAISE NOTICE 'Initialized comment counts for existing reports';
    
    RAISE NOTICE 'Table modifications for comments system completed successfully!';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error modifying tables for comments: %', SQLERRM;
    RAISE;
END
$$;