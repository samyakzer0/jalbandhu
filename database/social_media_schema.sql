-- Social Media Posts table for storing real-time social media data
CREATE TABLE IF NOT EXISTS social_media_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    original_id TEXT NOT NULL UNIQUE,
    platform TEXT NOT NULL CHECK (platform IN ('twitter', 'facebook', 'youtube')),
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    author_handle TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    location JSONB,
    engagement JSONB NOT NULL DEFAULT '{}',
    hazard_type TEXT NOT NULL,
    urgency_level TEXT NOT NULL CHECK (urgency_level IN ('low', 'medium', 'high', 'urgent')),
    sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    verified BOOLEAN DEFAULT false,
    nlp_analysis JSONB NOT NULL DEFAULT '{}',
    media_urls TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Media Keywords table for trending analysis
CREATE TABLE IF NOT EXISTS social_media_keywords (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    keyword TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 1,
    sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    platforms TEXT[] NOT NULL DEFAULT '{}',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(keyword, date)
);

-- Social Media Analytics table for storing daily aggregated data
CREATE TABLE IF NOT EXISTS social_media_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_posts INTEGER NOT NULL DEFAULT 0,
    high_priority_posts INTEGER NOT NULL DEFAULT 0,
    verified_posts INTEGER NOT NULL DEFAULT 0,
    platform_distribution JSONB NOT NULL DEFAULT '{}',
    sentiment_distribution JSONB NOT NULL DEFAULT '{}',
    hazard_types JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_social_media_posts_platform ON social_media_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_timestamp ON social_media_posts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_urgency ON social_media_posts(urgency_level);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_hazard_type ON social_media_posts(hazard_type);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_sentiment ON social_media_posts(sentiment);
CREATE INDEX IF NOT EXISTS idx_social_media_keywords_keyword ON social_media_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_social_media_keywords_date ON social_media_keywords(date DESC);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_social_media_posts_updated_at
    BEFORE UPDATE ON social_media_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update keyword counts
CREATE OR REPLACE FUNCTION update_keyword_count(keyword_text TEXT, sentiment_value TEXT, platforms_array TEXT[])
RETURNS VOID AS $$
BEGIN
    INSERT INTO social_media_keywords (keyword, count, sentiment, platforms)
    VALUES (keyword_text, 1, sentiment_value, platforms_array)
    ON CONFLICT (keyword, date)
    DO UPDATE SET 
        count = social_media_keywords.count + 1,
        platforms = array(SELECT DISTINCT unnest(social_media_keywords.platforms || platforms_array));
END;
$$ LANGUAGE plpgsql;

-- Function to update daily analytics
CREATE OR REPLACE FUNCTION update_daily_analytics()
RETURNS VOID AS $$
DECLARE
    today_date DATE := CURRENT_DATE;
BEGIN
    INSERT INTO social_media_analytics (
        date,
        total_posts,
        high_priority_posts,
        verified_posts,
        platform_distribution,
        sentiment_distribution,
        hazard_types
    )
    SELECT 
        today_date,
        COUNT(*),
        COUNT(*) FILTER (WHERE urgency_level IN ('high', 'urgent')),
        COUNT(*) FILTER (WHERE verified = true),
        jsonb_build_object(
            'twitter', COUNT(*) FILTER (WHERE platform = 'twitter'),
            'facebook', COUNT(*) FILTER (WHERE platform = 'facebook'),
            'youtube', COUNT(*) FILTER (WHERE platform = 'youtube')
        ),
        jsonb_build_object(
            'positive', COUNT(*) FILTER (WHERE sentiment = 'positive'),
            'negative', COUNT(*) FILTER (WHERE sentiment = 'negative'),
            'neutral', COUNT(*) FILTER (WHERE sentiment = 'neutral')
        ),
        jsonb_object_agg(hazard_type, hazard_count)
    FROM (
        SELECT 
            platform,
            urgency_level,
            verified,
            sentiment,
            hazard_type,
            COUNT(*) as hazard_count
        FROM social_media_posts 
        WHERE DATE(created_at) = today_date
        GROUP BY platform, urgency_level, verified, sentiment, hazard_type
    ) subq
    ON CONFLICT (date)
    DO UPDATE SET 
        total_posts = EXCLUDED.total_posts,
        high_priority_posts = EXCLUDED.high_priority_posts,
        verified_posts = EXCLUDED.verified_posts,
        platform_distribution = EXCLUDED.platform_distribution,
        sentiment_distribution = EXCLUDED.sentiment_distribution,
        hazard_types = EXCLUDED.hazard_types;
END;
$$ LANGUAGE plpgsql;