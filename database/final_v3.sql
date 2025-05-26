-- =====================================================
-- TUMBUHIDE V3 - FINAL PRODUCTION DATABASE SCHEMA
-- =====================================================
-- This script handles both fresh installs and existing databases
-- Run this script in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- STORAGE SETUP
-- =====================================================

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('covers', 'covers', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies for avatars
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload avatar images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar images" ON storage.objects;

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatar images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own avatar images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar images" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for covers
DROP POLICY IF EXISTS "Cover images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload cover images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own cover images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own cover images" ON storage.objects;

CREATE POLICY "Cover images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'covers');

CREATE POLICY "Users can upload cover images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own cover images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own cover images" ON storage.objects
  FOR DELETE USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- TABLES SETUP
-- =====================================================

-- Create invite_codes table
CREATE TABLE IF NOT EXISTS public.invite_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  plan_type text NOT NULL CHECK (plan_type IN ('basic', 'pro')),
  max_uses integer DEFAULT 1,
  current_uses integer DEFAULT 0,
  is_active boolean DEFAULT true,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Drop existing profiles table if exists and recreate with correct structure
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE,
  full_name text,
  email text,
  tagline text,
  bio text,
  birth_year integer,
  show_age boolean DEFAULT false,
  location text,
  pronouns text,
  avatar_url text,
  cover_url text,
  plan text DEFAULT 'basic' CHECK (plan IN ('basic', 'pro')),
  is_verified boolean DEFAULT false,
  profile_views integer DEFAULT 0,
  total_clicks integer DEFAULT 0,
  invite_code_used text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$'),
  CONSTRAINT birth_year_valid CHECK (birth_year >= 1900 AND birth_year <= EXTRACT(YEAR FROM CURRENT_DATE))
);

-- Create social_links table
CREATE TABLE IF NOT EXISTS public.social_links (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL,
  username text NOT NULL,
  url text NOT NULL,
  followers_count integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, platform)
);

-- Create custom_links table
CREATE TABLE IF NOT EXISTS public.custom_links (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  url text NOT NULL,
  description text,
  icon text,
  clicks integer DEFAULT 0,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create showcase_items table
CREATE TABLE IF NOT EXISTS public.showcase_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  media_type text NOT NULL CHECK (media_type IN ('video', 'image')),
  media_url text NOT NULL,
  thumbnail_url text,
  platform text,
  external_url text,
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  event_data jsonb,
  ip_address inet,
  user_agent text,
  referrer text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create followers_history table
CREATE TABLE IF NOT EXISTS public.followers_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  social_link_id uuid REFERENCES public.social_links(id) ON DELETE CASCADE NOT NULL,
  followers_count integer NOT NULL,
  recorded_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON public.profiles(plan);
CREATE INDEX IF NOT EXISTS idx_social_links_user_id ON public.social_links(user_id);
CREATE INDEX IF NOT EXISTS idx_social_links_platform ON public.social_links(platform);
CREATE INDEX IF NOT EXISTS idx_custom_links_user_id ON public.custom_links(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_links_active ON public.custom_links(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_showcase_user_id ON public.showcase_items(user_id);
CREATE INDEX IF NOT EXISTS idx_showcase_featured ON public.showcase_items(user_id, is_featured);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON public.invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_active ON public.invite_codes(is_active);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showcase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followers_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- Social links policies
DROP POLICY IF EXISTS "Social links are viewable by everyone" ON public.social_links;
DROP POLICY IF EXISTS "Users can manage their own social links" ON public.social_links;

CREATE POLICY "Social links are viewable by everyone" ON public.social_links
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own social links" ON public.social_links
  FOR ALL USING (auth.uid() = user_id);

-- Custom links policies
DROP POLICY IF EXISTS "Custom links are viewable by everyone" ON public.custom_links;
DROP POLICY IF EXISTS "Users can manage their own custom links" ON public.custom_links;

CREATE POLICY "Custom links are viewable by everyone" ON public.custom_links
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own custom links" ON public.custom_links
  FOR ALL USING (auth.uid() = user_id);

-- Showcase items policies
DROP POLICY IF EXISTS "Showcase items are viewable by everyone" ON public.showcase_items;
DROP POLICY IF EXISTS "Users can manage their own showcase items" ON public.showcase_items;

CREATE POLICY "Showcase items are viewable by everyone" ON public.showcase_items
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own showcase items" ON public.showcase_items
  FOR ALL USING (auth.uid() = user_id);

-- Analytics policies
DROP POLICY IF EXISTS "Analytics events can be inserted by authenticated users" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.analytics_events;

CREATE POLICY "Analytics events can be inserted by authenticated users" ON public.analytics_events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view their own analytics" ON public.analytics_events
  FOR SELECT USING (auth.uid() = user_id);

-- Followers history policies
DROP POLICY IF EXISTS "Followers history is viewable by everyone" ON public.followers_history;
DROP POLICY IF EXISTS "System can manage followers history" ON public.followers_history;

CREATE POLICY "Followers history is viewable by everyone" ON public.followers_history
  FOR SELECT USING (true);

CREATE POLICY "System can manage followers history" ON public.followers_history
  FOR ALL USING (auth.role() = 'authenticated');

-- Invite codes policies
DROP POLICY IF EXISTS "Invite codes are viewable by everyone" ON public.invite_codes;

CREATE POLICY "Invite codes are viewable by everyone" ON public.invite_codes
  FOR SELECT USING (is_active = true);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS handle_updated_at ON public.social_links;
DROP TRIGGER IF EXISTS handle_updated_at ON public.custom_links;
DROP TRIGGER IF EXISTS handle_updated_at ON public.showcase_items;
DROP TRIGGER IF EXISTS handle_updated_at ON public.invite_codes;

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.social_links
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.custom_links
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.showcase_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.invite_codes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample invite codes
INSERT INTO public.invite_codes (code, plan_type, max_uses, is_active, expires_at) VALUES
  ('WELCOME2024', 'basic', 1000, true, '2025-12-31 23:59:59+00'),
  ('CREATOR2024', 'pro', 500, true, '2025-12-31 23:59:59+00'),
  ('TUMBUHIDE2024', 'pro', 100, true, '2025-06-30 23:59:59+00'),
  ('BETA2024', 'basic', 2000, true, '2025-12-31 23:59:59+00'),
  ('INFLUENCER2024', 'pro', 300, true, '2025-12-31 23:59:59+00')
ON CONFLICT (code) DO UPDATE SET
  plan_type = EXCLUDED.plan_type,
  max_uses = EXCLUDED.max_uses,
  is_active = EXCLUDED.is_active,
  expires_at = EXCLUDED.expires_at;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'TUMBUHIDE V3 DATABASE SETUP COMPLETED!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Tables created with correct column names';
  RAISE NOTICE 'Storage buckets: avatars, covers';
  RAISE NOTICE 'Sample invite codes: WELCOME2024, CREATOR2024, TUMBUHIDE2024';
  RAISE NOTICE 'All RLS policies and triggers are active';
  RAISE NOTICE 'Database is ready for production!';
  RAISE NOTICE '==============================================';
END $$;
