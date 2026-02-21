-- Create additional tables needed for SagarSetu admin functionality
-- This includes proof_statistics and other supporting tables

DO $$
BEGIN
    -- Create proof_statistics table for admin dashboard analytics
    CREATE TABLE IF NOT EXISTS proof_statistics (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        total_reports INTEGER DEFAULT 0,
        reports_with_proof INTEGER DEFAULT 0,
        verified_proofs INTEGER DEFAULT 0,
        pending_proofs INTEGER DEFAULT 0,
        failed_proofs INTEGER DEFAULT 0,
        proof_coverage_percentage DECIMAL(5,2) DEFAULT 0.00,
        last_updated TIMESTAMPTZ DEFAULT NOW(),
        
        -- Ocean hazard specific stats
        tsunami_reports INTEGER DEFAULT 0,
        storm_surge_reports INTEGER DEFAULT 0,
        high_waves_reports INTEGER DEFAULT 0,
        coastal_erosion_reports INTEGER DEFAULT 0,
        marine_debris_reports INTEGER DEFAULT 0,
        
        -- Geographic breakdown
        coastal_state VARCHAR(50),
        district VARCHAR(100),
        
        -- Time period for stats
        stats_period VARCHAR(20) DEFAULT 'daily' CHECK (stats_period IN ('hourly', 'daily', 'weekly', 'monthly')),
        stats_date DATE DEFAULT CURRENT_DATE
    );
    
    RAISE NOTICE 'Created proof_statistics table';
    
    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_proof_statistics_date ON proof_statistics(stats_date);
    CREATE INDEX IF NOT EXISTS idx_proof_statistics_period ON proof_statistics(stats_period);
    CREATE INDEX IF NOT EXISTS idx_proof_statistics_state ON proof_statistics(coastal_state) WHERE coastal_state IS NOT NULL;
    
    -- Create notifications table for admin alerts
    CREATE TABLE IF NOT EXISTS admin_notifications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        notification_type VARCHAR(30) DEFAULT 'info' CHECK (notification_type IN ('info', 'warning', 'error', 'success', 'urgent')),
        priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
        
        -- Ocean hazard context
        related_report_id VARCHAR(50),
        hazard_category VARCHAR(50),
        affected_location TEXT,
        
        -- Notification status
        is_read BOOLEAN DEFAULT FALSE,
        is_dismissed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        read_at TIMESTAMPTZ,
        dismissed_at TIMESTAMPTZ,
        
        -- Target admin
        admin_user_id UUID REFERENCES auth.users(id),
        
        FOREIGN KEY (related_report_id) REFERENCES reports(report_id) ON DELETE SET NULL
    );
    
    RAISE NOTICE 'Created admin_notifications table';
    
    -- Create indexes for notifications
    CREATE INDEX IF NOT EXISTS idx_admin_notifications_user ON admin_notifications(admin_user_id) WHERE admin_user_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_admin_notifications_unread ON admin_notifications(is_read, created_at) WHERE is_read = FALSE;
    CREATE INDEX IF NOT EXISTS idx_admin_notifications_priority ON admin_notifications(priority, created_at);
    CREATE INDEX IF NOT EXISTS idx_admin_notifications_category ON admin_notifications(hazard_category) WHERE hazard_category IS NOT NULL;
    
    -- Enable RLS on new tables
    ALTER TABLE proof_statistics ENABLE ROW LEVEL SECURITY;
    ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
    
    -- RLS policies for proof_statistics
    DROP POLICY IF EXISTS "Proof statistics are viewable by admins" ON proof_statistics;
    CREATE POLICY "Proof statistics are viewable by admins" ON proof_statistics FOR SELECT USING (true);
    
    -- RLS policies for admin_notifications
    DROP POLICY IF EXISTS "Admins can view their notifications" ON admin_notifications;
    CREATE POLICY "Admins can view their notifications" ON admin_notifications FOR SELECT USING (
        admin_user_id IS NULL OR auth.uid() = admin_user_id
    );
    
    DROP POLICY IF EXISTS "Admins can update their notifications" ON admin_notifications;
    CREATE POLICY "Admins can update their notifications" ON admin_notifications FOR UPDATE USING (
        admin_user_id IS NULL OR auth.uid() = admin_user_id
    );
    
    -- Insert sample data
    INSERT INTO proof_statistics (
        total_reports, reports_with_proof, verified_proofs, pending_proofs,
        proof_coverage_percentage, tsunami_reports, storm_surge_reports,
        coastal_state, stats_period
    ) VALUES 
    (150, 120, 95, 25, 80.00, 15, 25, 'Tamil Nadu', 'daily'),
    (89, 67, 52, 15, 75.28, 8, 18, 'Kerala', 'daily'),
    (203, 185, 165, 20, 91.13, 22, 35, 'Andhra Pradesh', 'daily')
    ON CONFLICT DO NOTHING;
    
    -- Insert sample notifications
    INSERT INTO admin_notifications (
        title, message, notification_type, priority, hazard_category,
        affected_location, admin_user_id
    ) VALUES 
    ('High Wave Alert', 'Severe weather conditions detected in Bay of Bengal', 'warning', 'high', 'High Waves', 'Tamil Nadu Coast', 'ee415b6b-0ffa-4567-a3f4-0d59c217cea6'),
    ('Tsunami Watch Issued', 'INCOIS has issued tsunami watch for eastern coast', 'urgent', 'critical', 'Tsunami Events', 'Eastern Coast', 'ee415b6b-0ffa-4567-a3f4-0d59c217cea6'),
    ('Coastal Erosion Report', 'Monthly erosion assessment completed', 'info', 'normal', 'Coastal Erosion', 'Kerala Backwaters', 'ee415b6b-0ffa-4567-a3f4-0d59c217cea6')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Inserted sample data for admin tables';
    RAISE NOTICE 'Additional admin tables setup completed successfully!';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating additional admin tables: %', SQLERRM;
    RAISE;
END
$$;