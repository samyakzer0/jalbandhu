-- =====================================================
-- JalBandhu Data Mining Schema
-- Patent-Worthy AI Analytics Tables
-- =====================================================

-- Table 1: DBSCAN Spatial Hotspots
CREATE TABLE IF NOT EXISTS data_mining_hotspots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id INTEGER NOT NULL,
  center_lat DOUBLE PRECISION NOT NULL,
  center_lng DOUBLE PRECISION NOT NULL,
  report_count INTEGER NOT NULL,
  risk_score DOUBLE PRECISION NOT NULL,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  avg_severity DOUBLE PRECISION,
  spatial_density DOUBLE PRECISION,
  temporal_intensity DOUBLE PRECISION,
  hazard_types JSONB,
  detection_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for spatial queries
CREATE INDEX IF NOT EXISTS idx_hotspots_center ON data_mining_hotspots (center_lat, center_lng);
CREATE INDEX IF NOT EXISTS idx_hotspots_risk_level ON data_mining_hotspots (risk_level);
CREATE INDEX IF NOT EXISTS idx_hotspots_timestamp ON data_mining_hotspots (detection_timestamp);

-- Table 2: Text Mining Results
CREATE TABLE IF NOT EXISTS text_mining_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id TEXT UNIQUE NOT NULL,
  keywords JSONB NOT NULL,
  topics JSONB,
  crisis_keywords JSONB,
  panic_score DOUBLE PRECISION,
  sentiment_velocity DOUBLE PRECISION,
  exclamation_density DOUBLE PRECISION,
  total_posts_analyzed INTEGER,
  analysis_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for analysis queries
CREATE INDEX IF NOT EXISTS idx_text_mining_timestamp ON text_mining_results (analysis_timestamp);
CREATE INDEX IF NOT EXISTS idx_text_mining_panic_score ON text_mining_results (panic_score DESC);

-- Table 3: Hazard Predictions (LSTM)
CREATE TABLE IF NOT EXISTS hazard_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_horizon_hours INTEGER NOT NULL,
  predicted_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  predicted_report_count INTEGER NOT NULL,
  confidence DOUBLE PRECISION NOT NULL,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  model_version TEXT,
  training_metrics JSONB,
  actual_report_count INTEGER,
  prediction_error DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for prediction queries
CREATE INDEX IF NOT EXISTS idx_predictions_timestamp ON hazard_predictions (predicted_timestamp);
CREATE INDEX IF NOT EXISTS idx_predictions_risk_level ON hazard_predictions (risk_level);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON hazard_predictions (created_at);

-- Table 4: Hotspot Evolution Tracking
CREATE TABLE IF NOT EXISTS hotspot_evolution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id INTEGER NOT NULL,
  previous_center_lat DOUBLE PRECISION,
  previous_center_lng DOUBLE PRECISION,
  current_center_lat DOUBLE PRECISION NOT NULL,
  current_center_lng DOUBLE PRECISION NOT NULL,
  movement_distance_km DOUBLE PRECISION,
  movement_direction TEXT,
  risk_score_change DOUBLE PRECISION,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for evolution tracking
CREATE INDEX IF NOT EXISTS idx_evolution_cluster ON hotspot_evolution (cluster_id);
CREATE INDEX IF NOT EXISTS idx_evolution_timestamp ON hotspot_evolution (timestamp);

-- Table 5: Model Training History
CREATE TABLE IF NOT EXISTS model_training_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_type TEXT NOT NULL CHECK (model_type IN ('spatial', 'text', 'predictive')),
  model_version TEXT NOT NULL,
  training_data_size INTEGER,
  training_metrics JSONB,
  accuracy DOUBLE PRECISION,
  loss DOUBLE PRECISION,
  mae DOUBLE PRECISION,
  rmse DOUBLE PRECISION,
  training_duration_seconds INTEGER,
  trained_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for model history
CREATE INDEX IF NOT EXISTS idx_model_history_type ON model_training_history (model_type);
CREATE INDEX IF NOT EXISTS idx_model_history_trained_at ON model_training_history (trained_at);

-- =====================================================
-- Views for Analytics
-- =====================================================

-- View 1: High Risk Areas Summary
CREATE OR REPLACE VIEW high_risk_areas AS
SELECT 
  cluster_id,
  center_lat,
  center_lng,
  report_count,
  risk_score,
  risk_level,
  detection_timestamp
FROM data_mining_hotspots
WHERE risk_level IN ('high', 'critical')
ORDER BY risk_score DESC;

-- View 2: Prediction Accuracy
CREATE OR REPLACE VIEW prediction_accuracy AS
SELECT 
  DATE(predicted_timestamp) as prediction_date,
  COUNT(*) as total_predictions,
  AVG(confidence) as avg_confidence,
  AVG(CASE WHEN actual_report_count IS NOT NULL THEN prediction_error END) as avg_error,
  COUNT(CASE WHEN actual_report_count IS NOT NULL THEN 1 END) as validated_predictions
FROM hazard_predictions
GROUP BY DATE(predicted_timestamp)
ORDER BY prediction_date DESC;

