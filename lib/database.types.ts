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
      instagram_analytics: {
        Row: {
          id: string;
          user_id: string;
          instagram_id: string;
          username: string;
          full_name: string | null;
          profile_pic_url: string | null;
          biography: string | null;
          external_url: string | null;
          follower_count: number | null;
          following_count: number | null;
          media_count: number | null;
          engagement_rate: number | null;
          is_private: boolean | null;
          is_verified: boolean | null;
          is_business_account: boolean | null;
          country: string | null;
          city: string | null;
          languages: Json | null;
          topics: Json | null;
          recent_posts: Json | null;
          cached_timestamp: number | null;
          last_post_at: number | null;
          auto_update_enabled: boolean;
          last_updated: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          instagram_id: string;
          username: string;
          full_name?: string | null;
          profile_pic_url?: string | null;
          biography?: string | null;
          external_url?: string | null;
          follower_count?: number | null;
          following_count?: number | null;
          media_count?: number | null;
          engagement_rate?: number | null;
          is_private?: boolean | null;
          is_verified?: boolean | null;
          is_business_account?: boolean | null;
          country?: string | null;
          city?: string | null;
          languages?: Json | null;
          topics?: Json | null;
          recent_posts?: Json | null;
          cached_timestamp?: number | null;
          last_post_at?: number | null;
          auto_update_enabled?: boolean;
          last_updated?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          instagram_id?: string;
          username?: string;
          full_name?: string | null;
          profile_pic_url?: string | null;
          biography?: string | null;
          external_url?: string | null;
          follower_count?: number | null;
          following_count?: number | null;
          media_count?: number | null;
          engagement_rate?: number | null;
          is_private?: boolean | null;
          is_verified?: boolean | null;
          is_business_account?: boolean | null;
          country?: string | null;
          city?: string | null;
          languages?: Json | null;
          topics?: Json | null;
          recent_posts?: Json | null;
          cached_timestamp?: number | null;
          last_post_at?: number | null;
          auto_update_enabled?: boolean;
          last_updated?: string;
          created_at?: string;
        };
      };
      tiktok_analytics: {
        Row: {
          id: string;
          user_id: string;
          tiktok_uid: string;
          unique_id: string;
          nickname: string | null;
          avatar: string | null;
          signature: string | null;
          region: string | null;
          region_name: string | null;
          verify_type: string | null;
          account_type: string | null;
          category_name: string | null;
          follower_count: number | null;
          follower_count_show: string | null;
          region_rank: number | null;
          region_rank_show: string | null;
          category_rank: number | null;
          category_rank_show: string | null;
          video_28_avg_play_count: number | null;
          video_28_avg_play_count_show: string | null;
          video_28_avg_interaction_count: number | null;
          video_28_avg_interaction_count_show: string | null;
          aweme_28_count: number | null;
          aweme_28_count_show: string | null;
          aweme_total_count: number | null;
          aweme_total_count_show: string | null;
          aweme_play_count: number | null;
          aweme_play_count_show: string | null;
          aweme_avg_play_count: number | null;
          aweme_avg_play_count_show: string | null;
          aweme_avg_interaction_rate: string | null;
          aweme_avg_interaction_rate_show: string | null;
          auto_update_enabled: boolean;
          last_updated: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tiktok_uid: string;
          unique_id: string;
          nickname?: string | null;
          avatar?: string | null;
          signature?: string | null;
          region?: string | null;
          region_name?: string | null;
          verify_type?: string | null;
          account_type?: string | null;
          category_name?: string | null;
          follower_count?: number | null;
          follower_count_show?: string | null;
          region_rank?: number | null;
          region_rank_show?: string | null;
          category_rank?: number | null;
          category_rank_show?: string | null;
          video_28_avg_play_count?: number | null;
          video_28_avg_play_count_show?: string | null;
          video_28_avg_interaction_count?: number | null;
          video_28_avg_interaction_count_show?: string | null;
          aweme_28_count?: number | null;
          aweme_28_count_show?: string | null;
          aweme_total_count?: number | null;
          aweme_total_count_show?: string | null;
          aweme_play_count?: number | null;
          aweme_play_count_show?: string | null;
          aweme_avg_play_count?: number | null;
          aweme_avg_play_count_show?: string | null;
          aweme_avg_interaction_rate?: string | null;
          aweme_avg_interaction_rate_show?: string | null;
          auto_update_enabled?: boolean;
          last_updated?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tiktok_uid?: string;
          unique_id?: string;
          nickname?: string | null;
          avatar?: string | null;
          signature?: string | null;
          region?: string | null;
          region_name?: string | null;
          verify_type?: string | null;
          account_type?: string | null;
          category_name?: string | null;
          follower_count?: number | null;
          follower_count_show?: string | null;
          region_rank?: number | null;
          region_rank_show?: string | null;
          category_rank?: number | null;
          category_rank_show?: string | null;
          video_28_avg_play_count?: number | null;
          video_28_avg_play_count_show?: string | null;
          video_28_avg_interaction_count?: number | null;
          video_28_avg_interaction_count_show?: string | null;
          aweme_28_count?: number | null;
          aweme_28_count_show?: string | null;
          aweme_total_count?: number | null;
          aweme_total_count_show?: string | null;
          aweme_play_count?: number | null;
          aweme_play_count_show?: string | null;
          aweme_avg_play_count?: number | null;
          aweme_avg_play_count_show?: string | null;
          aweme_avg_interaction_rate?: string | null;
          aweme_avg_interaction_rate_show?: string | null;
          auto_update_enabled?: boolean;
          last_updated?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
