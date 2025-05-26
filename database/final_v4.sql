-- Final Database Setup V4 - Comprehensive & Flexible
-- Works with both fresh and existing databases
-- Run this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create profiles table if not exists
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    tagline TEXT,
    bio TEXT,
    location TEXT,
    birth_year INTEGER,
    show_age BOOLEAN DEFAULT true,
    pronouns TEXT,
    niche TEXT DEFAULT 'default',
    plan TEXT DEFAULT 'basic' CHECK (plan IN ('basic', 'pro')),
    is_verified BOOLEAN DEFAULT false,
    profile_views INTEGER DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    invite_code_used TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create social_links table with all required columns
CREATE TABLE IF NOT EXISTS social_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    username TEXT NOT NULL,
    url TEXT NOT NULL,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    media_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,4) DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    scrape_enabled BOOLEAN DEFAULT true,
    last_scraped_at TIMESTAMP WITH TIME ZONE,
    api_data JSONB,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- 3. Create custom_links table
CREATE TABLE IF NOT EXISTS custom_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    clicks INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create showcase_items table
CREATE TABLE IF NOT EXISTS showcase_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    media_type TEXT NOT NULL CHECK (media_type IN ('video', 'image', 'audio')),
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    platform TEXT,
    external_url TEXT,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    metadata JSONB,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create invite_codes table
CREATE TABLE IF NOT EXISTS invite_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'pro')),
    max_uses INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES profiles(id),
    used_by UUID REFERENCES profiles(id),
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create instagram_analytics table for TrendHero data
CREATE TABLE IF NOT EXISTS instagram_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    social_link_id UUID REFERENCES social_links(id) ON DELETE CASCADE,
    instagram_id TEXT NOT NULL,
    username TEXT NOT NULL,
    full_name TEXT,
    profile_pic_url TEXT,
    biography TEXT,
    external_url TEXT,
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    media_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,4) DEFAULT 0,
    is_private BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    is_business_account BOOLEAN DEFAULT false,
    country TEXT,
    city TEXT,
    languages JSONB,
    topics JSONB,
    recent_posts JSONB,
    cached_timestamp BIGINT,
    last_post_at BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, instagram_id)
);

-- 8. Add missing columns to existing tables (safe operations)
DO $$ 
BEGIN
    -- Add columns to profiles if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'niche') THEN
        ALTER TABLE profiles ADD COLUMN niche TEXT DEFAULT 'default';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'show_age') THEN
        ALTER TABLE profiles ADD COLUMN show_age BOOLEAN DEFAULT true;
    END IF;

    -- Add columns to social_links if they don't exist
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
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_links' AND column_name = 'scrape_enabled') THEN
        ALTER TABLE social_links ADD COLUMN scrape_enabled BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_links' AND column_name = 'last_scraped_at') THEN
        ALTER TABLE social_links ADD COLUMN last_scraped_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_links' AND column_name = 'api_data') THEN
        ALTER TABLE social_links ADD COLUMN api_data JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_links' AND column_name = 'is_featured') THEN
        ALTER TABLE social_links ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;

    -- Update existing follower_count to followers_count if exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_links' AND column_name = 'follower_count') THEN
        UPDATE social_links SET followers_count = follower_count WHERE follower_count IS NOT NULL AND followers_count = 0;
    END IF;
END $$;

-- 9. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_analytics ENABLE ROW LEVEL SECURITY;

-- 10. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can manage own social links" ON social_links;
DROP POLICY IF EXISTS "Users can manage own custom links" ON custom_links;
DROP POLICY IF EXISTS "Users can manage own showcase items" ON showcase_items;
DROP POLICY IF EXISTS "Users can manage own analytics" ON analytics;
DROP POLICY IF EXISTS "Users can view active invite codes" ON invite_codes;
DROP POLICY IF EXISTS "Users can manage own instagram analytics" ON instagram_analytics;

-- 11. Create comprehensive RLS policies
-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

