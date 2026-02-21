-- Create social_media_posts table for storing social media monitoring data
-- Run this script in your Supabase SQL Editor to set up the social media monitoring table

-- Create the social_media_posts table
CREATE TABLE IF NOT EXISTS social_media_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    original_id TEXT NOT NULL UNIQUE, -- Platform-specific post ID
    platform TEXT NOT NULL CHECK (platform IN ('twitter', 'facebook', 'youtube')),
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    author_handle TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    location JSONB, -- {lat: number, lng: number, address: string}
    engagement JSONB NOT NULL DEFAULT '{"likes": 0, "shares": 0, "comments": 0}', -- {likes, shares, comments}
    hazard_type TEXT NOT NULL CHECK (hazard_type IN (
        'tsunami', 'cyclone', 'storm-surge', 'high-waves', 
        'coastal-erosion', 'marine-flooding', 'rip-current'
    )),
    urgency_level TEXT NOT NULL CHECK (urgency_level IN ('low', 'medium', 'high', 'urgent')),
    sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    verified BOOLEAN DEFAULT FALSE,
    nlp_analysis JSONB, -- {keywords: string[], confidence: number, entities: string[]}
    media_urls TEXT[], -- Array of media URLs
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_social_media_posts_platform ON social_media_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_hazard_type ON social_media_posts(hazard_type);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_urgency_level ON social_media_posts(urgency_level);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_sentiment ON social_media_posts(sentiment);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_timestamp ON social_media_posts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_verified ON social_media_posts(verified);

-- Create a GIN index for JSONB fields for better search performance
CREATE INDEX IF NOT EXISTS idx_social_media_posts_location_gin ON social_media_posts USING gin(location);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_engagement_gin ON social_media_posts USING gin(engagement);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_nlp_gin ON social_media_posts USING gin(nlp_analysis);

-- Create a text search index for content
CREATE INDEX IF NOT EXISTS idx_social_media_posts_content_search ON social_media_posts USING gin(to_tsvector('english', content));

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_social_media_posts_updated_at ON social_media_posts;
CREATE TRIGGER update_social_media_posts_updated_at
    BEFORE UPDATE ON social_media_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies for security
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read all posts
CREATE POLICY "Allow authenticated users to read social media posts" ON social_media_posts
FOR SELECT TO authenticated
USING (true);

-- Policy to allow anonymous users to read all posts (for public dashboard)
CREATE POLICY "Allow anonymous users to read social media posts" ON social_media_posts
FOR SELECT TO anon
USING (true);

-- Policy to allow service role to insert/update/delete (for data ingestion)
CREATE POLICY "Allow service role full access to social media posts" ON social_media_posts
FOR ALL TO service_role
USING (true);

-- Function to get posts by platform
CREATE OR REPLACE FUNCTION get_posts_by_platform(platform_name TEXT)
RETURNS TABLE (
    id UUID,
    original_id TEXT,
    platform TEXT,
    content TEXT,
    author TEXT,
    author_handle TEXT,
    timestamp TIMESTAMPTZ,
    location JSONB,
    engagement JSONB,
    hazard_type TEXT,
    urgency_level TEXT,
    sentiment TEXT,
    verified BOOLEAN,
    nlp_analysis JSONB,
    media_urls TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.original_id, p.platform, p.content, p.author, p.author_handle,
           p.timestamp, p.location, p.engagement, p.hazard_type, p.urgency_level,
           p.sentiment, p.verified, p.nlp_analysis, p.media_urls
    FROM social_media_posts p
    WHERE p.platform = platform_name
    ORDER BY p.timestamp DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get posts by hazard type
CREATE OR REPLACE FUNCTION get_posts_by_hazard(hazard_name TEXT)
RETURNS TABLE (
    id UUID,
    original_id TEXT,
    platform TEXT,
    content TEXT,
    author TEXT,
    author_handle TEXT,
    timestamp TIMESTAMPTZ,
    location JSONB,
    engagement JSONB,
    hazard_type TEXT,
    urgency_level TEXT,
    sentiment TEXT,
    verified BOOLEAN,
    nlp_analysis JSONB,
    media_urls TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.original_id, p.platform, p.content, p.author, p.author_handle,
           p.timestamp, p.location, p.engagement, p.hazard_type, p.urgency_level,
           p.sentiment, p.verified, p.nlp_analysis, p.media_urls
    FROM social_media_posts p
    WHERE p.hazard_type = hazard_name
    ORDER BY p.timestamp DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trending hashtags/keywords
CREATE OR REPLACE FUNCTION get_trending_keywords(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    keyword TEXT,
    count INTEGER,
    sentiment_distribution JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH keyword_analysis AS (
        SELECT 
            unnest(nlp_analysis->'keywords') as keyword_text,
            sentiment
        FROM social_media_posts
        WHERE nlp_analysis ? 'keywords'
            AND timestamp > NOW() - INTERVAL '7 days'
    ),
    keyword_counts AS (
        SELECT 
            keyword_text::TEXT as kw,
            COUNT(*) as cnt,
            COUNT(CASE WHEN sentiment = 'positive' THEN 1 END) as positive,
            COUNT(CASE WHEN sentiment = 'negative' THEN 1 END) as negative,
            COUNT(CASE WHEN sentiment = 'neutral' THEN 1 END) as neutral
        FROM keyword_analysis
        GROUP BY keyword_text::TEXT
    )
    SELECT 
        kc.kw as keyword,
        kc.cnt::INTEGER as count,
        jsonb_build_object(
            'positive', kc.positive,
            'negative', kc.negative,
            'neutral', kc.neutral
        ) as sentiment_distribution
    FROM keyword_counts kc
    ORDER BY kc.cnt DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get platform statistics
CREATE OR REPLACE FUNCTION get_platform_statistics()
RETURNS TABLE (
    platform TEXT,
    total_posts INTEGER,
    avg_engagement NUMERIC,
    sentiment_breakdown JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.platform,
        COUNT(*)::INTEGER as total_posts,
        ROUND(AVG((p.engagement->>'likes')::NUMERIC + 
                  (p.engagement->>'shares')::NUMERIC + 
                  (p.engagement->>'comments')::NUMERIC), 2) as avg_engagement,
        jsonb_build_object(
            'positive', COUNT(CASE WHEN p.sentiment = 'positive' THEN 1 END),
            'negative', COUNT(CASE WHEN p.sentiment = 'negative' THEN 1 END),
            'neutral', COUNT(CASE WHEN p.sentiment = 'neutral' THEN 1 END)
        ) as sentiment_breakdown
    FROM social_media_posts p
    WHERE p.timestamp > NOW() - INTERVAL '30 days'
    GROUP BY p.platform
    ORDER BY total_posts DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_posts_by_platform(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_posts_by_hazard(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_trending_keywords(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_platform_statistics() TO anon, authenticated;

-- Log the setup completion
DO $$
BEGIN
    RAISE NOTICE 'Social media posts table setup completed for JalBandhu';
    RAISE NOTICE 'Table: social_media_posts';
    RAISE NOTICE 'Indexes: Created for optimal query performance';
    RAISE NOTICE 'RLS: Enabled with appropriate policies';
    RAISE NOTICE 'Functions: Created for common queries and analytics';
END $$;