-- Create the report_tasks table for SagarSetu Ocean Hazard Platform
-- This table manages tasks assigned for ocean hazard reports

DO $$
BEGIN
    -- Create the report_tasks table
    CREATE TABLE IF NOT EXISTS report_tasks (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        report_id VARCHAR(50) NOT NULL,
        task_description TEXT NOT NULL,
        assigned_by UUID REFERENCES auth.users(id),
        assigned_to UUID REFERENCES auth.users(id),
        category VARCHAR(50) NOT NULL,
        priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
        status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Cancelled')),
        due_date TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        notes TEXT,
        
        -- Ocean hazard specific fields
        hazard_type VARCHAR(30),
        urgency_level VARCHAR(20) DEFAULT 'normal' CHECK (urgency_level IN ('low', 'normal', 'high', 'critical', 'emergency')),
        incois_alert_level VARCHAR(20),
        affected_areas TEXT[],
        estimated_completion_hours INTEGER,
        
        -- Foreign key constraint to reports table
        FOREIGN KEY (report_id) REFERENCES reports(report_id) ON DELETE CASCADE
    );
    
    RAISE NOTICE 'Created report_tasks table';
    
    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_report_tasks_report_id ON report_tasks(report_id);
    CREATE INDEX IF NOT EXISTS idx_report_tasks_category ON report_tasks(category);
    CREATE INDEX IF NOT EXISTS idx_report_tasks_status ON report_tasks(status);
    CREATE INDEX IF NOT EXISTS idx_report_tasks_priority ON report_tasks(priority);
    CREATE INDEX IF NOT EXISTS idx_report_tasks_assigned_to ON report_tasks(assigned_to) WHERE assigned_to IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_report_tasks_due_date ON report_tasks(due_date) WHERE due_date IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_report_tasks_hazard_type ON report_tasks(hazard_type) WHERE hazard_type IS NOT NULL;
    
    RAISE NOTICE 'Created indexes for report_tasks';
    
    -- Enable Row Level Security
    ALTER TABLE report_tasks ENABLE ROW LEVEL SECURITY;
    
    -- Create RLS policies
    DROP POLICY IF EXISTS "Tasks are viewable by everyone" ON report_tasks;
    CREATE POLICY "Tasks are viewable by everyone" ON report_tasks FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Users can create tasks" ON report_tasks;
    CREATE POLICY "Users can create tasks" ON report_tasks FOR INSERT WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Users can update assigned tasks" ON report_tasks;
    CREATE POLICY "Users can update assigned tasks" ON report_tasks FOR UPDATE USING (
        auth.uid() = assigned_to OR auth.uid() = assigned_by
    );
    
    DROP POLICY IF EXISTS "Admins can delete tasks" ON report_tasks;
    CREATE POLICY "Admins can delete tasks" ON report_tasks FOR DELETE USING (
        auth.uid() = assigned_by
    );
    
    RAISE NOTICE 'Set up RLS policies for report_tasks';
    
    -- Insert some sample tasks for ocean hazard categories
    INSERT INTO report_tasks (
        report_id, task_description, category, priority, status, 
        hazard_type, urgency_level, notes
    ) VALUES 
    ('SAMPLE-TS-001', 'Monitor tsunami warning systems in coastal areas', 'Tsunami Events', 'High', 'Pending', 
     'tsunami', 'critical', 'Coordinate with INCOIS early warning system'),
    ('SAMPLE-SS-001', 'Assess storm surge impact on coastal infrastructure', 'Storm Surge', 'High', 'Pending', 
     'storm_surge', 'high', 'Evaluate damage to ports and harbors'),
    ('SAMPLE-HW-001', 'Issue high wave advisory to fishing communities', 'High Waves', 'Medium', 'Pending', 
     'high_waves', 'normal', 'Coordinate with local fishing authorities'),
    ('SAMPLE-CE-001', 'Survey coastal erosion patterns', 'Coastal Erosion', 'Medium', 'Pending', 
     'coastal_erosion', 'normal', 'Monthly monitoring of critical beach areas'),
    ('SAMPLE-MD-001', 'Marine debris cleanup coordination', 'Marine Debris', 'Low', 'Pending', 
     'marine_debris', 'low', 'Organize volunteer cleanup activities')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Inserted sample tasks for ocean hazard categories';
    
    RAISE NOTICE 'Report tasks table setup completed successfully!';
    RAISE NOTICE 'Admin panel task management is now functional';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating report_tasks table: %', SQLERRM;
    RAISE;
END
$$;