-- Social links policies
CREATE POLICY "Users can manage own social links" ON social_links
    FOR ALL USING (auth.uid() = user_id);

-- Custom links policies
CREATE POLICY "Users can manage own custom links" ON custom_links
    FOR ALL USING (auth.uid() = user_id);

-- Showcase items policies
CREATE POLICY "Users can manage own showcase items" ON showcase_items
    FOR ALL USING (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "Users can manage own analytics" ON analytics
    FOR ALL USING (auth.uid() = user_id);

-- Instagram analytics policies
CREATE POLICY "Users can manage own instagram analytics" ON instagram_analytics
    FOR ALL USING (auth.uid() = user_id);

-- Invite codes policies (read-only for users)
CREATE POLICY "Users can view active invite codes" ON invite_codes
    FOR SELECT USING (is_active = true);

-- 12. Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- 13. Storage policies
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload avatar images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar images" ON storage.objects;
DROP POLICY IF EXISTS "Cover images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload cover images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own cover images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own cover images" ON storage.objects;

-- Avatar storage policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatar images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can update own avatar images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete own avatar images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Cover storage policies
CREATE POLICY "Cover images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'covers');

CREATE POLICY "Users can upload cover images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'covers' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can update own cover images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'covers' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete own cover images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'covers' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- 14. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);
CREATE INDEX IF NOT EXISTS idx_social_links_user_id ON social_links(user_id);
CREATE INDEX IF NOT EXISTS idx_social_links_platform ON social_links(platform);
CREATE INDEX IF NOT EXISTS idx_social_links_last_scraped ON social_links(last_scraped_at);
CREATE INDEX IF NOT EXISTS idx_custom_links_user_id ON custom_links(user_id);
CREATE INDEX IF NOT EXISTS idx_showcase_items_user_id ON showcase_items(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_instagram_analytics_user_id ON instagram_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_analytics_username ON instagram_analytics(username);

-- 15. Create functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 16. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_social_links_updated_at ON social_links;
CREATE TRIGGER update_social_links_updated_at 
    BEFORE UPDATE ON social_links 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_custom_links_updated_at ON custom_links;
CREATE TRIGGER update_custom_links_updated_at 
    BEFORE UPDATE ON custom_links 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_showcase_items_updated_at ON showcase_items;
CREATE TRIGGER update_showcase_items_updated_at 
    BEFORE UPDATE ON showcase_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_instagram_analytics_updated_at ON instagram_analytics;
CREATE TRIGGER update_instagram_analytics_updated_at 
    BEFORE UPDATE ON instagram_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 17. Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, username, plan)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', ''),
        COALESCE(new.raw_user_meta_data->>'username', ''),
        'basic'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 18. Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 19. Insert required data
-- Insert invite codes
INSERT INTO invite_codes (code, plan_type, max_uses, expires_at, is_active) 
VALUES 
    ('CREATOR2024', 'pro', 100, NOW() + INTERVAL '1 year', true),
    ('WELCOME50', 'pro', 50, NOW() + INTERVAL '6 months', true),
    ('BETA2024', 'pro', 25, NOW() + INTERVAL '3 months', true),
    ('TUMBUHIDE2024', 'pro', 200, NOW() + INTERVAL '1 year', true),
    ('INFLUENCER2024', 'pro', 75, NOW() + INTERVAL '8 months', true)
ON CONFLICT (code) DO UPDATE SET
    max_uses = EXCLUDED.max_uses,
    expires_at = EXCLUDED.expires_at,
    is_active = EXCLUDED.is_active;

-- 20. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- 21. Update existing profiles with default niche if null
UPDATE profiles SET niche = 'default' WHERE niche IS NULL;

-- Success message
SELECT 'Database V4 setup completed successfully! 🎉' as status,
       'Tables: profiles, social_links, custom_links, showcase_items, analytics, invite_codes, instagram_analytics' as tables_created,
       'Features: RLS enabled, Storage buckets, Triggers, Indexes, Sample data' as features_enabled;
