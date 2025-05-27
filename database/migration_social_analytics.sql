-- Create tables for social analytics if they don't exist
CREATE TABLE IF NOT EXISTS instagram_analytics (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    social_link_id uuid REFERENCES social_links(id) ON DELETE CASCADE,
    instagram_id text NOT NULL,
    username text NOT NULL,
    full_name text,
    profile_pic_url text,
    biography text,
    external_url text,
    follower_count integer DEFAULT 0,
    following_count integer DEFAULT 0,
    media_count integer DEFAULT 0,
    engagement_rate numeric DEFAULT 0,
    is_private boolean DEFAULT false,
    is_verified boolean DEFAULT false,
    is_business_account boolean DEFAULT false,
    country text,
    city text,
    languages jsonb,
    topics jsonb,
    recent_posts jsonb,
    cached_timestamp bigint,
    last_post_at bigint,
    auto_update_enabled boolean DEFAULT true,
    last_updated timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tiktok_analytics (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    social_link_id uuid REFERENCES social_links(id) ON DELETE CASCADE,
    tiktok_uid text NOT NULL,
    sec_uid text,
    unique_id text NOT NULL,
    nickname text,
    avatar text,
    signature text,
    follower_count integer DEFAULT 0,
    region text,
    region_name text,
    category_id integer,
    category_name text,
    verify_type text,
    account_type text,
    show_shop_tab integer DEFAULT 0,
    is_shop_author integer DEFAULT 0,
    seller_id text,
    market_category_l1_name jsonb,
    live_type integer,
    intelligent_type integer,
    mcn jsonb,
    first_video_time text,
    region_rank integer,
    last_region_rank integer,
    region_rank_rate text,
    category_rank integer,
    last_category_rank integer,
    category_rank_rate text,
    flow_index integer,
    carry_index integer,
    follower_28_count integer,
    follower_28_last_count integer,
    follower_28_count_rate text,
    aweme_28_count integer,
    live_28_count integer,
    last_video_time text,
    video_28_avg_play_count integer,
    video_28_avg_interaction_count integer,
    goods_28_avg_sole_count integer,
    goods_28_avg_sale_amount integer,
    live_28_avg_sold_count integer,
    live_28_avg_sale_amount integer,
    region_rank_show text,
    last_region_rank_show text,
    category_rank_show text,
    last_category_rank_show text,
    follower_count_show text,
    follower_28_count_show text,
    follower_28_last_count_show text,
    aweme_28_count_show text,
    live_28_count_show text,
    video_28_avg_play_count_show text,
    video_28_avg_interaction_count_show text,
    goods_28_avg_sole_count_show text,
    goods_28_avg_sale_amount_show text,
    live_28_avg_sale_amount_show text,
    auto_update_enabled boolean DEFAULT true,
    last_updated timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes for social analytics tables
CREATE INDEX IF NOT EXISTS idx_instagram_analytics_user_id ON instagram_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_analytics_username ON instagram_analytics(username);
CREATE INDEX IF NOT EXISTS idx_tiktok_analytics_user_id ON tiktok_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_tiktok_analytics_unique_id ON tiktok_analytics(unique_id);

-- Create updated_at triggers only if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'handle_updated_at_instagram_analytics'
    ) THEN
        CREATE TRIGGER handle_updated_at_instagram_analytics
            BEFORE UPDATE ON instagram_analytics
            FOR EACH ROW
            EXECUTE FUNCTION handle_updated_at();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'handle_updated_at_tiktok_analytics'
    ) THEN
        CREATE TRIGGER handle_updated_at_tiktok_analytics
            BEFORE UPDATE ON tiktok_analytics
            FOR EACH ROW
            EXECUTE FUNCTION handle_updated_at();
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE instagram_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiktok_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
    -- Drop Instagram Analytics policies if they exist
    IF EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polrelid = 'instagram_analytics'::regclass 
        AND polname = 'Users can manage own instagram analytics'
    ) THEN
        DROP POLICY "Users can manage own instagram analytics" ON instagram_analytics;
    END IF;

    -- Drop TikTok Analytics policies if they exist
    IF EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polrelid = 'tiktok_analytics'::regclass 
        AND polname = 'Users can manage own tiktok analytics'
    ) THEN
        DROP POLICY "Users can manage own tiktok analytics" ON tiktok_analytics;
    END IF;
END $$;

-- Create RLS Policies
CREATE POLICY "Users can manage own instagram analytics" ON instagram_analytics
    FOR ALL
    TO public
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own tiktok analytics" ON tiktok_analytics
    FOR ALL
    TO public
    USING (auth.uid() = user_id); 