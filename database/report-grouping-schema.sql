-- Report Grouping System Database Schema
-- This schema supports duplicate/related report detection and grouping
-- It's designed to be non-intrusive to existing report workflows

-- Table to store report groups
CREATE TABLE IF NOT EXISTS report_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id VARCHAR(50) UNIQUE NOT NULL, -- Human-readable group identifier (e.g., "GRP-2025-001")
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Aggregated metadata from grouped reports
    primary_category VARCHAR(50) NOT NULL, -- Most common category in the group
    primary_location JSONB NOT NULL, -- Central location of grouped reports
    primary_city VARCHAR(100),
    
    -- Group status management
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'merged', 'archived')),
    
    -- Aggregated group information
    total_reports INTEGER DEFAULT 0,
    priority_level VARCHAR(10) DEFAULT 'Medium' CHECK (priority_level IN ('Low', 'Medium', 'High', 'Urgent')),
    aggregated_status VARCHAR(20) DEFAULT 'Submitted' CHECK (aggregated_status IN ('Submitted', 'In Review', 'Forwarded', 'Resolved')),
    
    -- Detection metadata
    detection_method VARCHAR(50), -- 'spatial', 'textual', 'category', 'combined'
    spatial_radius_meters INTEGER DEFAULT 100,
    similarity_threshold DECIMAL(3,2) DEFAULT 0.80,
    
    -- Additional metadata
    description TEXT, -- Auto-generated description based on grouped reports
    tags JSONB DEFAULT '[]'::jsonb,
    
    CONSTRAINT valid_similarity_threshold CHECK (similarity_threshold >= 0 AND similarity_threshold <= 1)
);

-- Table to manage report-group relationships
CREATE TABLE IF NOT EXISTS report_group_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES report_groups(id) ON DELETE CASCADE,
    report_id VARCHAR(50) NOT NULL, -- References reports.report_id
    
    -- Membership metadata
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    membership_type VARCHAR(20) DEFAULT 'automatic' CHECK (membership_type IN ('automatic', 'manual', 'suggested')),
    confidence_score DECIMAL(3,2) DEFAULT 0.00, -- How confident we are about this grouping (0-1)
    
    -- Detection details for this specific report
    spatial_match BOOLEAN DEFAULT FALSE,
    textual_match BOOLEAN DEFAULT FALSE,
    category_match BOOLEAN DEFAULT FALSE,
    textual_similarity_score DECIMAL(3,2) DEFAULT 0.00,
    spatial_distance_meters INTEGER,
    
    -- Status tracking
    is_primary BOOLEAN DEFAULT FALSE, -- Is this the primary/representative report for the group?
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'removed', 'disputed')),
    
    CONSTRAINT unique_report_group UNIQUE (group_id, report_id),
    CONSTRAINT valid_confidence_score CHECK (confidence_score >= 0 AND confidence_score <= 1),
    CONSTRAINT valid_textual_similarity CHECK (textual_similarity_score >= 0 AND textual_similarity_score <= 1)
);

-- Table to track detection history and analytics
CREATE TABLE IF NOT EXISTS report_grouping_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'detected', 'grouped', 'ungrouped', 'merged'
    group_id UUID REFERENCES report_groups(id) ON DELETE SET NULL,
    previous_group_id UUID REFERENCES report_groups(id) ON DELETE SET NULL,
    
    -- Detection details
    detection_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    detection_method VARCHAR(50),
    confidence_score DECIMAL(3,2),
    
    -- Context information
    triggered_by VARCHAR(50), -- 'report_creation', 'report_update', 'manual_review', 'batch_process'
    processing_time_ms INTEGER,
    
    -- Results
    candidates_found INTEGER DEFAULT 0,
    groups_created INTEGER DEFAULT 0,
    groups_updated INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance optimization

-- Primary indexes for report_groups
CREATE INDEX IF NOT EXISTS idx_report_groups_group_id ON report_groups(group_id);
CREATE INDEX IF NOT EXISTS idx_report_groups_status ON report_groups(status);
CREATE INDEX IF NOT EXISTS idx_report_groups_category ON report_groups(primary_category);
CREATE INDEX IF NOT EXISTS idx_report_groups_city ON report_groups(primary_city);
CREATE INDEX IF NOT EXISTS idx_report_groups_created_at ON report_groups(created_at);

-- Spatial index for location-based queries (requires PostGIS for full functionality)
-- For JSON location data, we'll use GIN index
CREATE INDEX IF NOT EXISTS idx_report_groups_location ON report_groups USING GIN (primary_location);

-- Primary indexes for report_group_memberships
CREATE INDEX IF NOT EXISTS idx_memberships_group_id ON report_group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_memberships_report_id ON report_group_memberships(report_id);
CREATE INDEX IF NOT EXISTS idx_memberships_type ON report_group_memberships(membership_type);
CREATE INDEX IF NOT EXISTS idx_memberships_confidence ON report_group_memberships(confidence_score);
CREATE INDEX IF NOT EXISTS idx_memberships_primary ON report_group_memberships(is_primary) WHERE is_primary = TRUE;

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_memberships_group_status ON report_group_memberships(group_id, status);
CREATE INDEX IF NOT EXISTS idx_memberships_report_active ON report_group_memberships(report_id, status) WHERE status = 'active';

