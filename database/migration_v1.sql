-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('content_creator', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_plan AS ENUM ('basic', 'pro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE link_status AS ENUM ('active', 'scheduled', 'expired', 'disabled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create tables
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY,
    email text NOT NULL,
    username text,
    full_name text,
    tagline text,
    bio text,
    location text,
    pronouns text,
    avatar_url text,
    cover_url text,
    role user_role DEFAULT 'content_creator'::user_role,
    plan user_plan DEFAULT 'basic'::user_plan,
    invitation_code text,
    niche text,
    is_verified boolean DEFAULT false,
    is_active boolean DEFAULT true,
    profile_views integer DEFAULT 0,
    total_clicks integer DEFAULT 0,
    last_active_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    birth_year integer,
    show_age boolean DEFAULT true,
    CONSTRAINT username_length CHECK (char_length(username) >= 3),
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TABLE IF NOT EXISTS social_links (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    platform text NOT NULL,
    username text,
    url text NOT NULL,
    follower_count integer DEFAULT 0,
    followers_count integer DEFAULT 0,
    following_count integer DEFAULT 0,
    media_count integer DEFAULT 0,
    engagement_rate numeric DEFAULT 0,
    is_featured boolean DEFAULT false,
    is_verified boolean DEFAULT false,
    status link_status DEFAULT 'active'::link_status,
    click_count integer DEFAULT 0,
    display_order integer DEFAULT 0,
    platform_icon text,
    custom_platform_name text,
    auto_followers boolean DEFAULT false,
    scrape_enabled boolean DEFAULT true,
    last_scraped_at timestamptz,
    api_data jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS custom_links (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    url text NOT NULL,
    icon_url text,
    is_featured boolean DEFAULT false,
    status link_status DEFAULT 'active'::link_status,
    click_count integer DEFAULT 0,
    display_order integer DEFAULT 0,
    scheduled_at timestamptz,
    expires_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS showcase_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    video_url text NOT NULL,
    thumbnail_url text,
    platform text NOT NULL,
    view_count integer DEFAULT 0,
    like_count integer DEFAULT 0,
    click_count integer DEFAULT 0,
    is_featured boolean DEFAULT false,
    display_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    event_type text NOT NULL,
    metadata jsonb DEFAULT '{}',
    ip_address inet,
    user_agent text,
    referrer text,
    country text,
    city text,
    device_type text,
    browser text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invite_codes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    code text NOT NULL UNIQUE,
    plan_type text NOT NULL,
    max_uses integer DEFAULT 1,
    current_uses integer DEFAULT 0,
    is_active boolean DEFAULT true,
    expires_at timestamptz,
    used_by uuid REFERENCES profiles(id),
    used_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

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
    live_28_avg_sold_count_show text,
    live_28_avg_sale_amount_show text,
    auto_update_enabled boolean DEFAULT true,
    last_updated timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_followers_history (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    social_link_id uuid NOT NULL REFERENCES social_links(id) ON DELETE CASCADE,
    follower_count integer NOT NULL,
    scraped_at timestamptz DEFAULT now(),
    source text DEFAULT 'manual'
);

CREATE TABLE IF NOT EXISTS user_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan user_plan NOT NULL,
    started_at timestamptz DEFAULT now(),
    expires_at timestamptz,
    is_active boolean DEFAULT true,
    invitation_code_used text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rate_limits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier text NOT NULL,
    request_count integer DEFAULT 1,
    window_start timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);
CREATE INDEX IF NOT EXISTS idx_social_links_user_id ON social_links(user_id);
CREATE INDEX IF NOT EXISTS idx_social_links_platform ON social_links(platform);
CREATE INDEX IF NOT EXISTS idx_custom_links_user_id ON custom_links(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_links_status ON custom_links(status);
CREATE INDEX IF NOT EXISTS idx_showcase_user_id ON showcase_items(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_active ON invite_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_instagram_analytics_user_id ON instagram_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_tiktok_analytics_user_id ON tiktok_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON social_links
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON custom_links
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON showcase_items
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON invite_codes
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON instagram_analytics
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON tiktok_analytics
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiktok_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_followers_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can manage own profile" ON profiles
    FOR ALL
    TO public
    USING (auth.uid() = id AND role = 'content_creator'::user_role);

CREATE POLICY "allow_all_select" ON profiles
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Users can manage own social links" ON social_links
    FOR ALL
    TO public
    USING (auth.uid() = user_id);

CREATE POLICY "Social links are viewable by everyone" ON social_links
    FOR SELECT
    TO public
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = social_links.user_id
        AND profiles.is_active = true
    ));

CREATE POLICY "Users can manage own custom links" ON custom_links
    FOR ALL
    TO public
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = custom_links.user_id
        AND profiles.id = auth.uid()
    ));

CREATE POLICY "Custom links are viewable by everyone" ON custom_links
    FOR SELECT
    TO public
    USING (
        status = 'active'::link_status
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = custom_links.user_id
            AND profiles.is_active = true
        )
    );