-- View 3: Recent Crisis Indicators
CREATE OR REPLACE VIEW recent_crisis_indicators AS
SELECT 
  id,
  panic_score,
  sentiment_velocity,
  total_posts_analyzed,
  analysis_timestamp
FROM text_mining_results
WHERE panic_score > 0.7
  AND analysis_timestamp > NOW() - INTERVAL '24 hours'
ORDER BY panic_score DESC;

-- =====================================================
-- Functions for Data Mining
-- =====================================================

-- Function to calculate hotspot evolution
CREATE OR REPLACE FUNCTION calculate_hotspot_evolution()
RETURNS TABLE (
  cluster_id INTEGER,
  movement_km DOUBLE PRECISION,
  risk_change DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  WITH current_hotspots AS (
    SELECT DISTINCT ON (cluster_id)
      cluster_id,
      center_lat,
      center_lng,
      risk_score,
      detection_timestamp
    FROM data_mining_hotspots
    ORDER BY cluster_id, detection_timestamp DESC
  ),
  previous_hotspots AS (
    SELECT DISTINCT ON (h.cluster_id)
      h.cluster_id,
      h.center_lat,
      h.center_lng,
      h.risk_score
    FROM data_mining_hotspots h
    WHERE h.detection_timestamp < (
      SELECT detection_timestamp 
      FROM current_hotspots c 
      WHERE c.cluster_id = h.cluster_id
    )
    ORDER BY h.cluster_id, h.detection_timestamp DESC
  )
  SELECT 
    c.cluster_id,
    SQRT(
      POW(111.32 * (c.center_lat - p.center_lat), 2) +
      POW(111.32 * COS(RADIANS(c.center_lat)) * (c.center_lng - p.center_lng), 2)
    ) as movement_km,
    c.risk_score - p.risk_score as risk_change
  FROM current_hotspots c
  JOIN previous_hotspots p ON c.cluster_id = p.cluster_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE data_mining_hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE text_mining_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE hazard_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotspot_evolution ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_training_history ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for authenticated users)
CREATE POLICY "Allow public read access" ON data_mining_hotspots
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON text_mining_results
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON hazard_predictions
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON hotspot_evolution
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON model_training_history
  FOR SELECT USING (true);

-- Allow insert for service role
CREATE POLICY "Allow service role insert" ON data_mining_hotspots
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role insert" ON text_mining_results
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role insert" ON hazard_predictions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role insert" ON hotspot_evolution
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role insert" ON model_training_history
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- Grant Permissions
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant permissions on tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Grant permissions on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- =====================================================
-- Sample Data for Testing
-- =====================================================

-- Insert sample hotspot
INSERT INTO data_mining_hotspots (
  cluster_id, center_lat, center_lng, report_count, risk_score, 
  risk_level, avg_severity, spatial_density, temporal_intensity,
  hazard_types
) VALUES (
  1, 19.0760, 72.8777, 15, 0.85, 'high', 4.2, 0.75, 0.80,
  '["Cyclone", "High Waves", "Storm Surge"]'::jsonb
);

-- Insert sample text mining result
INSERT INTO text_mining_results (
  analysis_id, keywords, panic_score, sentiment_velocity,
  exclamation_density, total_posts_analyzed
) VALUES (
  'analysis_001',
  '[{"term": "tsunami", "tfidf": 0.85, "frequency": 25}, {"term": "warning", "tfidf": 0.72, "frequency": 18}]'::jsonb,
  0.78, 0.65, 0.12, 100
);

-- Insert sample prediction
INSERT INTO hazard_predictions (
  prediction_horizon_hours, predicted_timestamp, predicted_report_count,
  confidence, risk_level, model_version, training_metrics
) VALUES (
  12, NOW() + INTERVAL '12 hours', 23, 0.82, 'high', 'v1.0.0',
  '{"loss": 0.05, "mae": 0.12, "rmse": 0.15}'::jsonb
);

-- =====================================================
-- Materialized View for Performance
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS daily_risk_summary AS
SELECT 
  DATE(detection_timestamp) as date,
  COUNT(*) as total_hotspots,
  SUM(CASE WHEN risk_level = 'critical' THEN 1 ELSE 0 END) as critical_count,
  SUM(CASE WHEN risk_level = 'high' THEN 1 ELSE 0 END) as high_count,
  AVG(risk_score) as avg_risk_score,
  MAX(risk_score) as max_risk_score
FROM data_mining_hotspots
GROUP BY DATE(detection_timestamp)
ORDER BY date DESC;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_daily_risk_summary_date ON daily_risk_summary (date);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_daily_risk_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_risk_summary;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE data_mining_hotspots IS 'Stores DBSCAN spatial clustering results for hazard hotspot detection';
COMMENT ON TABLE text_mining_results IS 'Stores TF-IDF text mining and NLP analysis results from social media';
COMMENT ON TABLE hazard_predictions IS 'Stores LSTM neural network predictions for future hazard activity';
COMMENT ON TABLE hotspot_evolution IS 'Tracks movement and evolution of hazard hotspots over time';
COMMENT ON TABLE model_training_history IS 'Maintains history of all AI model training sessions';
