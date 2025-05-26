export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          email: string | null;
          avatar_url: string | null;
          cover_url: string | null;
          tagline: string | null;
          bio: string | null;
          location: string | null;
          birth_year: number | null;
          show_age: boolean | null;
          pronouns: string | null;
          niche: string | null;
          plan: string | null;
          is_verified: boolean | null;
          profile_views: number | null;
          total_clicks: number | null;
          invite_code_used: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          tagline?: string | null;
          bio?: string | null;
          location?: string | null;
          birth_year?: number | null;
          show_age?: boolean | null;
          pronouns?: string | null;
          niche?: string | null;
          plan?: string | null;
          is_verified?: boolean | null;
          profile_views?: number | null;
          total_clicks?: number | null;
          invite_code_used?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          tagline?: string | null;
          bio?: string | null;
          location?: string | null;
          birth_year?: number | null;
          show_age?: boolean | null;
          pronouns?: string | null;
          niche?: string | null;
          plan?: string | null;
          is_verified?: boolean | null;
          profile_views?: number | null;
          total_clicks?: number | null;
          invite_code_used?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      social_links: {
        Row: {
          id: string;
          user_id: string;
          platform: string;
          username: string;
          url: string;
          followers_count: number | null;
          is_verified: boolean | null;
          display_order: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          platform: string;
          username: string;
          url: string;
          followers_count?: number | null;
          is_verified?: boolean | null;
          display_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          platform?: string;
          username?: string;
          url?: string;
          followers_count?: number | null;
          is_verified?: boolean | null;
          display_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      custom_links: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          url: string;
          description: string | null;
          icon: string | null;
          clicks: number | null;
          is_active: boolean | null;
          display_order: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          url: string;
          description?: string | null;
          icon?: string | null;
          clicks?: number | null;
          is_active?: boolean | null;
          display_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          url?: string;
          description?: string | null;
          icon?: string | null;
          clicks?: number | null;
          is_active?: boolean | null;
          display_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      showcase_items: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          media_type: string;
          media_url: string;
          thumbnail_url: string | null;
          platform: string | null;
          external_url: string | null;
          views: number | null;
          likes: number | null;
          is_featured: boolean | null;
          display_order: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          media_type: string;
          media_url: string;
          thumbnail_url?: string | null;
          platform?: string | null;
          external_url?: string | null;
          views?: number | null;
          likes?: number | null;
          is_featured?: boolean | null;
          display_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          media_type?: string;
          media_url?: string;
          thumbnail_url?: string | null;
          platform?: string | null;
          external_url?: string | null;
          views?: number | null;
          likes?: number | null;
          is_featured?: boolean | null;
          display_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      analytics_events: {
        Row: {
          id: string;
          user_id: string;
          event_type: string;
          event_data: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          referrer: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: string;
          event_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: string;
          event_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          created_at?: string;
        };
      };
      analytics: {
        Row: {
          id: string;
          user_id: string;
          event_type: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: string;
          metadata?: Json | null;
          created_at?: string;
        };
      };
    };
  };
}
