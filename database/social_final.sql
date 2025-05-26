-- FINAL SOCIAL DATABASE SETUP - Compatible with V4.sql
-- Run this AFTER running final_v4.sql

-- 1. Create TikTok Analytics Table (COMPLETE)
CREATE TABLE IF NOT EXISTS tiktok_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    social_link_id UUID REFERENCES social_links(id) ON DELETE CASCADE,
    
    -- User Info from Step 1 & 2
    tiktok_uid TEXT NOT NULL,
    sec_uid TEXT,
    unique_id TEXT NOT NULL,
    nickname TEXT,
    avatar TEXT,
    signature TEXT,
    follower_count INTEGER DEFAULT 0,
    region TEXT,
    region_name TEXT,
    category_id INTEGER,
    category_name TEXT,
    verify_type TEXT,
    account_type TEXT,
    show_shop_tab INTEGER DEFAULT 0,
    is_shop_author INTEGER DEFAULT 0,
    seller_id TEXT,
    market_category_l1_name JSONB,
    live_type INTEGER,
    intelligent_type INTEGER,
    mcn JSONB,
    first_video_time TEXT,
    
    -- Analytics data from Step 3
    region_rank INTEGER,
    last_region_rank INTEGER,
    region_rank_rate TEXT,
    category_rank INTEGER,
    last_category_rank INTEGER,
    category_rank_rate TEXT,
    flow_index INTEGER,
    carry_index INTEGER,
    follower_28_count INTEGER,
    follower_28_last_count INTEGER,
    follower_28_count_rate TEXT,
    aweme_28_count INTEGER,
    live_28_count INTEGER,
    last_video_time TEXT,
    video_28_avg_play_count INTEGER,
    video_28_avg_interaction_count INTEGER,
    goods_28_avg_sole_count INTEGER,
    goods_28_avg_sale_amount INTEGER,
    live_28_avg_sold_count INTEGER,
    live_28_avg_sale_amount INTEGER,
    
    -- Display formatted values
    region_rank_show TEXT,
    last_region_rank_show TEXT,
    category_rank_show TEXT,
    last_category_rank_show TEXT,
    follower_count_show TEXT,
    follower_28_count_show TEXT,
    follower_28_last_count_show TEXT,
    follower_28_count_rate_show TEXT,
    aweme_28_count_show TEXT,
    live_28_count_show TEXT,
    video_28_avg_play_count_show TEXT,
    video_28_avg_interaction_count_show TEXT,
    goods_28_avg_sole_count_show TEXT,
    goods_28_avg_sale_amount_show TEXT,
    live_28_avg_sold_count_show TEXT,
    live_28_avg_sale_amount_show TEXT,
    
    -- Metadata
    auto_update_enabled BOOLEAN DEFAULT true,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, unique_id)
);

-- 2. Enable RLS for TikTok Analytics
ALTER TABLE tiktok_analytics ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for TikTok Analytics
DROP POLICY IF EXISTS "Users can manage own tiktok analytics" ON tiktok_analytics;
CREATE POLICY "Users can manage own tiktok analytics" ON tiktok_analytics
    FOR ALL USING (auth.uid() = user_id);

-- 4. Create indexes for TikTok Analytics
CREATE INDEX IF NOT EXISTS idx_tiktok_analytics_user_id ON tiktok_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_tiktok_analytics_unique_id ON tiktok_analytics(unique_id);
CREATE INDEX IF NOT EXISTS idx_tiktok_analytics_last_updated ON tiktok_analytics(last_updated);
CREATE INDEX IF NOT EXISTS idx_tiktok_analytics_tiktok_uid ON tiktok_analytics(tiktok_uid);

-- 5. Create trigger for updated_at on TikTok Analytics
DROP TRIGGER IF EXISTS update_tiktok_analytics_updated_at ON tiktok_analytics;
CREATE TRIGGER update_tiktok_analytics_updated_at 
    BEFORE UPDATE ON tiktok_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Ensure social_links has all required columns for TikTok
DO $$ 
BEGIN
    -- Add missing columns to social_links if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_links' AND column_name = 'followers_count') THEN
        ALTER TABLE social_links ADD COLUMN followers_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_links' AND column_name = 'following_count') THEN
        ALTER TABLE social_links ADD COLUMN following_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_links' AND column_name = 'media_count') THEN
        ALTER TABLE social_links ADD COLUMN media_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_links' AND column_name = 'engagement_rate') THEN
        ALTER TABLE social_links ADD COLUMN engagement_rate DECIMAL(5,4) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_links' AND column_name = 'is_verified') THEN
        ALTER TABLE social_links ADD COLUMN is_verified BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_links' AND column_name = 'last_scraped_at') THEN
        ALTER TABLE social_links ADD COLUMN last_scraped_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_links' AND column_name = 'api_data') THEN
        ALTER TABLE social_links ADD COLUMN api_data JSONB;
    END IF;
END $$;

-- 7. Grant permissions for TikTok Analytics
GRANT ALL ON tiktok_analytics TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 8. Update existing Instagram Analytics table to match new structure
DO $$ 
BEGIN
    -- Add missing columns to instagram_analytics if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'instagram_analytics' AND column_name = 'last_updated') THEN
        ALTER TABLE instagram_analytics ADD COLUMN last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'instagram_analytics' AND column_name = 'auto_update_enabled') THEN
        ALTER TABLE instagram_analytics ADD COLUMN auto_update_enabled BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 9. Create function to clean old analytics data (optional)
CREATE OR REPLACE FUNCTION clean_old_analytics()
RETURNS void AS $$
BEGIN
    -- Delete analytics data older than 6 months
    DELETE FROM tiktok_analytics WHERE last_updated < NOW() - INTERVAL '6 months';
    DELETE FROM instagram_analytics WHERE last_updated < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;

-- 10. Success message
SELECT 
    'TikTok Analytics setup completed successfully! 🎉' as status,
    'Table: tiktok_analytics created with all FastMoss API fields' as table_info,
    'Compatible with existing V4 database structure' as compatibility,
    'RLS enabled, indexes created, triggers set up' as features;

-- 11. Show table structure for verification
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tiktok_analytics' 
ORDER BY ordinal_position;