CREATE POLICY "Users can manage own showcase items" ON showcase_items
    FOR ALL
    TO public
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = showcase_items.user_id
        AND profiles.id = auth.uid()
    ));

CREATE POLICY "Showcase items are viewable by everyone" ON showcase_items
    FOR SELECT
    TO public
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = showcase_items.user_id
        AND profiles.is_active = true
    ));

CREATE POLICY "Users can view own analytics" ON analytics
    FOR SELECT
    TO public
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = analytics.user_id
        AND profiles.id = auth.uid()
    ));

CREATE POLICY "Analytics can be inserted by anyone" ON analytics
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Active invitation codes are viewable by everyone" ON invite_codes
    FOR SELECT
    TO public
    USING (
        is_active = true
        AND (expires_at IS NULL OR expires_at > now())
    );

CREATE POLICY "Users can manage own instagram analytics" ON instagram_analytics
    FOR ALL
    TO public
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own tiktok analytics" ON tiktok_analytics
    FOR ALL
    TO public
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
    FOR SELECT
    TO public
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = user_subscriptions.user_id
        AND profiles.id = auth.uid()
    ));

-- Insert initial invite codes
INSERT INTO invite_codes (id, code, plan_type, max_uses, current_uses, is_active, expires_at, created_at, updated_at)
VALUES
    ('75876cb1-818b-4554-a84a-a4cfe6361477', 'WELCOME2024', 'basic', 1000, 0, true, '2026-05-25 02:34:02.894759+00', '2025-05-25 02:34:02.894759+00', '2025-05-25 02:34:02.894759+00'),
    ('079b754f-5ef2-41a4-95a1-9e68a2c6d0d9', 'CREATOR2024', 'pro', 500, 0, true, '2026-05-25 02:34:02.894759+00', '2025-05-25 02:34:02.894759+00', '2025-05-25 02:34:02.894759+00'),
    ('7b5d5fe9-d055-4d07-af72-0831ab22e687', 'BETA2024', 'pro', 100, 0, true, '2025-11-25 02:34:02.894759+00', '2025-05-25 02:34:02.894759+00', '2025-05-25 02:34:02.894759+00'),
    ('48fa0d50-7487-4926-8069-71eaf43a00eb', 'TUMBUHIDE2024', 'pro', 50, 0, true, '2026-05-25 02:34:02.894759+00', '2025-05-25 02:34:02.894759+00', '2025-05-25 02:34:02.894759+00'),
    ('c2a15442-61cb-4853-84ac-b0ec14f71981', 'INFLUENCER2024', 'pro', 200, 0, true, '2026-05-25 02:34:02.894759+00', '2025-05-25 02:34:02.894759+00', '2025-05-25 02:34:02.894759+00')
ON CONFLICT (id) DO NOTHING; 