-- Indexes for history tracking
CREATE INDEX IF NOT EXISTS idx_grouping_history_report_id ON report_grouping_history(report_id);
CREATE INDEX IF NOT EXISTS idx_grouping_history_group_id ON report_grouping_history(group_id);
CREATE INDEX IF NOT EXISTS idx_grouping_history_action ON report_grouping_history(action);
CREATE INDEX IF NOT EXISTS idx_grouping_history_timestamp ON report_grouping_history(detection_timestamp);
CREATE INDEX IF NOT EXISTS idx_grouping_history_triggered_by ON report_grouping_history(triggered_by);

-- Triggers to maintain data consistency

-- Function to update report_groups.updated_at on membership changes
CREATE OR REPLACE FUNCTION update_report_group_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE report_groups 
    SET updated_at = NOW() 
    WHERE id = COALESCE(NEW.group_id, OLD.group_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update timestamps
CREATE TRIGGER trigger_update_group_timestamp
    AFTER INSERT OR UPDATE OR DELETE ON report_group_memberships
    FOR EACH ROW
    EXECUTE FUNCTION update_report_group_timestamp();

-- Function to update total_reports count
CREATE OR REPLACE FUNCTION update_group_report_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE report_groups 
        SET total_reports = (
            SELECT COUNT(*) 
            FROM report_group_memberships 
            WHERE group_id = NEW.group_id AND status = 'active'
        )
        WHERE id = NEW.group_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE report_groups 
        SET total_reports = (
            SELECT COUNT(*) 
            FROM report_group_memberships 
            WHERE group_id = OLD.group_id AND status = 'active'
        )
        WHERE id = OLD.group_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE report_groups 
        SET total_reports = (
            SELECT COUNT(*) 
            FROM report_group_memberships 
            WHERE group_id = NEW.group_id AND status = 'active'
        )
        WHERE id = NEW.group_id;
        
        IF OLD.group_id != NEW.group_id THEN
            UPDATE report_groups 
            SET total_reports = (
                SELECT COUNT(*) 
                FROM report_group_memberships 
                WHERE group_id = OLD.group_id AND status = 'active'
            )
            WHERE id = OLD.group_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain report count
CREATE TRIGGER trigger_update_report_count
    AFTER INSERT OR UPDATE OR DELETE ON report_group_memberships
    FOR EACH ROW
    EXECUTE FUNCTION update_group_report_count();

-- Function to generate group IDs
CREATE OR REPLACE FUNCTION generate_group_id()
RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    year_suffix TEXT;
    counter INTEGER;
BEGIN
    year_suffix := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Get the next counter for this year
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(group_id FROM 'GRP-' || year_suffix || '-(\d+)') AS INTEGER)
    ), 0) + 1
    INTO counter
    FROM report_groups
    WHERE group_id ~ ('^GRP-' || year_suffix || '-\d+$');
    
    new_id := 'GRP-' || year_suffix || '-' || LPAD(counter::TEXT, 3, '0');
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Views for common queries

-- View to get active report groups with summary information
CREATE OR REPLACE VIEW active_report_groups AS
SELECT 
    rg.*,
    COUNT(rgm.id) as active_memberships,
    MIN(rgm.joined_at) as first_report_date,
    MAX(rgm.joined_at) as latest_report_date,
    AVG(rgm.confidence_score) as avg_confidence_score
FROM report_groups rg
LEFT JOIN report_group_memberships rgm ON rg.id = rgm.group_id AND rgm.status = 'active'
WHERE rg.status = 'active'
GROUP BY rg.id;

-- View to get detailed group memberships with report information
CREATE OR REPLACE VIEW detailed_group_memberships AS
SELECT 
    rgm.*,
    rg.group_id,
    rg.primary_category,
    rg.primary_city,
    rg.status as group_status,
    rg.aggregated_status,
    rg.priority_level as group_priority
FROM report_group_memberships rgm
JOIN report_groups rg ON rgm.group_id = rg.id
WHERE rgm.status = 'active' AND rg.status = 'active';

-- Comments for documentation
COMMENT ON TABLE report_groups IS 'Stores groups of related/duplicate reports for better case management';
COMMENT ON TABLE report_group_memberships IS 'Maps individual reports to their respective groups';
COMMENT ON TABLE report_grouping_history IS 'Tracks all grouping operations for audit and analytics';

COMMENT ON COLUMN report_groups.detection_method IS 'Method used to detect similarity: spatial, textual, category, or combined';
COMMENT ON COLUMN report_groups.spatial_radius_meters IS 'Radius in meters used for spatial grouping detection';
COMMENT ON COLUMN report_groups.similarity_threshold IS 'Minimum similarity score required for textual grouping';

COMMENT ON COLUMN report_group_memberships.confidence_score IS 'AI confidence score (0-1) for this grouping decision';
COMMENT ON COLUMN report_group_memberships.is_primary IS 'Indicates if this is the representative report for the group';
COMMENT ON COLUMN report_group_memberships.spatial_distance_meters IS 'Distance in meters from this report to group centroid';