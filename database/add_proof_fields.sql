-- SQL script to add proof-of-report fields to the reports table
-- This script adds IPFS CID and proof metadata fields while preserving existing data

-- Add new columns for proof-of-report functionality
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS proof_cid TEXT,
ADD COLUMN IF NOT EXISTS proof_timestamp TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS proof_created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS proof_verification_status TEXT DEFAULT 'pending' CHECK (proof_verification_status IN ('pending', 'verified', 'failed'));

-- Add index on proof_cid for faster lookups
CREATE INDEX IF NOT EXISTS idx_reports_proof_cid ON reports(proof_cid);

-- Add index on proof_verification_status for admin queries
CREATE INDEX IF NOT EXISTS idx_reports_proof_status ON reports(proof_verification_status);

-- Create a view for proof statistics (for admin dashboard)
CREATE OR REPLACE VIEW proof_statistics AS
SELECT 
    COUNT(*) as total_reports,
    COUNT(proof_cid) as reports_with_proof,
    COUNT(CASE WHEN proof_verification_status = 'verified' THEN 1 END) as verified_proofs,
    COUNT(CASE WHEN proof_verification_status = 'pending' THEN 1 END) as pending_proofs,
    COUNT(CASE WHEN proof_verification_status = 'failed' THEN 1 END) as failed_proofs,
    ROUND(
        (COUNT(proof_cid) * 100.0 / NULLIF(COUNT(*), 0)), 2
    ) as proof_coverage_percentage,
    ROUND(
        (COUNT(CASE WHEN proof_verification_status = 'verified' THEN 1 END) * 100.0 / NULLIF(COUNT(proof_cid), 0)), 2
    ) as verification_success_rate
FROM reports;

-- Create a function to update proof verification status
CREATE OR REPLACE FUNCTION update_proof_verification_status(
    report_uuid UUID,
    new_status TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    -- Validate status
    IF new_status NOT IN ('pending', 'verified', 'failed') THEN
        RAISE EXCEPTION 'Invalid verification status: %', new_status;
    END IF;
    
    -- Update the status
    UPDATE reports 
    SET proof_verification_status = new_status,
        updated_at = NOW()
    WHERE report_id = report_uuid;
    
    -- Return success if row was updated
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get reports with proof information
CREATE OR REPLACE FUNCTION get_reports_with_proof_info(
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0
) RETURNS TABLE (
    report_id UUID,
    title TEXT,
    city TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    proof_cid TEXT,
    proof_timestamp TIMESTAMPTZ,
    proof_verification_status TEXT,
    has_proof BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.report_id,
        r.title,
        r.city,
        r.status,
        r.created_at,
        r.proof_cid,
        r.proof_timestamp,
        r.proof_verification_status,
        (r.proof_cid IS NOT NULL) as has_proof
    FROM reports r
    ORDER BY r.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically set proof_created_at when proof_cid is added
CREATE OR REPLACE FUNCTION update_proof_created_at()
RETURNS TRIGGER AS $$
BEGIN
    -- If proof_cid is being set for the first time, update proof_created_at
    IF OLD.proof_cid IS NULL AND NEW.proof_cid IS NOT NULL THEN
        NEW.proof_created_at := NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_update_proof_created_at ON reports;
CREATE TRIGGER trigger_update_proof_created_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_proof_created_at();

-- Add comments to document the new fields
COMMENT ON COLUMN reports.proof_cid IS 'IPFS Content Identifier (CID) for the tamper-proof report proof stored on IPFS';
COMMENT ON COLUMN reports.proof_timestamp IS 'Timestamp from the proof-of-report JSON object stored on IPFS';
COMMENT ON COLUMN reports.proof_created_at IS 'Timestamp when the proof was created and stored on IPFS';
COMMENT ON COLUMN reports.proof_verification_status IS 'Status of proof verification: pending, verified, or failed';

-- Grant necessary permissions (adjust according to your RLS policies)
-- GRANT SELECT, UPDATE ON reports TO authenticated;
-- GRANT SELECT ON proof_statistics TO authenticated;

-- Example query to check the new schema
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'reports' 
-- AND column_name LIKE 'proof_%'
-- ORDER BY ordinal_position;